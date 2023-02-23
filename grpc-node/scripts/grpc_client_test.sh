#!/usr/bin/env ruby

# ref: https://github.com/vadimi/grpc-client-cli

ret =`echo '{"method": "get@1gU_EmELb5-sqqlURuBQFCD0HTlBxHLLZhUojIXxj78","query": "[\"test_doc2\", 1]","nocache": false}' |   grpc-client-cli -service weavedb.DB -method query --proto ./node-server/weavedb.proto  localhost:8080 `
if /.*[disconnect|reset|termination]+.*$/.match(ret) 
  p "gRPC error"
  exit(1)
else 
  p "okay"
  p JSON.parse(ret)
  exit(0)
end
