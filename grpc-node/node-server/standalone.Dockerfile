FROM amd64/node:18.13.0-alpine

COPY ./ /weavedb

WORKDIR /weavedb
RUN yarn

EXPOSE 9090


RUN chmod +x /weavedb/start-node-starndalone.sh

ENTRYPOINT ["/root/start-node-starndalone.sh"]
