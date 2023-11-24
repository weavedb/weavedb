#!/bin/sh
set -e

echo "Generating envoy.yaml config file..."

ADDITIONAL_NODE_JSON_STR=${ADDITIONAL_NODE_JSON_STR}

cat /weavedb-explorer/lib/nodes.tmpl.js | \
  /bin/sed -e "s/\$ADDITIONAL_NODE_JSON_STR/$ADDITIONAL_NODE_JSON_STR/g" \
  > /weavedb-explorer/lib/nodes.js

cd /weavedb-explorer ; /usr/local/bin/yarn dev