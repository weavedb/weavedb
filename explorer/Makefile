
build:
	docker build . --platform linux/amd64  -t weavedb-explorer
	docker tag weavedb-explorer rakd/weavedb-explorer
up:
	docker-compose up 
exec:
	docker-compose exec -it explorer /bin/sh
run: 
	docker run -it weavedb-explorer /bin/zsh
prune:
	docker system prune
