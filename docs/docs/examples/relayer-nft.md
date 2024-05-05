---
sidebar_position: 4
---
# Cross-Chain NFT Relayer

In this tutorial, we will build a simple dapp with cross-chain NFT authentication using the [relayer](/docs/sdk/relayers) feature.
An off-chain relayer will validate NFT ownerships from another blockchain, and only NFT owners can write to WeaveDB. By default, WeaveDB authenticates users with crypto accounts, but in this dapp, cross-chain NFTs will be used for the authentication.

![](/img/relayer-nft-2.png)

1. A relayer job can be preset on the WeaveDB instance with `jobId`, `allowed_relayers`, `extra data schema`. All the conditions must be met before relayed queries go through.
2. The NFT owner mints an NFT.
3. The owner signs query data (`tokenID`, `Message`) with eip712 and sends it to the relayer with `jobID`. The `signer address` can be later obtained by verifying the eip712 signatrue.
4. The relayer checks the owner of the `tokenID` and add the `owner` address to the signed query, then signs it with eip712 and send the transaction to the WeaveDB contract on Warp.
5. The WeaveDB contract verifies the eip712 signatures and validates `jobID`, `allowed relayers` and `extra data schema`. `owner` is the extra data to be validated.
6. The original query data (`tokenID`, `Message`) can be modified with access control rules on the collection. We will check if the `signer` is the `owner`, and if so, add the `owner` field to the original data.

:::caution

In practice, the relayer could/should be decentralized. But we are going to set up a centralized relayer for this demo.

:::

A demo dapp with [a test NFT contract on Goerli testnet](https://goerli.etherscan.io/token/0xfF2914F36A25B5E1732F4F62C840b1534Cc3cD68) is deployed at [relayer-one.vercel.app](https://relayer-one.vercel.app/) where you can free-mint NFTs and post messages via WeaveDB by authenticate with your Goerli NFTs.

:::note Frontend Dapp

![](/img/relayer-nft-1.png)

:::

## Clone the Repo

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
```

## Deploy NFT

Before working on the DB, let's deploy a simple NFT contract to [the Goerli testnet](https://goerli.etherscan.io/).

If you have no `GoerliETH`, here's [a list of faucets](https://faucetlink.to/goerli).

This is a simple full-on-chain NFT with a free mint function.

```js
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract NFT is ERC721URIStorage {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;  

    constructor() ERC721("NFT", "NFT") {}

    function mint() public returns (uint256) {
      uint256 newId = _tokenIds.current();
      _mint(msg.sender, newId);
      _tokenIds.increment();
      return newId;
    }

    function getTokenURI(uint256 tokenId) public pure returns (string memory){
      bytes memory dataURI = abi.encodePacked(
        '{',
	  '"name": "NFT #', tokenId.toString(), '"',
        '}'
      );
      return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
      );
  }
}
```
Go to the NFT folder and install dependencies.

```bash
cd examples/relayer-nft/nft-contract
yarn
```

Create `.env` file with the following variables.

```
EVM_RPC="https://goerli.infura.io/v3/yourapikey"
ETHERSCAN_API_KEY="yourapikey"
PRIVATEKEY="yourprivatekey"
```

Compile the contract.

```bash
npx hardhat compile
```

Then deploy the contract to the Goerli testnet.

```bash
npx hardhat run scripts/deploy.js --network goerli
```

Now you should receive yoru contract address. To verify the contract on Etherscan, run the following.

```bash
npx hardhat verify --network goerli YOUR_CONTRACT_ADDRESS
```

## Deploy WeaveDB Contracts

```bash
cd ../../../
node scripts/generate-wallet.js mainnet
yarn deploy
```
Or you could follow [this tutorial](/docs/examples/todos-console) and use the [Web Console](https://console.weavedb.dev).

Now you should receive `contractTxId` for the deployed contract.

## Configure DB Instance

We will show you one command script to set up everything in the end, but these are what needs to be set up.

### Set up Data Schema

We are going to set up only 1 collection.

- `nft` : an NFT registry with messages

```js
const schema = {
  type: "object",
  required: ["owner", "text", "tokenID"],
  properties: {
    owner: {
      type: "string",
    },
    text: {
      type: "string",
    },
    tokenID: {
      type: "number",
    },
  },
}

await db.setSchema(schema, "nft", { ar: wallet })
```

- `tokenID` : NFT tokenID
- `owner` : NFT owner address
- `text` : text message

### Set up Relayer Job

Set a simple relayer job.

- `relayerAddress` : an EVM address of the relayer to check the Ethereum blockchain and relay WeaveDB queries.
- `schema` : JSON schema for the additional data to be attached by the relayer. The relayer will attach only one extra data of string.
- `jobID` : our arbitrary jobID will be `nft`.

```js
const job = {
  relayers: [relayerAddress],
  schema: {
    type: "string",
  },
}

await sdk.addRelayerJob("nft", job, {
  ar: wallet,
})
```
With these simple settings, we expect the relayer to receive an NFT-tokenID, and check the owner address on the Ethereum blockchain (Goerli), then relay the signed WeaveDB query with extra data of string owner address.

### Set up Access Control Rules

The NFT ownerships can be verified with Access Control Rules.

```js
const rules = {
  let: {
    owner: ["toLower", { var: "request.auth.extra" }],
    "resource.newData.owner": { var: "owner" },
  },
  "allow write": {
    "==": [{ var: "request.auth.signer" }, { var: "owner" }],
  },
}

await sdk.setRules(rules, "nft", {
  ar: wallet,
})
```

### Set up Everything with Script

To set up everything with one command, run the following.

```bash
node scripts/nft-setup.js mainnet mainnet YOUR_CONTRACT_TX_ID RELAYER_EVM_ADDRESS
```

## Set up Local gRPC Node

For a better performance for the relayer, you would want to set up a local grpc node.

Make sure `docker` and `docker-compose` are installed on your machine.

If you are on Ubuntu, the following commands would install them.

```bash
sudo apt-get update
sudo apt-get install docker.io
sudo curl -L "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Then create `weavedb.config.js` to `/grpc-node/node-server` directory.

```js
module.exports = {
  contractTxId: "xxxxxxxx..."
}
```
Then run docker-compose with `yarn run-node`.

```bash
yarn run-node
```

Now you should be able to access the node at `localhost:8080`.

## NextJS Frontend Dapp

We are going to build the front end dapp using [NextJS](https://nextjs.org/) and also set up the relayer as a serverless api.

### Create NextJS Project

Set up a NextJS project with the app name `relayer-nft`.

```bash
yarn create next-app relayer-nft
cd relayer-nft
yarn dev
```
Now your dapp should be running at [localhost:3000](http://localhost:3000).

For simplicity, we will write everything in one file at `/page/index.js`.

### Install Dependencies

Open a new terminal and move to the root directry to continue depelopment.

We use these minimum dependencies.

- [WeaveDB Client](/docs/advanced/client) - to connect with the gRPC node from browsers
- [WeaveDB Node Client](/docs/advanced/client) - to connect with the gRPC node from the serverless api
- [Ramda.js](https://ramdajs.com/) - functional programming utilities
- [Chakra UI](https://chakra-ui.com/) - UI library
- [Ethers.js](https://docs.ethers.org/v5/) - to connect with Metamask

```bash
yarn add ramda weavedb-client weavedb-node-client ethers @chakra-ui/react @emotion/react@^11 @emotion/styled@^11 framer-motion@^6
```

### Copy NFT ABI

Copy and save the minimum ABI for the NFT contract to `/lib/NFT.json`.

The relayer needs this ABI to access the Ethereum blockchain.

```json
[
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```

You need to make `/lib` directory.

```bash
mkdir lib
touch lib/NFT.json
```

Then copy the content above to `NFT.json`.

### Set up Environment Variables

Create `.env.local` file and set the following variables.

```
EVM_RPC="https://goerli.infura.io/v3/your_api_key"
WEAVEDB_RPC_NODE="localhost:8080"
RELAYER_PRIVATEKEY="Relayer_EOA_Privatekey"

NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID="Your_Contract_Tx_Id"
NEXT_PUBLIC_NFT_CONTRACT_ADDR="Goerli_NFT_Contract_Address"
NEXT_PUBLIC_WEAVEDB_RPC_WEB="http://localhost:8080"
```

### Set up Relayer

We will set up the relayer as NextJS serverless api located at `/pages/api/ownerOf`.

The relayer receives signed parameters from frontend users and checks the owner of the NFT with `tokenID` embedded in the prameters, then relays the DB query with an additional data of `owner` attached to the query.

```js
const { Contract, providers } = require("ethers")
const provider = new providers.JsonRpcProvider(process.env.EVM_RPC)
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR
const SDK = require("weavedb-node-client")
const abi = require("../../lib/NFT.json")

export default async (req, res) => {
  const params = JSON.parse(req.body)
  const tokenID = params.query[0].tokenID
  let owner = "0x"

  try {
    owner = await new Contract(nftContractAddr, abi, provider).ownerOf(tokenID)
  } catch (e) {
    res.status(200).json({
      success: false,
    })
    return
  }

  const sdk = new SDK({
    contractTxId,
    rpc: process.env.WEAVEDB_RPC_NODE,
  })

  const tx = await sdk.relay(params.jobID, params, owner, {
    jobID: params.jobID,
    privateKey: process.env.RELAYER_PRIVATEKEY,
  })

  res.status(200).json(tx)
}
```

### The App Page

The app page `/pages/index.js` is rather simple.

#### Import Libraries

Import necessary libraries. We are going to use a bunch of [RamdaJS](https://ramdajs.com/) functions for utilities and [Chakra](https://chakra-ui.com/) for UI.

```jsx
import SDK from "weavedb-client"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  reverse,
  compose,
  sortBy,
  values,
  assoc,
  map,
  indexBy,
  prop,
} from "ramda"
import { Button, Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"
```

#### Define Variables

```jsx
let sdk
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR

export default function Home() {
  const [nfts, setNFTs] = useState([])
  const [posting, setPosting] = useState(false)
}
```
- `nfts` : to store messages from NFT holders
- `posting` : to set a flag when message posting is ongoing

#### Set up Reactive Effect

Initialize the SDK and fetch messages from the gRPC node.

```jsx
  useEffect(() => {
    ;(async () => {
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      sdk = _sdk
      setNFTs(await _sdk.get("nft", ["tokenID", "desc"]))
    })()
  }, [])
```

#### Header

:::note Header View

![](/img/relayer-nft-header.png)

:::


The Header is just a link to the NFT contract on Etherscan and shows posting status when posting a message.

```jsx
  const Header = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box flex={1}>
        {posting
          ? "posting..."
          : "Mint NFT and post a Message with your tokenID!"}
      </Box>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://goerli.etherscan.io/token/${nftContractAddr}#writeContract`}
      >
        mint
      </Box>
    </Flex>
  )
```
#### Footer

:::note Footer View

![](/img/relayer-nft-footer.png)

:::

The Footer is just a link to the Warp contract page on Sonar. So users can view transactions. Nothing special.

```jsx
  const Footer = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
      >
        Contract Transactions
      </Box>
    </Flex>
  )

```

#### Post

:::note Post View

![](/img/relayer-nft-post.png)

:::

The Post component lets you post a message with your tokenIDs, and this is where the business takes place.

```jsx
  const Post = () => {
    const [message, setMessage] = useState("")
    const [tokenID, setTokenID] = useState("")
    return (
      <Flex justify="center" width="500px" mb={5}>
        <Input
          disabled={posting}
          w="100px"
          placeholder="tokenID"
          sx={{ borderRadius: "3px 0 0 3px" }}
          value={tokenID}
          onChange={e => {
            if (!Number.isNaN(+e.target.value)) {
              setTokenID(e.target.value)
            }
          }}
        />
        <Input
          disabled={posting}
          flex={1}
          placeholder="Message"
          sx={{ borderRadius: "0" }}
          value={message}
          onChange={e => {
            setMessage(e.target.value)
          }}
        />
        <Button
          sx={{ borderRadius: "0 3px 3px 0" }}
          onClick={async () => {
            if (!posting) {
              if (tokenID === "") {
                alert("enter your tokenID")
                return
              }
              if (/^\s*$/.test(message)) {
                alert("enter message")
                return
              }
              setPosting(true)
              try {
                const provider = new ethers.providers.Web3Provider(
                  window.ethereum,
                  "any"
                )
                await provider.send("eth_requestAccounts", [])
                const addr = await provider.getSigner().getAddress()
				
                const params = await sdk.sign(
                  "set",
                  { tokenID: +tokenID, text: message },
                  "nft",
                  tokenID,
                  {
                    wallet: addr,
                    jobID: "nft",
                  }
                )
				
                const res = await fetch("/api/ownerOf", {
                  method: "POST",
                  body: JSON.stringify(params),
                }).then(v => v.json())
				
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setMessage("")
                  setTokenID("")
                  setNFTs(
                    compose(
                      reverse,
                      sortBy(prop("tokenID")),
                      values,
                      assoc(res.docID, res.doc),
                      indexBy(prop("tokenID"))
                    )(nfts)
                  )
                }
              } catch (e) {
                alert("something went wrong")
              }
              setPosting(false)
            }
          }}
        >
          Post
        </Button>
      </Flex>
    )
  }
```

##### Inside onClick Function

There are 2 key parts inside the onClick function.

`sign` method signs a query and creates an object(`param`) ready to be sent to the relayer. In this code, we are setting the object `{ tokenID: +tokenID, text: message }` to `tokenID` doc of `nft` collection. `jobID` also needs to be specified when signing to relay a query.

```js
const params = await sdk.sign(
  "set",
  { tokenID: +tokenID, text: message },
  "nft",
  tokenID,
  {
    wallet: addr,
    jobID: "nft",
  }
)
```
Now send the signed object to the relayer we set up at `/api/ownerOf`. The relayer is going to check the owner of the `tokenID` and relay the query with an additional `owner` data.

The [access control rules](/docs/examples/relayer-nft#set-up-access-control-rules) previously set will make sure the signer is the owner, and only let messages posted if it's true.

```js
const res = await fetch("/api/ownerOf", {
  method: "POST",
  body: JSON.stringify(params),
}).then(v => v.json())
```

#### Messages

:::note Messages View

![](/img/relayer-nft-messages.png)

:::


The Messages component loops through `nfts` and list the messages with a link to the owner page on Etherscan.

```jsx
  const Messages = () => (
    <Box>
      <Flex bg="#EDF2F7" w="500px">
        <Flex justify="center" p={2} w="75px">
          tokenID
        </Flex>
        <Flex justify="center" p={2} w="100px">
          Owner
        </Flex>
        <Box p={2} flex={1}>
          Message
        </Box>
      </Flex>
      {map(v => (
        <Flex
          sx={{ ":hover": { bg: "#EDF2F7" } }}
          w="500px"
          as="a"
          target="_blank"
          href={`https://goerli.etherscan.io/token/${nftContractAddr}?a=${v.owner}`}
        >
          <Flex justify="center" p={2} w="75px">
            {v.tokenID}
          </Flex>
          <Flex justify="center" p={2} w="100px">
            {v.owner.slice(0, 5)}...{v.owner.slice(-3)}
          </Flex>
          <Box p={2} flex={1}>
            {v.text}
          </Box>
        </Flex>
      ))(nfts)}
    </Box>
  )
```
#### Return Components

Now return all the components wrapped by `<ChakraProvider>` tag for UI.

```jsx
  return (
    <ChakraProvider>
      <Flex direction="column" align="center" fontSize="12px">
        <Header />
        <Post />
        <Messages />
        <Footer />
      </Flex>
    </ChakraProvider>
  )
```


#### The Complete Code

You can also access the entire code [on Github](https://github.com/weavedb/weavedb/blob/master/examples/relayer-nft/pages/index.js).

```jsx
import SDK from "weavedb-client"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  reverse,
  compose,
  sortBy,
  values,
  assoc,
  map,
  indexBy,
  prop,
} from "ramda"
import { Button, Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"

let sdk
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR

export default function Home() {
  const [nfts, setNFTs] = useState([])
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    ;(async () => {
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      sdk = _sdk
      setNFTs(await _sdk.get("nft", ["tokenID", "desc"]))
    })()
  }, [])

  const Header = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box flex={1}>
        {posting
          ? "posting..."
          : "Mint NFT and post a Message with your tokenID!"}
      </Box>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://goerli.etherscan.io/token/${nftContractAddr}#writeContract`}
      >
        mint
      </Box>
    </Flex>
  )

  const Footer = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
      >
        Contract Transactions
      </Box>
    </Flex>
  )

  const Post = () => {
    const [message, setMessage] = useState("")
    const [tokenID, setTokenID] = useState("")
    return (
      <Flex justify="center" width="500px" mb={5}>
        <Input
          disabled={posting}
          w="100px"
          placeholder="tokenID"
          sx={{ borderRadius: "3px 0 0 3px" }}
          value={tokenID}
          onChange={e => {
            if (!Number.isNaN(+e.target.value)) {
              setTokenID(e.target.value)
            }
          }}
        />
        <Input
          disabled={posting}
          flex={1}
          placeholder="Message"
          sx={{ borderRadius: "0" }}
          value={message}
          onChange={e => {
            setMessage(e.target.value)
          }}
        />
        <Button
          sx={{ borderRadius: "0 3px 3px 0" }}
          onClick={async () => {
            if (!posting) {
              if (tokenID === "") {
                alert("enter your tokenID")
                return
              }
              if (/^\s*$/.test(message)) {
                alert("enter message")
                return
              }
              setPosting(true)
              try {
                const provider = new ethers.providers.Web3Provider(
                  window.ethereum,
                  "any"
                )
                await provider.send("eth_requestAccounts", [])
                const addr = await provider.getSigner().getAddress()
                const params = await sdk.sign(
                  "set",
                  { tokenID: +tokenID, text: message },
                  "nft",
                  tokenID,
                  {
                    wallet: addr,
                    jobID: "nft",
                  }
                )
                const res = await fetch("/api/ownerOf", {
                  method: "POST",
                  body: JSON.stringify(params),
                }).then(v => v.json())
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setMessage("")
                  setTokenID("")
                  setNFTs(
                    compose(
                      reverse,
                      sortBy(prop("tokenID")),
                      values,
                      assoc(res.docID, res.doc),
                      indexBy(prop("tokenID"))
                    )(nfts)
                  )
                }
              } catch (e) {
                alert("something went wrong")
              }
              setPosting(false)
            }
          }}
        >
          Post
        </Button>
      </Flex>
    )
  }
  
  const Messages = () => (
    <Box>
      <Flex bg="#EDF2F7" w="500px">
        <Flex justify="center" p={2} w="75px">
          tokenID
        </Flex>
        <Flex justify="center" p={2} w="100px">
          Owner
        </Flex>
        <Box p={2} flex={1}>
          Message
        </Box>
      </Flex>
      {map(v => (
        <Flex
          sx={{ ":hover": { bg: "#EDF2F7" } }}
          w="500px"
          as="a"
          target="_blank"
          href={`https://goerli.etherscan.io/token/${nftContractAddr}?a=${v.owner}`}
        >
          <Flex justify="center" p={2} w="75px">
            {v.tokenID}
          </Flex>
          <Flex justify="center" p={2} w="100px">
            {v.owner.slice(0, 5)}...{v.owner.slice(-3)}
          </Flex>
          <Box p={2} flex={1}>
            {v.text}
          </Box>
        </Flex>
      ))(nfts)}
    </Box>
  )

  return (
    <ChakraProvider>
      <Flex direction="column" align="center" fontSize="12px">
        <Header />
        <Post />
        <Messages />
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
```

## Using the Dapp

:::caution Using the Dapp

When minting the NFT, please use a different EVM account from the relayer. This is because if the relayer and the message sender are the same account, they will have the same nonce for separate signatures and it will cause a signature verification error.

:::
