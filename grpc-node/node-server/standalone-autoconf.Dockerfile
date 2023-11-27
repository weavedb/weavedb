FROM amd64/node:18.13.0-alpine

RUN apk add zsh
RUN npm install -g weavedb-tools
WORKDIR /weavedb-rollups

RUN weavedb create weavedb_project
WORKDIR /weavedb-rollups/weavedb_project
RUN yarn keygen admin
RUN yarn keygen owner
RUN yarn keygen user
RUN yarn keygen bundler -t ar
RUN yarn accounts > accounts.txt
RUN cat accounts.txt | grep admin | awk '{print $2}' > accounts_admin.txt
RUN cat accounts.txt | grep owner| awk '{print $2}' > accounts_owner.txt
RUN cat accounts.txt | grep user| awk '{print $2}' > accounts_user.txt
RUN cat accounts.txt | grep bundler| awk '{print $2}' > accounts_bundler.txt


COPY ./ /weavedb
WORKDIR /weavedb
#RUN yarn




# EXPOSE 9090

# RUN chmod +x /weavedb/start-node-starndalone.sh

# ENTRYPOINT ["/root/start-node-starndalone-autoconf.sh"]
