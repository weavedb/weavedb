build: 
	docker build . -t weavedb/envoy 
run: 
	docker container rm -f envoy
	docker run --name envoy --link node-server:node-server -p 8080:8080 -t weavedb/envoy 
# run-with-link:
# 	docker container rm -f envoy
# 	docker run --name envoy --link node-server:node-server -p 8080:8080 -t weavedb/envoy 
run-without-link:
	docker container rm -f envoy
	docker run --name envoy  -p 8080:8080 -t weavedb/envoy 
