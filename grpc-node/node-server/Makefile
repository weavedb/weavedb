build: 
	docker build . -t weavedb/weavedb-node-server 
run: 
	docker container rm -f node-server
	docker run  --env CONTRACT_TX_ID=SMVDZ9jRXO7Kb88D4rByayB3HbwzXYzzbaPJ9DnrB_s --name node-server  -p 9090:9090 -t weavedb/weavedb-node-server 
push: 
	docker tag weavedb/weavedb-node-server 0xkaz/weavedb-node-server
	docker push 0xkaz/weavedb-node-server


