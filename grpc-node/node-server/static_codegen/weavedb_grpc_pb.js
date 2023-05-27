// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var weavedb_pb = require('./weavedb_pb.js');

function serialize_weavedb_WeaveDBReply(arg) {
  if (!(arg instanceof weavedb_pb.WeaveDBReply)) {
    throw new Error('Expected argument of type weavedb.WeaveDBReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_weavedb_WeaveDBReply(buffer_arg) {
  return weavedb_pb.WeaveDBReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_weavedb_WeaveDBRequest(arg) {
  if (!(arg instanceof weavedb_pb.WeaveDBRequest)) {
    throw new Error('Expected argument of type weavedb.WeaveDBRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_weavedb_WeaveDBRequest(buffer_arg) {
  return weavedb_pb.WeaveDBRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var DBService = exports.DBService = {
  query: {
    path: '/weavedb.DB/query',
    requestStream: false,
    responseStream: false,
    requestType: weavedb_pb.WeaveDBRequest,
    responseType: weavedb_pb.WeaveDBReply,
    requestSerialize: serialize_weavedb_WeaveDBRequest,
    requestDeserialize: deserialize_weavedb_WeaveDBRequest,
    responseSerialize: serialize_weavedb_WeaveDBReply,
    responseDeserialize: deserialize_weavedb_WeaveDBReply,
  },
};

exports.DBClient = grpc.makeGenericClientConstructor(DBService);
