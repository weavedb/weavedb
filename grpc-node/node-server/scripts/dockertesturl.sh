#!/bin/sh

STATUSCODE=$(curl -s -o /dev/null -w "%{http_code}" $1)
if test $STATUSCODE -eq 500; then
  echo "error: server return 500"
  exit 1
elif test $STATUSCODE -eq 000; then
  echo "error: server return 000"
  exit 1
else
  echo "server runs okay, statuscode: "$STATUSCODE
fi
