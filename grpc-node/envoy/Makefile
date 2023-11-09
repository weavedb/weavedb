build:
	docker build -t local-envoy . 
run:
	docker run -it local-envoy /bin/zsh
	
.PHONY: compose-run
compose-run:
	sudo docker-compose -f docker-compose.yaml up --build
.PHONY: compose-build
compose-build:
	sudo docker-compose  -f docker-compose.yaml build
	
compose-exec:
	sudo docker-compose exec  envoy /bin/zsh
	
