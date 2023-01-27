compose: 
	DOCKER_BUILDKIT=0 docker-compose build
run: 
	docker-compose up 
build-node:
	docker build  --platform linux/amd64 ./node-server -t weavedb/node-server 
run-node:
	docker run -p 9090:9090 -it weavedb/node-server /bin/bash
build-envoy:
	docker build  --platform linux/amd64 ./node-server -t weavedb/envoy 
run-envoy:
	docker run -p 8080:8080 -it weavedb/envoy /bin/bash

