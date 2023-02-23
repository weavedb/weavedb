#!/bin/sh


RET=`docker-compose ps | grep "exited (1)" | wc -l `
# echo $RET
if test $RET -eq 0; then
  echo "okay"
  exit 0
elif test $RET -eq 1; then
  echo "exited error "
  exit 1
else
  echo $RET
  echo `docker-compose ps | grep exited`
  echo "exited error. some containers might have problems."
fi