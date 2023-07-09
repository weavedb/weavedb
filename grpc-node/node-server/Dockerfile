FROM amd64/node:18.13.0-alpine
WORKDIR /weavedb

COPY package.json yarn.lock /weavedb/
RUN yarn

COPY . /weavedb

EXPOSE 9090

CMD ["node", "server.js"]
