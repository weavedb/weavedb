
DOCKER := $(shell which docker)


.PHONY: build
build:
	sudo $(DOCKER) build -t local-envoy . 
.PHONY: run
run:
	$(DOCKER) run -it local-envoy /bin/zsh	
.PHONY: compose-run
compose-run:
	sudo $(DOCKER) compose -f docker-compose.yaml up --build

.PHONY: compose-build
compose-build:
	sudo $(DOCKER) compose  -f docker-compose.yaml build
	
compose-exec:
	sudo $(DOCKER) compose exec  envoy /bin/zsh
	

