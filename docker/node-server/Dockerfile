#FROM node:16.19.0-alpine
FROM amd64/node:16-alpine


RUN apk update
RUN apk upgrade


RUN apk add openssh
RUN apk add vim
RUN apk add bash
RUN apk add runit

WORKDIR /app
COPY ./ /app
RUN npm install 

EXPOSE 9090

RUN mkdir -p /etc/service/weavedb-node 
RUN /bin/sh -c "echo -e '"'#!/bin/sh\ncd /app\nexec npm run start  \n'"' > /etc/service/weavedb-node/run" \
    && chmod +x /etc/service/weavedb-node/run

CMD ["runsvdir", "/etc/service"]



