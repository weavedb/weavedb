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

### weavedb.config.js

Add `weavedb.config.js` to `/grpc-node/node-server` directory.


```js
module.exports = {
  contractTxId: "xxxxxxxx..."
}
```

#### contractTxId

There are 3 ways to specify the `contractTxId` in the config file.

- single contract - set one string id to allow single DB instance.  
`contractTxId: "xxxxx..."`
- multiple contracts - set an array of ids to allow multiple DB instances.  
`contractTxId: [ "xxxxx...", "yyyyy...", "zzzzz..." ]`
- any contracts - set `allowAnyContracts` to `true`

When you have old contracts, they need to be specified in the `contractTxId`, and you can still allow any contracts.

```js
module.exports = {
  contractTxId: ["xxxxx...@old", "yyyyy...@old"],
  allowAnyContracts: true
}
```

Then build and run the docker container.

#### Store Snapshots in Google Cloud Storage

Due to the concept of lazy evaluation, initializing contracts with a large number of transactions is extremely slow.

You can save snapshots in cloud storage such as GCP and AWS.

To use Google Cloud Storage, specify `gcs` option in `weavedb.config.js`.

```js
module.exports = {
  gcs: {
    bucket: "[bucket_name]",
    keyFilename: "[service_account_key_file_location]",
  }
}
```

For example, to use the project default bucket with the default service account,

- go to [Cloud Console](https://console.cloud.google.com/)
- set up a project and the storage (note the `projectId`)
- get a service account key file from `Project Settings > Service accounts`
- store it at `/grpc-node/node-server/gcs.json`

```js
module.exports = {
  gcs: {
    bucket: "[projectId].appspot.com",
    keyFilename: "gcs.json",
  }
}
```



#### Store Snapshots in Amazon S3

There is another option to store data in the cloud, Amazon S3. 

To use Amazon S3, specify `s3` option in `weavedb.config.js`.

```js
module.exports = {
  s3: {
    bucket: "[s3_bucket_name]",
    prefix: "[key_prefix_for_the_s3_bucket]",
    accessKeyId: "[aws_access_key_id]",
    secretAccessKey: "[aws_access_secret_key]",
    region: "[aws_s3_region]",
  },
}
```

#### Redis for Remote In-Memory Cache

You can use Redis for multiple nodes to share the same remote cache.

Use `redis` option in `weavedb.config.js`.

```js
module.exports = {
  redis: {
    url: "redis://localhost:6379",
	prefix: "weavedb" // prefix for cache keys
  }
}
```

#### Global Rate Limit Counter 

You can set limit accesses for all each contracts. 

To use this setting, specify `ratelimit` option in `weavedb.config.js`.

You need to setup redis setting as well. 

The below setting enables you to limit 300 accesses in 5 min. 


```js
module.exports = {
  ratelimit: {
    every: 5,
    limit: 300
  },
   redis: {
    url: "redis://localhost:6379"
  },
}
```

### Run docker-compose

```bash
yarn run-node
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

##### 2. Create a configuration file at `/node/net/grpc/gateway/weavedb/node-server/weavedb.config.js`.

You can copy the newly generated wallet from the previous step to `wallet`.

For the `contractTxId`, you can run [a local instance](/docs/development/repl) and copy the displayed `contractTxId`.

Use `host.docker.internal` as `host` to internally connect from the docker container.

```js
module.exports = {
  contractTxId: "xxxxx...",
  arweave:{
    host: "host.docker.internal",
    port: 1820,
    protocol: "http"
  }
}
```

Or use [our public demo contract](https://sonar.warp.cc/?#/app/contract/2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns).

```js
module.exports = {
  contractTxId: "2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns"
}
```

##### 3. Install Docker and Docker Compose according to your environment

##### 4. Run Docker Conompose

```bash
yarn run-node
```

##### 5. Set the instance IP address to the Light Client

- Create an Next.js app and install `weavedb-client`

```bash
npx create-next-app@latest test-node
cd test-node
yarn add weavedb-client
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
sudo curl -L "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

- Clone the WeaveDB monorepo

```bash
git clone https://github.com/weavedb/weavedb.git
```

- Create and edit `weavedb.config.js` with your favorite editor such as nano

```bash
nano weavedb/grpc-node/node-server/weavedb.config.js
```

```javascript
module.exports = {
  contractTxId: "xxxxxxxx..."
}
```

- Move to `weavedb/grpc-node`, build and run docker-compose.

```bash
cd weavedb/grpc-node
sudo docker-compose up --build
```

- Set up NGINX with SSL/TLS certificate using Certbot

```bash
sudo apt-get install nginx certbot python3-certbot-nginx
```
- Edit the nginx config file

```bash
sudo nano /etc/nginx/sites-available/default
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
sudo nano /etc/nginx/sites-available/default
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
  contractTxId: WEAVEDB_CONTRACT_TX_ID,
  rpc: "https://grpc.example.com" // gRPC node URL
})
```
## Manage Node with Admin Contract

WeaveDB nodes can be remotely managed by an admin WeaveDB contract.

### Setup

##### 1. Deploy a fresh WeaveDB contract

You can go to [the Web Console](https://console.weavedb.dev) and deploy one. This will be the admin contract.

Note that currently the contract owner has to be an Arweave account.

##### 2. Add Settings

Add `admin` option to `weavedb.confg.js`.

- `contractTxId` : the admin contract previously deployed
- `owner` : the wallet JSON of the owner of the admin contract

```js
module.exports = {
  ...,
  admin: {
    contractTxId: "xyz...",
    owner: {
      kty: "RSA",
	  ...
    },
  },
}
```

##### 3. Set up the WeaveDB Instance

Once you start the node with the admin settings, make a grpc call to your node using `light-client`.

```js
const SDK = require("weavedb-node-client") // or weavedb-client
const db = new SDK({ contractTxId, rpc })
await db.admin({ op: "setup" }, { ar: admin_wallet })
```

### Whitelist

The admin can add user addresses to the whitelist, and whitelisted users can add contracts to the node.

`limit` is an optional field to limit the number of contracts the user can deploy.

```js
await db.admin({ op: "whitelist", address, allow: true, limit: 5 }, { ar: admin_wallet })
```

### Reset Cache

The admin can delete cache and reconstruct it.

```js
await db.admin({ op: "reset_cache", contractTxId }, { ar: admin_wallet })
```

### Add Contract to Node

The user must be whitelisted to add a contract.

```js
await db.admin({ op: "add_contract", contractTxId }, { ar: user_wallet })
```

### Remove Contract from Node

The user must be the contract registrator.

```js
await db.admin({ op: "remove_contract", contractTxId }, { ar: user_wallet })
```

### Remove Contract from Node

The user must be the contract registrator.

```js
await db.admin({ op: "remove_contract", contractTxId }, { ar: user_wallet })
```

### Get Node Stats

`db.node` is for read queries to the node, whereas `db.admin` is for write queries. To get some node stats,

```js
await db.node({ op: "stats" })
```
