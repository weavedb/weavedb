#!/bin/bash
# monitor_weavedb_group.sh - Keeps WeaveDB running with memory monitoring

COMMAND=${1:-start}
MAX_MEM_MB=${2:-5000}
CHECK_INTERVAL=${3:-10}

# Determine the correct HyperBEAM directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env.hyperbeam if it exists
if [ -f "$SCRIPT_DIR/.env.hyperbeam" ]; then
    echo "Loading environment from .env.hyperbeam..."
    set -a  # automatically export all variables
    source "$SCRIPT_DIR/.env.hyperbeam"
    set +a
fi

if [ -d "$SCRIPT_DIR/HyperBEAM" ]; then
    HYPERBEAM_DIR="$SCRIPT_DIR/HyperBEAM"
elif [ -d "/home/basque/dev/weavedb/HyperBEAM" ]; then
    HYPERBEAM_DIR="/home/basque/dev/weavedb/HyperBEAM"
else
    # Try relative path from current location
    HYPERBEAM_DIR="./HyperBEAM"
fi

# Override with CWD from .env if set
if [ -n "$CWD" ]; then
    HYPERBEAM_DIR="$SCRIPT_DIR/$CWD"
fi

if [ ! -d "$HYPERBEAM_DIR" ]; then
    echo "Error: Cannot find HyperBEAM directory!"
    echo "Searched in: $SCRIPT_DIR/HyperBEAM, /home/basque/dev/weavedb/HyperBEAM, and ./HyperBEAM"
    exit 1
fi

WEAVEDB_URL="http://localhost:10001/~weavedb@1.0/$COMMAND"
MAX_WAIT_TIME=180  # Maximum seconds to wait for service to be ready

echo "========================================"
echo "WeaveDB Monitor (Process Group Kill)"
echo "Command: $COMMAND"
echo "Memory limit: ${MAX_MEM_MB}MB"
echo "Using HyperBEAM directory: $HYPERBEAM_DIR"
if [ -n "$CC" ]; then
    echo "CC: $CC"
fi
if [ -n "$CXX" ]; then
    echo "CXX: $CXX"
fi
echo "========================================"

# Kill entire process group on exit
cleanup() {
    echo "$(date): Cleaning up process group..."
    if [ -n "$CHILD_PID" ]; then
	# Kill the entire process group (negative PID)
	kill -TERM -$CHILD_PID 2>/dev/null
	sleep 2
	kill -KILL -$CHILD_PID 2>/dev/null
    fi
    # Kill any remaining beam.smp processes on port 10001
    lsof -ti:10001 | xargs -r kill -9 2>/dev/null
    exit 0
}

# Function to wait for service and ping start endpoint
wait_and_ping_service() {
    local waited=0

    echo "$(date): Waiting for WeaveDB to be ready on port 10001..."

    # Give it a few seconds to start up initially
    sleep 3

    while [ $waited -lt $MAX_WAIT_TIME ]; do
	# Try multiple methods to check if port is open
	port_open=false

	# Method 1: Try curl directly
	if curl -s --connect-timeout 1 -o /dev/null "http://localhost:10001" 2>/dev/null; then
	    port_open=true
	    # Method 2: Try nc if available
	elif command -v nc >/dev/null 2>&1 && nc -z localhost 10001 2>/dev/null; then
	    port_open=true
	    # Method 3: Check with lsof
	elif lsof -i:10001 2>/dev/null | grep -q LISTEN; then
	    port_open=true
	fi

	if [ "$port_open" = true ]; then
	    echo "$(date): Port 10001 is open, pinging WeaveDB $COMMAND endpoint..."

	    # Try to ping the start endpoint and check for {"status":true}
	    response=$(curl -s --connect-timeout 5 "$WEAVEDB_URL" 2>/dev/null)
	    http_code=$(curl -s --connect-timeout 5 -o /dev/null -w "%{http_code}" "$WEAVEDB_URL" 2>/dev/null)

	    if [ -n "$response" ]; then
		echo "$(date): Response: $response (HTTP $http_code)"
	    else
		echo "$(date): HTTP Code: $http_code (empty response)"
	    fi

	    # Check if response contains {"status":true}
	    if [[ "$response" == *'"status":true'* ]]; then
		echo "$(date): ✓ Successfully started WeaveDB! Got {\"status\":true}"
		return 0
	    elif [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
		echo "$(date): ⚠ Got HTTP $http_code but unexpected response: $response"
		echo "$(date): Retrying in 3 seconds..."
		sleep 3

		# Second attempt
		response=$(curl -s --connect-timeout 5 "$WEAVEDB_URL" 2>/dev/null)
		if [[ "$response" == *'"status":true'* ]]; then
		    echo "$(date): ✓ Successfully started WeaveDB on retry! Got {\"status\":true}"
		    return 0
		else
		    echo "$(date): ⚠ Unexpected response on retry: $response"
		    echo "$(date): WeaveDB may not be fully initialized, continuing anyway..."
		    return 0
		fi
	    else
		echo "$(date): WeaveDB is starting but endpoint not ready yet (HTTP $http_code)"
		# Don't return, keep trying
	    fi
	else
	    # Show what's listening on ports to help debug
	    if [ $((waited % 10)) -eq 0 ]; then
		echo "$(date): Port 10001 not open yet. Checking what's listening..."
		lsof -i:10001 2>/dev/null | head -3
	    fi
	fi

	sleep 2
	waited=$((waited + 2))
	echo "$(date): Waiting for service to start... ($waited/$MAX_WAIT_TIME seconds)"
    done

    echo "$(date): ⚠ Warning: Service did not become ready within $MAX_WAIT_TIME seconds"
    echo "$(date): Checking if beam.smp is running..."
    ps aux | grep -E "beam.smp" | grep -v grep
    return 1
}

trap cleanup EXIT SIGINT SIGTERM

while true; do
    echo "$(date): Starting WeaveDB..."

    cd "$HYPERBEAM_DIR" || exit 1

    # Create a named pipe for keeping the shell alive
    PIPE_FILE="/tmp/weavedb_pipe_$$"
    mkfifo "$PIPE_FILE"

    # Start rebar3 with input from the pipe to keep it alive
    # Using setsid to create new process group
    # Export environment variables for the child process
    setsid bash -c "export CC='$CC' CXX='$CXX' CMAKE_POLICY_VERSION_MINIMUM='$CMAKE_POLICY_VERSION_MINIMUM' && cd '$HYPERBEAM_DIR' && exec rebar3 as weavedb shell --eval 'hb:start_mainnet(#{ port => 10001, priv_key_location => <<\".wallet.json\">>, bundler_ans104 => false, bundler_httpsig => <<\"http://localhost:4001\">> })' < '$PIPE_FILE'" &    
    CHILD_PID=$!

    # Keep the pipe open
    exec 3>"$PIPE_FILE"

    echo "$(date): Started process group with leader PID: $CHILD_PID"

    # Wait for service to be ready and ping start endpoint
    wait_and_ping_service

    # Monitor memory usage
    while kill -0 $CHILD_PID 2>/dev/null; do
	# Try multiple methods to find beam.smp process
	# Method 1: Find process on port 10001
	BEAM_PIDS=$(lsof -ti:10001 2>/dev/null | head -1)

	if [ -z "$BEAM_PIDS" ]; then
	    # Method 2: Find any beam.smp process
	    BEAM_PIDS=$(pgrep beam.smp | head -1)
	fi

	if [ -z "$BEAM_PIDS" ]; then
	    # Method 3: Find beam.smp child of our shell
	    BEAM_PIDS=$(pgrep -P $CHILD_PID beam.smp 2>/dev/null)
	fi

	if [ -n "$BEAM_PIDS" ]; then
	    # Get memory for all beam.smp processes found
	    MEM_KB=$(ps -o rss= -p $BEAM_PIDS 2>/dev/null | awk '{sum+=$1} END {print sum}')

	    if [ -n "$MEM_KB" ] && [ "$MEM_KB" -gt 0 ]; then
		MEM_MB=$((MEM_KB / 1024))
		echo "$(date): Beam Memory: ${MEM_MB}MB / ${MAX_MEM_MB}MB (PID: $BEAM_PIDS)"

		if [ $MEM_MB -gt $MAX_MEM_MB ]; then
		    echo "$(date): Memory limit exceeded! Killing process group..."

		    # Kill entire process group
		    kill -KILL -$CHILD_PID 2>/dev/null
		    # Also kill beam.smp directly
		    kill -KILL $BEAM_PIDS 2>/dev/null
		    # Kill anything on the port
		    lsof -ti:10001 | xargs -r kill -9 2>/dev/null
		    break
		fi
	    else
		echo "$(date): Warning: Could not get memory info for beam.smp PID $BEAM_PIDS"
	    fi
	else
	    # Can't find beam.smp - this shouldn't happen if service is running
	    echo "$(date): Warning: Cannot find beam.smp process!"
	    echo "$(date): Checking what processes are running..."

	    # Show diagnostic info
	    echo "$(date): Processes on port 10001:"
	    lsof -i:10001 2>/dev/null

	    echo "$(date): Beam processes:"
	    ps aux | grep beam | grep -v grep

	    # Check if the shell is still alive at least
	    if kill -0 $CHILD_PID 2>/dev/null; then
		echo "$(date): Shell process $CHILD_PID is still alive but beam.smp not found"
	    else
		echo "$(date): Shell process $CHILD_PID has died"
		break
	    fi
	fi

	sleep $CHECK_INTERVAL
    done

    # Cleanup
    exec 3>&-  # Close the pipe
    rm -f "$PIPE_FILE"

    # Ensure everything is dead
    kill -KILL -$CHILD_PID 2>/dev/null
    lsof -ti:10001 | xargs -r kill -9 2>/dev/null

    echo "$(date): Restarting in 10 seconds..."
    sleep 10
done
