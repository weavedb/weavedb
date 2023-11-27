
DOCKER := $(shell which docker)

.PHONY: build
build:
	$(DOCKER) build  --platform linux/amd64  -f standalone.Dockerfile . -t weavedb-node-server  
	$(DOCKER) tag weavedb-node-server weavedb-node-server:latest
	$(DOCKER) tag weavedb-node-server rakd/weavedb-node-server
	$(DOCKER) tag weavedb-node-server rakd/weavedb-node-server:latest

.PHONY: build2
build2:
	$(DOCKER) build  --platform linux/amd64  -f standalone-autoconf.Dockerfile . -t weavedb-node-server-autoconf
	$(DOCKER) tag weavedb-node-server-autoconf rakd/weavedb-node-server:autoconf
	
.PHONY: push
push:
	$(DOCKER) push rakd/weavedb-node-server
	$(DOCKER) push rakd/weavedb-node-server:autoconf

.PHONY: docker-build
docker-build: 
	sudo $(DOCKER) compose build 

.PHONY: run
run:
	$(DOCKER) run -it weavedb-node-server /bin/zsh	

.PHONY: run2
run2:
	$(DOCKER) run -it weavedb-node-server-autoconf /bin/zsh	

.PHONY: compose-up
compose-up:
	sudo $(DOCKER) compose up 

.PHONY: compose-down
compose-down:
	sudo $(DOCKER) compose down 

.PHONY: compose-run
compose-run:
	sudo $(DOCKER) compose run -i /bin/zsh 
	


