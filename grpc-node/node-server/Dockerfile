FROM node:16.19.0-alpine
COPY ./ /weavedb

WORKDIR /weavedb

RUN npm install

EXPOSE 9090
CMD ["node", "server.js"]
