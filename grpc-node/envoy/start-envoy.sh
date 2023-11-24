#!/bin/sh
set -e

echo "Generating envoy.yaml config file..."

LISTEN_PORT=${LISTEN_PORT:-8080}
ADMIN_LISTEN_PORT=${ADMIN_LISTEN_PORT:-9901}
SERVICE_DISCOVERY_ADDRESS=${SERVICE_DISCOVERY_ADDRESS:-0.0.0.0}
SERVICE_DISCOVERY_PORT=${SERVICE_DISCOVERY_PORT:-9090}

cat /root/envoy.tmpl.yaml | \
  /bin/sed -e "s/\$LISTEN_PORT/$LISTEN_PORT/g" | \
  /bin/sed -e "s/\$ADMIN_LISTEN_PORT/$ADMIN_LISTEN_PORT/g" | \
  /bin/sed -e "s/\$SERVICE_DISCOVERY_PORT/$SERVICE_DISCOVERY_PORT/g" | \
  /bin/sed -e "s/\$SERVICE_DISCOVERY_ADDRESS/$SERVICE_DISCOVERY_ADDRESS/g" \
  > /root/envoy.yaml

/usr/local/bin/envoy -c /root/envoy.yaml


