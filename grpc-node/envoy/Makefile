
DOCKER := $(shell which docker)


.PHONY: build
build:
	$(DOCKER) build -t local-envoy . 
	$(DOCKER) tag local-envoy rakd/weavedb-envoy
.PHONY: push
push:
	$(DOCKER) push rakd/weavedb-envoy
.PHONY: run
run:
	$(DOCKER) run -it local-envoy /bin/zsh	
.PHONY: compose-run
compose-run:
	$(DOCKER) compose -f docker-compose.yaml up --build

.PHONY: compose-build
compose-build:
	$(DOCKER) compose  -f docker-compose.yaml build
	
compose-exec:
	$(DOCKER) compose exec  envoy /bin/zsh
	

