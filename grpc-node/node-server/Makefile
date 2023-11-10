
DOCKER := $(shell which docker)

.PHONY: build
build:
	sudo $(DOCKER) build . -t weavedb-node-server
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
	


