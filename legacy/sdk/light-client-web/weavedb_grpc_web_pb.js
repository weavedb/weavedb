/**
 * @fileoverview gRPC-Web generated client stub for weavedb
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.weavedb = require('./weavedb_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.weavedb.DBClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.weavedb.DBPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.weavedb.WeaveDBRequest,
 *   !proto.weavedb.WeaveDBReply>}
 */
const methodDescriptor_DB_query = new grpc.web.MethodDescriptor(
  '/weavedb.DB/query',
  grpc.web.MethodType.UNARY,
  proto.weavedb.WeaveDBRequest,
  proto.weavedb.WeaveDBReply,
  /**
   * @param {!proto.weavedb.WeaveDBRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.weavedb.WeaveDBReply.deserializeBinary
);


/**
 * @param {!proto.weavedb.WeaveDBRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.weavedb.WeaveDBReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.weavedb.WeaveDBReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.weavedb.DBClient.prototype.query =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/weavedb.DB/query',
      request,
      metadata || {},
      methodDescriptor_DB_query,
      callback);
};


/**
 * @param {!proto.weavedb.WeaveDBRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.weavedb.WeaveDBReply>}
 *     Promise that resolves to the response
 */
proto.weavedb.DBPromiseClient.prototype.query =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/weavedb.DB/query',
      request,
      metadata || {},
      methodDescriptor_DB_query);
};


module.exports = proto.weavedb;

