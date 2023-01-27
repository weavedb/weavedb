build: 
	docker build . -t weavedb/weavedb-envoy 
run: 
	docker container rm -f envoy
	docker run --name envoy --link node-server:node-server -p 8080:8080 -t weavedb/weavedb-envoy 

run-without-link:
	docker container rm -f weavedb-envoy 
	docker run --name weavedb-envoy   -p 8080:8080 -t weavedb/weavedb-envoy  

push: 
	docker tag weavedb/weavedb-envoy  0xkaz/weavedb-envoy 
	docker push 0xkaz/weavedb-envoy


