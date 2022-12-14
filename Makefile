
build: 
	yarn 
	yarn generate
	yarn deploy 
	cd weavedb-node ; docker-compose build 
run: 
	cd weavedb-node; docker-compose up 

daemon: 
	cd weavedb-node; docker-compose up -d 
