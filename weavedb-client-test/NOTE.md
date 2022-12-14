



ref: https://docs.oracle.com/cd/E17952_01/mysql-8.0-ja/creating-ssl-files-using-openssl.html



openssl genrsa 2048 > ca-key.pem
openssl req -new -x509 -nodes -days 3600 -key ca-key.pem -out ca.pem



openssl req -newkey rsa:2048 -days 3600 -nodes -keyout client-key.pem -out client-req.pem
openssl rsa -in client-key.pem -out client-key.pem
openssl x509 -req -in client-req.pem -days 3600  -CA ca.pem -CAkey ca-key.pem -set_serial 01 -out client-cert.pem



https://blog.turbinelabs.io/setting-up-ssl-with-envoy-f7c5aa06a5ce

https://lightrun.com/answers/grpc-grpc-web-example-of-envoy-with-https-connection-to-grpc-backend

