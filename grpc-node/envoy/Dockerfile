FROM envoyproxy/envoy-alpine:v1.21.6
RUN apk add zsh vim 

COPY conf/envoy.yaml /etc/envoy/envoy.yaml

CMD [ "/usr/local/bin/envoy", "-c", "/etc/envoy/envoy.yaml" ]
