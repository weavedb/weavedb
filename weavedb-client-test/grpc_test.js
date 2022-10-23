

const PROTO_PATH = "../weavedb-node/weavedb.proto"

import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'

var packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {keepCase: true,
         longs: String,
         enums: String,
         defaults: true,
         oneofs: true
        });
var weavedb = grpc.loadPackageDefinition(packageDefinition).weavedb;
    

// var client = new weavedb.DB('localhost:9090',
var client = new weavedb.DB('localhost:9090',
        grpc.credentials.createInsecure());

client.sayHello({name: 'you'}, function(err, response) {
        console.log('Greeting:', response.message);
});

client.ping({}, function(err, response) {
        console.log('ping response:', response.message);
});

// client.query({method: "", query:"", nocache:"" }, function(err, response) {
//         console.log('query response:', response.message);
// });
