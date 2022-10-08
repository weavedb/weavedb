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

## Deploy on Local Machine

Deploying a WeaveDB node on your local machine is much easier than on a cloud service.

##### 1. Clone the WeaveDB monorepo

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
```

##### 2. If you have no Arweave wallet, generate one for the test

```bash
node scripts/generate-wallet.js mainnet
```

Now you have a new wallet at `/scripts/.wallets/wallet-mainnet.json`.

##### 3. Create a configuration file at `/node/net/grpc/gateway/weavedb/node-server/weavedb.config.js`.

You can copy the newly generated wallet from the previous step to `wallet`.

For the `contractTxId`, you can run [a local instance](/docs/development/repl) and copy the displayed `contractTxId`, or use [our public demo contract](https://sonar.warp.cc/?#/app/contract/2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns) (`2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns`).

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

##### 4. Install Docker and Docker Compose according to your environment

##### 5. Run Docker Conompose

```bash
cd weavedb/node
docker-compose pull prereqs node-server envoy
docker-compose up --build -d node-server envoy
```

##### 6. Set the instance IP address to the Light Client

- Create an Next.js app and install `weavedb-client`
- For now, you need `next@12.0` for compatibility

```bash
npx create-next-app@latest test-node
cd test-node
yarn add next@12.0 weavedb-client
yarn dev
```

In case of using our public demo contract, you should be able to fetch wall comments like below.

`/page/index.js`

```javascript
import { useEffect, useState } from "react"
import client from "weavedb-client"

export default function Home() {
  const [ok, setOK] = useState(false)
  useEffect(() => {
    ;(async () => {
      const db = new client({
        name: "weavedb",
        version: "1",
        contractTxId: "2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns",
        rpc: "http://localhost:8080",
      })
      setOK((await db.get("wall", 1)).length > 0)
    })()
  }, [])
  return <div>{ok ? "ok" : "not ok"}</div>
}
```

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
git clone https://github.com/weavedb/weavedb.git
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

##### 5. Set the instance URL to the Light Client

- To health-check, you can follow the last step in [Deploy on Local Machine](/docs/development/node#6-set-the-instance-ip-address-to-the-light-client)

```javascript
import client from "weavedb-client"

const db = new client({
  name: "weavedb", // for EIP-712 signature
  version: "1", // for EIP-712 signature
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "https://grpc.example.com" // gRPC node URL
})
```
