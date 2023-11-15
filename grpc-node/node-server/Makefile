
DOCKER := $(shell which docker)

.PHONY: build
build:
	$(DOCKER) build  --platform linux/amd64  -f standalone.Dockerfile . -t weavedb-node-server  
	$(DOCKER) tag weavedb-node-server weavedb-node-server:latest
	$(DOCKER) tag weavedb-node-server rakd/weavedb-node-server
	$(DOCKER) tag weavedb-node-server rakd/weavedb-node-server:latest
.PHONY: up

.PHONY: up
up:
	$(DOCKER) push rakd/weavedb-node-server

.PHONY: docker-build
docker-build: 
	sudo $(DOCKER) compose build 

.PHONY: run
run:
	$(DOCKER) run -it local-envoy /bin/zsh	

.PHONY: compose-up
compose-up:
	sudo $(DOCKER) compose up 

.PHONY: compose-down
compose-down:
	sudo $(DOCKER) compose down 

.PHONY: compose-run
compose-run:
	sudo $(DOCKER) compose run -i /bin/zsh 
	


