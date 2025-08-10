#!/bin/bash
# monitor_weavedb_group.sh - Kills entire process group

MAX_MEM_MB=${1:-1800}
CHECK_INTERVAL=${2:-10}
HYPERBEAM_DIR="$(dirname "$(dirname "${BASH_SOURCE[0]}")")/HyperBEAM"

echo "========================================"
echo "WeaveDB Monitor (Process Group Kill)"
echo "Memory limit: ${MAX_MEM_MB}MB"
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
    exit 0
}

trap cleanup EXIT SIGINT SIGTERM

while true; do
    echo "$(date): Starting WeaveDB..."
    
    cd "$HYPERBEAM_DIR"
    
    # Start in new process group with setsid
    setsid rebar3 as weavedb shell --eval 'hb:start_mainnet(#{ port => 10001, priv_key_location => <<".wallet.json">> })' &
    CHILD_PID=$!
    
    echo "$(date): Started process group with leader PID: $CHILD_PID"
    
    while kill -0 $CHILD_PID 2>/dev/null; do
        MEM_KB=$(ps -o rss= -p $CHILD_PID 2>/dev/null | tr -d ' ')
        
        if [ -n "$MEM_KB" ] && [ "$MEM_KB" -gt 0 ]; then
            MEM_MB=$((MEM_KB / 1024))
            echo "$(date): Memory: ${MEM_MB}MB / ${MAX_MEM_MB}MB"
            
            if [ $MEM_MB -gt $MAX_MEM_MB ]; then
                echo "$(date): Memory limit exceeded! Killing process group..."
                
                # Kill entire process group
                kill -KILL -$CHILD_PID 2>/dev/null
                break
            fi
        fi
        
        sleep $CHECK_INTERVAL
    done
    
    # Ensure everything is dead
    kill -KILL -$CHILD_PID 2>/dev/null
    
    echo "$(date): Restarting in 10 seconds..."
    sleep 10
done
