FROM node:16.19.0-alpine AS copy-and-build
WORKDIR /
COPY ./net ./weavedb

WORKDIR /weavedb/grpc/gateway/weavedb/node-server

RUN npm install

EXPOSE 9090
CMD ["node", "server.js"]
