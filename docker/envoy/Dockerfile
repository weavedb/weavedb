FROM envoyproxy/envoy:v1.22.0
# FROM envoyproxy/envoy-alpine

WORKDIR /etc/envoy/
COPY envoy.yaml /etc/envoy/envoy.yaml

ENTRYPOINT [ "/usr/local/bin/envoy" ]
CMD [ "-c /etc/envoy/envoy.yaml", "-l trace", "--log-path /tmp/envoy_info.log" ]
