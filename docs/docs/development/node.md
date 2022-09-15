---
sidebar_position: 5
---
# gRPC Node

SmartWeave moves computations off chain onto the client-side for unlimited scalability. But this is not all good news. Even with the lazy execution model, end users need to cache the transactions and compute the current contract states as they need. This makes queries very slow at times.

A gRPC node comes between the WeaveDB contract and browsers and does all the work for thousands of browser clients, so the end-users don't have to do any calculations, let alone holding a shitload of unnecessary cache. Instead it gives back cached data within 1 second for read queries, and processes smart contract transactions within 3 seconds for write queries, which achieves the same UX as most web2 apps.

Browser clients can use the [Light Client](/docs/sdk/client), instead of the full featured SDK wrapping the Warp SDK.

## Set up a Node

### Prerequisites

Install `docker` and `docker-compose` globally to your machine. And open port `8080` for anyone.


### Run docker-compose

Add `weavedb.config.js` to `/node/net/grpc/gateway/weavedb/node-server` directory.

```bash
cd node/net/grpc/gateway/weavedb/node-server
touch weavedb.config.js
```

`weavedb.config.js`

```js
module.exports = {
  name: "weavedb",
  version: "1",
  contractTxId: "xxxxxxxx...",
  arweave: {
    host: "arweave.net",
    port: 443,
    protocol: "https"
  },
  wallet: {
    kty: "RSA",
    n: ...
  }
}

```

Then build and run the docker container.

```bash
cd ..
docker-compose pull prereqs node-server envoy
docker-compose up -d node-server envoy
```

Now you can interact with the node using the [Light Client](/docs/sdk/client).

## Deploy on GCP

This is how you would deploy a WeaveDB node using Compute Engine on Google Cloud Platform.

##### 1. Go to [Google Cloud Console for Compute Engine](https://console.cloud.google.com/compute/instances) and create a new instance.

- Change the Boot Disk to Ubuntu 18.04 LTS, x86/64, amd64 bionic image 
- Allow HTTP traffic
- Allow HTTPS traffic

##### 2. Go to [VPC network > IP addresses](https://console.cloud.google.com/networking/addresses/list) and RESERVE the external IP address assigned to the instance.

##### 3. Go to your name server provider such as [Cloudflare](https://cloudflare.com), and create an A record directed to the IP address of the instance in the DNS records of your domain.

##### 4. SSH into the instance

- Install Docker

```bash
sudo apt-get update
sudo apt-get install docker.io
```

- Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

- Clone the WeaveDB monorepo

```bash
git clone https://github.com/asteroid-dao/weavedb.git
```

- Create and edit `weavedb.config.js` with your favorite editor such as Emacs

```bash
sudo apt-get install emacs
emacs weavedb/node/net/grpc/gateway/weavedb/node-server/weavedb.config.js
```

```javascript
module.exports = {
  name: "weavedb",
  version: "1",
  contractTxId: "xxxxxxxx...",
  arweave: {
    host: "arweave.net",
    port: 443,
    protocol: "https"
  },
  wallet: {
    kty: "RSA",
    n: ...
  }
}
```

- Move to `weavedb/node` and run docker-compose

```bash
cd weavedb/node
sudo docker-compose pull prereqs node-server envoy
sudo docker-compose up --build -d node-server envoy
```

- Set up NGINX with SSL/TLS certificate using Certbot

```bash
sudo apt-get install nginx certbot python3-certbot-nginx
```
- Edit the nginx config file

```bash
sudo emacs /etc/nginx/sites-available/default
```

- Replace `grpc.example.com` with your domain
```txt
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    server_name grpc.example.com;
}
```

- Check the syntax of the config file and restart nginx

```bash
sudo nginx -t && sudo nginx -s reload
```

- Obtain the SSL/TLS certificate

Replace `grpc.example.com` with your domain

```bash
sudo certbot --nginx -d grpc.example.com
```

- Edit the config file again and make it look like the following

```bash
sudo emacs /etc/nginx/sites-available/default
```

Replace `xx.xxx.x.x` with the internal IP of the instance

```bash
server {
    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/grpc.example.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/grpc.example.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    location /weavedb.DB {
        grpc_pass grpc://xx.xxx.x.x:8080;
    }
}
```

- Check the syntax of the config file and restart nginx

```bash
sudo nginx -t && sudo nginx -s reload
```

##### 5. Set the instance IP address to the Light Client

```javascript
import WeaveDB from "weavedb-client"

const db = new WeaveDB({
  name: "weavedb", // for EIP-712 signature
  version: "1", // for EIP-712 signature
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "https://grpc.example.com" // gRPC node URL
})
```
