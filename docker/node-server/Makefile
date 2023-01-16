compose: 
	DOCKER_BUILDKIT=0 docker-compose build
run: 
	docker-compose up 
build-node:
	docker build  --platform linux/amd64 . -t weavedb/node-server 
	# docker build   . -t weavedb/node-server 
run-node:
	docker run -it weavedb/node-server /bin/bash
build-envoy:
	docker build  --platform linux/amd64 . -t weavedb/envoy -f Dockerfile.envoy
run-envoy:
	docker run -it weavedb/envoy /bin/bash

