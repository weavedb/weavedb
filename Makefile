
include env.mk
_DATE := $(shell date +%Y-%m-%d-%H-%M-%S)

build:
	docker build ./grpc-node/node-server/ -t $(_NAME)

run: 
	docker container rm -f $(_NAME)
	docker run  --name $(_NAME)  -p 9090:9090 -t $(_NAME) 

push: 
	aws ecr get-login-password --region $(_AWS_MAIN_REGION) |  docker login --username AWS --password-stdin $(_AWS_ACCOUNT_ID).dkr.ecr.$(_AWS_MAIN_REGION).amazonaws.com
	docker tag $(_NAME):latest $(_AWS_ACCOUNT_ID).dkr.ecr.$(_AWS_MAIN_REGION).amazonaws.com/$(_NAME):latest
	docker tag $(_NAME):latest $(_AWS_ACCOUNT_ID).dkr.ecr.$(_AWS_MAIN_REGION).amazonaws.com/$(_NAME):$(_DATE)
	docker push $(_AWS_ACCOUNT_ID).dkr.ecr.$(_AWS_MAIN_REGION).amazonaws.com/$(_NAME):latest
	docker push $(_AWS_ACCOUNT_ID).dkr.ecr.$(_AWS_MAIN_REGION).amazonaws.com/$(_NAME):$(_DATE)


url: 
	echo "https://$(_AWS_MAIN_REGION).console.aws.amazon.com/ecr/repositories/private/$(_AWS_ACCOUNT_ID)/$(_NAME)?region=$(_AWS_MAIN_REGION)"

