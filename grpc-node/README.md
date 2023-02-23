
# Docker Images

You can use official docker images from Docker Hub, to reduce build time on your end. The latest images are built on github actions automatically. So, it DOESN'T mean assuring its behaviours. 


## Using docker images on Docker Hub

### pull docker images from docker 

```
cd grpc-node
make pull 
```

## setup node environments

```
cd grpc-node
cp .env.sample .env
vim .env 
```

Please check .env.sample to understand how to setup. 
The .env should have your wallet information. 



### run a node

```
cd grpc-node
make run
```



## Build a node image on your local and use it 

### build your customized node


```
cd grpc-node
make build
```


## setup node environments

```
cd grpc-node
cp .env.sample .env
vim .env 
```

Please check .env.sample to understand how to setup. 
The .env should have your wallet information. 




### run your customized node
```
cd grpc-node
make up
```



