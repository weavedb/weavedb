FROM amd64/node:18.13.0-alpine
RUN apk add vim zsh make 

COPY ./ /weavedb-explorer

WORKDIR /weavedb-explorer
RUN touch /weavedb-explorer/yarn-error.log
# RUN npm install
RUN /usr/local/bin/yarn 

EXPOSE 3000

CMD ["/usr/local/bin/yarn", "dev"]
# CMD [ "/usr/local/bin/envoy", "-c", "/etc/envoy/envoy.yaml" ]
