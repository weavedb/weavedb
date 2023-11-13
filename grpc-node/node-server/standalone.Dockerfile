FROM amd64/node:18.13.0-alpine

COPY ./ /weavedb

WORKDIR /weavedb
RUN echo "module.exports = {}" >> /weavedb/weavedb.config.js
RUN echo "module.exports = {}" >> /weavedb/weavedb.standalone.config.js

RUN yarn

EXPOSE 9090

CMD ["yarn", "pm2", "start", "standalone-mp.js", "--no-daemon"]
