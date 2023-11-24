FROM envoyproxy/envoy-alpine:v1.21.6
RUN apk add zsh vim sed

WORKDIR /root 
COPY envoy.tmpl.yaml /root/envoy.tmpl.yaml

COPY start-envoy.sh /root/start-envoy.sh
RUN chmod +x /root/start-envoy.sh

ENTRYPOINT ["/root/start-envoy.sh"]
