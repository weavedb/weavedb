build:
	docker build -f node-server/standalone.Dockerfile ./node-server -t weavedb-node-server
	docker tag weavedb-node-server rakd/weavedb-node-server
	docker-compose  -f docker-compose-standalone.yml build
build-without-sync:
	docker-compose  -f docker-compose-standalone-without-sync.yml build

build-images:
	docker-compose  -f docker-compose-standalone-images.yml build



up-without-sync-with-build:
	docker-compose -f docker-compose-standalone-without-sync.yml up --build 

down-without-sync-with-build:
	docker-compose -f docker-compose-standalone-without-sync.yml down
	rm -rf ./node-server/cache

up-with-build:
	docker-compose -f docker-compose-standalone.yml up --build 

exec :
	docker-compose  -f docker-compose-standalone.yml exec node-server /bin/sh

down-with-build:
	docker-compose -f docker-compose-standalone.yml down
	rm -rf ./node-server/cache


### 

up-images:
	docker-compose -f docker-compose-standalone-images.yml up

exec-images-node-server :
	docker-compose  -f docker-compose-standalone-images.yml exec node-server /bin/sh

exec-images-envoy :
	docker-compose  -f docker-compose-standalone-images.yml exec envoy /bin/sh

down-images:
	docker-compose -f docker-compose-standalone-images.yml down
	rm -rf ./node-server/cache



