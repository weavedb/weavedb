build: 
	docker build . -t weavedb/node-server 
run: 
	docker container rm -f node-server
	docker run  --name node-server  -p 9090:9090 -t weavedb/node-server 

