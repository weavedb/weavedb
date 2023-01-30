---
sidebar_position: 5
---
# Cross-Chain ACL with Lit Protocol

Continuing from [the previous example](/docs/examples/relayer-nft), we can take [the relayers](/docs/sdk/relayers) one step further with [Lit Protocol](https://litprotocol.com/). Using [threshold cryptography](https://developer.litprotocol.com/Introduction/howItWorks#threshold-cryptography), Lit enables us to build access control logic using states from multiple blockchains combined, and encrypt data so only certain addresses that satisfy the access control rules can decrypt it.

For this example, we will build a messaging dapp where you can send encrypted messages to only specified NFT holders. And only the holders of specified tokenIDs will be able to decrypt your messages.

![](/img/relayer-lit-1.png)

1. A relayer job can be preset on the WeaveDB instance with `jobId`, `allowed_relayers`, `extra data schema`. All the conditions must be met before relayed queries go through.
2. The sender `#1` and the receiver `#3` mint NFTs.
3. The sender encrypt a message to the receiver with the condition that `receiver = owner of #3 token` using Lit Protocol. To be specific, the sender specifies multiple `tokenID`s including one of his/her own (e.g. `1,3`), so he/she can also decrypt and view the message.
4. The sender packages the received data (`encryptedString`, `encryptedSymmetricKey`) and the access condition(`evmContractConditions`) into an object, and we call it `Lit Object` for now.
5. The sender signs initial data (`date`) with eip712 and sends it to the relayer with `jobID`. The `signer address` can be later obtained by verifying the eip712 signatrue.
6. The relayer checks the sender is an owner of one of the receiver `tokenIDs` and add extra data (`isOwner`, `lit`, `tokenIds`) to the signed query, then signs it with eip712 and send the transaction to the WeaveDB contract on Warp.
7. The WeaveDB contract verifies the eip712 signatures and validates `jobID`, `allowed relayers` and `extra data schema`.
8. The initial query data can be modified with access control rules on the collection. We will check if `isOwner` is `true` and if `block.timestamp` is equal to the `date`, and if so, add `tokenIds`, `lit` and `owner` to the initial data to make it `{ date, tokenIDs, lit : { encryptedString, evmContractConditions, encryptedSymmetricKey } , owner }`. This data schema is preset on the collection, so the data gets rejected unless it satisfies this schema.
9. The receiver fetch the doc including the `Lit Object`, which contains the encrypted message and send the `evmContractConditions` and `encryptedSymmetricKey` to Lit Protocol.
10. Lit Protocol verifies the decryptor meets the access conditions(`decryptor = one of the owners of the specified tokenIDs`), and if so, it sends back the decrypted `symmetricKey`.
11. The receiver uses the `symmetricKey` to decrypt the `encryptedString` to get the message from the sender.

:::caution

In practice, the relayer could/should be decentralized. But we are going to set up a centralized relayer for this demo.

:::

A demo dapp with [a test NFT contract on Goerli testnet](https://goerli.etherscan.io/token/0xfF2914F36A25B5E1732F4F62C840b1534Cc3cD68) is deployed at [relayer-one.vercel.app/lit-protocol](https://relayer-one.vercel.app/lit-protocol) where you can free-mint NFTs and send encrypted messages to arbitrary tokenID owners via WeaveDB and Lit Protocol.

We are also going to use a subgraph from [The Graph Protocol](https://thegraph.com/) and a simple Solidity contract for on-chain ACL with [Lit Protocol](https://litprotocol.com/).

:::note Frontend Dapp

![](/img/relayer-lit-2.png)

:::

## Prerequisites

We assume you have followed [the previous tutorial](/docs/examples/relayer-nft). If not, please do the following 3 steps and come back here.

1. [Clone the Repo](/docs/examples/relayer-nft)
2. [Deploy NFT](/docs/examples/relayer-nft#deploy-nft)
3. [Deploy WeaveDB Contract](/docs/examples/relayer-nft#deploy-weavedb-contracts)
4. [Set up Local gRPC Node](/docs/examples/lit-protocol#set-up-local-grpc-node)

## Create a Subgraph

We'd like to get user owned `tokenIDs` from the NFT contract at once.

Subgraph is the perfect solution to quickly get indexed data from other blockchains.

Go to [your hosted-service dashboard](https://thegraph.com/hosted-service/dashboard) and `Add Subgraph`.

### Install Graph CLI

```bash
yarn global add @graphprotocol/graph-cli
```

### Deploy Subgraph

Initialize the subgraph with the following options.

```bash
graph init --product hosted-service username/your-subgraph-name
```

- `Protocol` : ethereum
- `Subgraph Name` : username/your-subgraph-name
- `Directory to create the subgraph in` : your-subgraph-name
- `Ethereum network` : goerli
- `Contract address` : 0xYourNFTContractAddress
- `Contract name` : NFT
- `Index contract events as entities` : false
- `Add another contarct?` : false

Set your deploy key for the subgraph. You can get the deploy key from [your subgraph page](https://thegraph.com/hosted-service/dashboard).

```bash
cd your-subgraph-name
graph auth
```

Open `subgraph.yaml` and replace `dataSources.source.address` with your NFT contract address and `dataSources.source.startBlock` with the contract creation block number.

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: NFT
    network: goerli
    source:
      address: "0xfF2914F36A25B5E1732F4F62C840b1534Cc3cD68"
      abi: NFT
      startBlock: 8198452
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Approval
        - ApprovalForAll
        - Transfer
      abis:
        - name: NFT
          file: ./abis/NFT.json
      eventHandlers:
        - event: Approval(indexed address,indexed address,indexed uint256)
          handler: handleApproval
        - event: ApprovalForAll(indexed address,indexed address,bool)
          handler: handleApprovalForAll
        - event: Transfer(indexed address,indexed address,indexed uint256)
          handler: handleTransfer
      file: ./src/nft.ts
```

Open `schema.graphql` and relpace the content with the following.

```graphql
type Token @entity {
  id: ID!
  tokenID: BigInt!
  owner: User!
}

type User @entity {
  id: ID!
  tokens: [Token!]! @derivedFrom(field: "owner")
}
```
Then generate code.

```bash
graph codegen
```

Replace `src/nft.ts` with the following code.

```ts
import { BigInt } from "@graphprotocol/graph-ts"
import { NFT, Approval, ApprovalForAll, Transfer } from "../generated/NFT/NFT"
import { Token, User } from "../generated/schema"

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTransfer(event: Transfer): void {
    let token = Token.load(event.params.tokenId.toString())
    if (!token){
	let token = new Token(event.params.tokenId.toString())
	token.tokenID = event.params.tokenId
	token.owner = event.params.to.toHexString()
	token.save()
    }
    
    let user = User.load(event.params.to.toHexString())
    if (!user) {
	user = new User(event.params.to.toHexString())
	user.save()
    }
}
```

Then, build and deploy.

```bash
graph build && yarn deploy
```

Now you can query the subgraph at [https://api.thegraph.com/subgraphs/name/username/your-subgraph-name](https://api.thegraph.com/subgraphs/name/ocrybit/weavedb-relayer-nft-demo).

For example, a query to get the `tokenIDs` of `0x078694d69426112c7df330732e28F5117B02727A` is the following.

```graphql
{
  user (id: "0x078694d69426112c7df330732e28f5117b02727a"){
    tokens{
      id
    }
  }
}
```

## Deploy ACL Contract on EVM

You can set up complex access control conditions with Lit Protocol using multiple smart contract functions.

But you can also make it easiler by deploying a simple real-only ACL contract and using only one aggregator function.

We will deploy an `ACL` contract with `isOwner` function that checks if the `addr` is the owner of any one of the given `tokenIds`.

```js
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
  function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract ACL {
  address public contract_address;
  
  constructor(address addr) {
    contract_address = addr;
  }
  
  function isOwner(address addr, uint [] memory tokenIds) public view returns (bool) {
    IERC721 nft = IERC721(contract_address);
    bool is_owner = false;
    for(uint i = 0; i < tokenIds.length; i++){
      try nft.ownerOf(tokenIds[i]) returns (address owner) {
        if(addr == owner){
          is_owner = true;
		  break;
        }
      } catch {}
    }
    return is_owner;
  }
}
```

Go to the `nft-contract` folder and compile the contract.

```bash
cd examples/relayer-nft/nft-contract
yarn
npx hardhat compile
```

Create `.env` file with the following variables.

```
EVM_RPC="https://goerli.infura.io/v3/yourapikey"
ETHERSCAN_API_KEY="yourapikey"
PRIVATEKEY="yourprivatekey"
```

Then deploy the contract to the Goerli testnet.

```bash
npx hardhat run scripts/deployACL.js 0xNFTContractAddress --network goerli
```

Now you should receive yoru contract address. To verify the contract on Etherscan, run the following.

```bash
npx hardhat verify --network goerli 0xACLContractAddress 0xNFTContractAddress
```

## Configure DB Instance

We will show you one command script to set up everything in the end, but these are what needs to be set up.

### Set up Data Schema

We are going to set up only 1 collection.

- `lit_messages` : encrypted messages with Lit Protocol

```js
const schema = {
  type: "object",
  required: ["tokenIDs", "date", "lit", "owner"],
  properties: {
    owner: {
      type: "string",
    },
    tokenIDs: {
      type: "array",
      items: {
        type: "number",
      },
    },
    lit: {
      encryptedData: { type: "string" },
      encryptedSymmetricKey: { type: "array", items: { type: "number" } },
      evmContractConditions: { type: "object" },
    },
    date: {
      type: "number",
    },
  },
}

await db.setSchema(schema, "lit_messages", { ar: wallet })
```

- `tokenIDs` : tokenIDs the message is sent to, only the owners of those tokenIDs can decrypt the message
- `owner` : sender address
- `lit` : lit object with encrypted message, encrypted key, and access conditions
- `date` : date the messege is sent

### Set up Relayer Job

Set a simple relayer job.

- `relayerAddress` : an EVM address of the relayer to check the Ethereum blockchain and relay WeaveDB queries.
- `schema` : JSON schema for the additional data to be attached by the relayer. The relayer will attach 3 pieces of extra data, `tokenIDs`, `lit`, and `isOwner`.
- `jobID` : our arbitrary jobID will be `lit`.

```js
const job = {
  relayers: [relayerAddress],
  schema: {
    type: "object",
    required: ["tokenIDs", "lit", "isOwner"],
    properties: {
      tokenIDs: {
        type: "array",
        items: {
          type: "number",
        },
      },
      lit: {
        encryptedData: { type: "string" },
        encryptedSymmetricKey: { type: "array", items: { type: "number" } },
        evmContractConditions: { type: "object" },
      },
      isOwner: {
        type: "boolean",
      },
    },
  },
}

await sdk.addRelayerJob("lit", job, {
  ar: wallet,
})
```
With these simple settings, we expect the relayer to receive a post `date` and a `lit object`, then verify the signer is one of the owners of the specified `tokenIDs`. `tokenIDs` can be extracted from `evmContractConditions`.

Finally, it attaches 3 pieces of extra data(`lit`, `tokenIDs`, `isOwner`) to the originally signed query.

### Set up Access Control Rules

`tokenIds` and `lit` will be set from the extra data and the signer will be set as `owner`. It checks `isOwner` is `true` and `block.timestamp` is `date`.

The `date` will always evaluate to `block.timestamp` if the sender specifies `db.ts()` to the `date` field.

```js
const rules = {
  let: {
    "resource.newData.tokenIDs": { var: "request.auth.extra.tokenIDs" },
    "resource.newData.lit": { var: "request.auth.extra.lit" },
    "resource.newData.owner": { var: "request.auth.signer" },
  },
  "allow create": {
    and: [
      { "==": [{ var: "request.auth.extra.isOwner" }, true] },
      {
        "==": [
          { var: "request.block.timestamp" },
          { var: "resource.newData.date" },
        ],
      },
    ],
  },
}

await sdk.setRules(rules, "lit_messages", {
  ar: wallet,
})
```

### Set up Everything with Script

To set up everything with one command, run the following.

```bash
node scripts/lit-setup.js mainnet mainnet YOUR_CONTRACT_TX_ID RELAYER_EVM_ADDRESS
```

## NextJS Frontend Dapp

If you followed [the previous tutorial](/docs/examples/relayer-nft), you should have a frontend dapp set up alreasy.

If not, you should follow the first two sections now.

1. [Create NextJS Project](/docs/examples/relayer-nft#create-nextjs-project)
2. [Install Dependencies](/docs/examples/relayer-nft#install-dependencies)

### Copy ACL ABI

Copy and save the minimum ABI for the NFT contract to `/lib/NFT.json`.

The relayer needs this ABI to access the Ethereum blockchain.

```json
[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "contract_address",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "uint256[]",
        "name": "tokens",
        "type": "uint256[]"
      }
    ],
    "name": "isOwner",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```

You need to make `/lib` directory, if it doesn't exist yet.

```bash
mkdir lib
touch lib/ACL.json
```

Then copy the content above to `ACL.json`.

### Set up Environment Variables

Create `.env.local` file and set the following variables.

```
EVM_RPC="https://goerli.infura.io/v3/your_api_key"
WEAVEDB_RPC_NODE="localhost:8080"
RELAYER_PRIVATEKEY="Relayer_EOA_Privatekey"

NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID="Your_Contract_Tx_Id"
NEXT_PUBLIC_NFT_CONTRACT_ADDR="Goerli_NFT_Contract_Address"
NEXT_PUBLIC_ACL_CONTRACT_ADDR="Goerli_ACL_Contract_Address"
```

### Set up Relayer

We will set up the relayer as NextJS serverless api located at `/pages/api/isOwner`.

The relayer receives signed parameters and a lit object from frontend users and checks if the signer is one of the owner of the specified `tokenIDs` extractable from the lit object.

It then relays the DB query with an additional data of `isOwner`, `lit` and `tokenIDs`  attached to the query.

```js
const { Contract, providers } = require("ethers")
const provider = new providers.JsonRpcProvider(process.env.EVM_RPC)
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const aclContractAddr = process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDR
const SDK = require("weavedb-node-client")
const abi = require("../../lib/ACL.json")

export default async (req, res) => {
  const { lit, params } = JSON.parse(req.body)
  const tokenIDs = JSON.parse(lit.evmContractConditions[0].functionParams[1])
  let isOwner = false
  try {
    isOwner = await new Contract(aclContractAddr, abi, provider).isOwner(
      params.caller,
      tokenIDs
    )
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
  const tx = await sdk.relay(
    params.jobID,
    params,
    { isOwner, lit, tokenIDs },
    {
      jobID: params.jobID,
      privateKey: process.env.RELAYER_PRIVATEKEY,
    }
  )
  res.status(200).json(tx)
}
```

### The App Page

The app page resides at `/pages/lit-protocol.js`. We put a bit better UI design than the previous tutorial.

#### Import Libraries

Import necessary libraries. We are going to use a bunch of [RamdaJS](https://ramdajs.com/) functions for utilities and [Chakra](https://chakra-ui.com/) for UI.

We will also use [localforage](https://localforage.github.io/localForage/) to manage login states with Lit Protocol, and [dayjs](https://day.js.org/) for date display.

For nicer looks, [Jdenticon](https://jdenticon.com/) provides on-the-fly geometric avatars for evm addresses.

```jsx
import SDK from "weavedb-client"
import Jdenticon from "react-jdenticon"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  intersection,
  append,
  pluck,
  trim,
  reverse,
  compose,
  sortBy,
  values,
  assoc,
  map,
  indexBy,
  prop,
  isNil,
} from "ramda"
import {
  Spinner,
  Box,
  Flex,
  Textarea,
  Input,
  ChakraProvider,
} from "@chakra-ui/react"
import lf from "localforage"
import LitJsSdk from "@lit-protocol/sdk-browser"
import dayjs from "dayjs"
dayjs.extend(require("dayjs/plugin/relativeTime"))
```

#### Define Variables

```jsx
let sdk, lit
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR

export default function Home() {
  const [messages, setMessages] = useState([])
  const [authSig, setAuthSig] = useState(null)
  const [userTokenIDs, setUserTokenIDs] = useState([])
  const [posting, setPosting] = useState(false)
  const [initSDK, setInitSDK] = useState(false)
}
```
- `messages` : decrypted messages to your address
- `posting` : to set a flag when message posting is ongoing
- `authSig` : a signature credential required for Lit Protocol
- `userTokenIDs` : a list of tokenIDs owned by connected account
- `initSDK` : a flag for the WeaveDB client SDK initialization

#### Set up Reactive Effect

Check if `authSig` is previously stored, initialize the SDK, and set the `initSDK` flag when SDK is ready.

```jsx
  useEffect(() => {
    ;(async () => {
	  // check if authSig exists from the previous session
      setAuthSig(await lf.getItem("lit-authSig"))
	  
	  // initialize client SDK
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      sdk = _sdk
	  
	  // set the initSDK flag
      setInitSDK(true)
    })()
  }, [])
```

When the connected account has changed, get user owned tokenIDs via subgraph.

Then subsequently get messages for the tokenIDs from WeaveDB, and decrypt them using Lit Protocol.

```jsx
  useEffect(() => {
    ;(async () => {
      if (!isNil(authSig) && initSDK) {
	  
	    // a subgraph query to get the connected user with tokens
        const query = `
{
  user (id: "${authSig.address}"){
    tokens{
     id
    }
  }
}`
        // query subgraph for tokenIDs
        const data = await fetch(
          "https://api.thegraph.com/subgraphs/name/ocrybit/weavedb-relayer-nft-demo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ query }),
          }
        ).then(r => r.json())
        const tokenIDs = compose(
          map(v => +v),
          pluck("id")
        )(data.data.user.tokens)
        setUserTokenIDs(tokenIDs)
		
		// get messages sent to the tokenIDs from WeaveDB
        const res = await sdk.get(
          "lit_messages",
          ["tokenIDs", "array-contains-any", tokenIDs],
          ["date", "desc"]
        )
		
		// decrypt the messages using Lit Protocol
        lit = new LitJsSdk.LitNodeClient()
        await lit.connect()
        let _messages = []
        for (const msg of res) {
          const {
            evmContractConditions,
            encryptedSymmetricKey,
            encryptedData,
          } = msg.lit
          const symmetricKey = await lit.getEncryptionKey({
            evmContractConditions,
            toDecrypt: LitJsSdk.uint8arrayToString(
              new Uint8Array(encryptedSymmetricKey),
              "base16"
            ),
            chain: "goerli",
            authSig,
          })
          const dataURItoBlob = dataURI => {
            var byteString = window.atob(dataURI.split(",")[1])
            var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
            var ab = new ArrayBuffer(byteString.length)
            var ia = new Uint8Array(ab)
            for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }

            var blob = new Blob([ab], { type: mimeString })

            return blob
          }
          const decryptedString = await LitJsSdk.decryptString(
            dataURItoBlob(encryptedData),
            symmetricKey
          )
          _messages.push(assoc("text", decryptedString, msg))
        }
        setMessages(_messages)
      }
    })()
  }, [authSig, initSDK])
```

#### Header

:::note Header View

![](/img/relayer-lit-3.png)

:::

The Header has a `Connect with Lit Protocol` / `Disconnect` button, which prompts the user to connect with Metamask/Wallet Connect.

It also has a link to the NFT contract on Etherscan and shows posting status when posting a message.

```jsx
    <>
      <Flex justify="center" width="600px" py={3} align="center">
        {!isNil(authSig) ? (
          <>
            <Flex
              flex={1}
              align="center"
              as="a"
              target="_blank"
              href={`https://goerli.etherscan.io/address/${authSig.address}`}
              sx={{ ":hover": { opacity: 0.75 } }}
            >
              <Box mr={3}>
                <Jdenticon size="30px" value={authSig.address} />
              </Box>
              <Box flex={1}>{isNil(authSig) ? "" : authSig.address}</Box>
            </Flex>
            <Flex
              bg="#1E1930"
              color="#F893F6"
              p={3}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
              }}
              onClick={async () => {
			  
			    // disconnect from Lit Protocol
                LitJsSdk.disconnectWeb3()
				
				// clear stored states
                setAuthSig(null)
                await lf.removeItem("lit-authSig")
                setUserTokenIDs([])
              }}
            >
              Disconnect
            </Flex>
          </>
        ) : (
          <>
            <Box flex={1} />
            <Box
              bg="#1E1930"
              color="#F893F6"
              p={3}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
              }}
              onClick={async () => {
			  
			    // connect with Lit Protocol
                lit = new LitJsSdk.LitNodeClient()
                await lit.connect()
                const authSig = await LitJsSdk.checkAndSignAuthMessage({
                  chain: "goerli",
                })
				
				// store authSig to a react state and persistent storage for the next session
                setAuthSig(authSig)
                await lf.setItem("lit-authSig", authSig)
              }}
            >
              Connect with Lit Protocol
            </Box>
          </>
        )}
      </Flex>

      <Flex justify="center" width="600px" py={3}>
        <Box flex={1}>
          {posting ? (
            <Flex align="center">
              <Spinner boxSize="18px" mr={3} />
              posting...
            </Flex>
          ) : (
            "Mint NFT and post encrypted group messages to tokenIDs! (e.g. 1,2,3)"
          )}
        </Box>
        <Box
          as="a"
          target="_blank"
          sx={{ textDecoration: "underline" }}
          href={`https://goerli.etherscan.io/token/${nftContractAddr}#writeContract`}
        >
          Mint NFT
        </Box>
      </Flex>
    </>
```
#### Footer

:::note Footer View

![](/img/relayer-lit-6.png)

:::

The Footer is just a link to the Warp contract page on Sonar. So users can view transactions. Nothing special.

```jsx
  const Footer = () => (
    <Flex w="100%" justify="center" p={4} bg="#1E1930" color="#F893F6">
      <Flex>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
        >
          Contract Transactions
        </Box>
      </Flex>
    </Flex>
  )
```

#### Post

:::note Post View

![](/img/relayer-lit-4.png)

:::

The Post component lets you post a message with your tokenIDs, and this is where the business takes place.

```jsx
  const Post = () => {
    const [message, setMessage] = useState("")
    const [tokenIDs, setTokenIDs] = useState("")
    return (
      <Flex width="600px">
        <Flex
          width="100%"
          bg="rgba(255,255,255,0.25)"
          direction="column"
          p={4}
          mb={5}
          sx={{
            boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
            borderRadius: "10px",
          }}
        >
          <Textarea
            mb={3}
            height="200px"
            bg="white"
            color="#1E1930"
            disabled={posting}
            flex={1}
            placeholder="Message"
            sx={{ borderRadius: "3px" }}
            value={message}
            onChange={e => {
              setMessage(e.target.value)
            }}
          />

          <Flex justify="center" width="100%" align="center">
            <Input
              bg="white"
              color="#1E1930"
              disabled={posting}
              w="150px"
              placeholder="tokenIDs"
              sx={{ borderRadius: "3px" }}
              value={tokenIDs}
              onChange={e => setTokenIDs(e.target.value)}
            />
            <Box ml={3}>
              Your Token: {userTokenIDs.join(",")} (include at least one)
            </Box>
            <Box flex={1} />
            <Flex
              px={14}
              align="center"
              justify="center"
              width="75px"
              height="40px"
              bg="#1E1930"
              color="#F893F6"
              fontSize="16px"
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                if (!posting) {
                  setPosting(true)
				  
				  // data validation
                  if (tokenIDs === "") {
                    alert("enter your tokenID")
                    setPosting(false)
                    return
                  }
                  if (/^\s*$/.test(message)) {
                    alert("enter message")
                    setPosting(false)
                    return
                  }

                  let isNaN = false
                  let packaged = null
                  const _tokenIDs = map(v => {
                    if (Number.isNaN(+trim(v))) isNaN = true
                    return +trim(v)
                  })(tokenIDs.split(","))
                  if (intersection(_tokenIDs, userTokenIDs).length === 0) {
                    alert("include at least one of your tokens")
                    setPosting(false)
                    return
                  }
                  if (isNaN) {
                    alert("Enter numbers")
                    setPosting(false)
                    return
                  }
				  
				  // a custom EVM access condition for Lit Protocol
				  // isOwner(addr, tokenIDs) has to return true to decrypt the message
                  let evmContractConditions = [
                    {
                      contractAddress:
                        process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDR,
                      functionName: "isOwner",
                      functionParams: [
                        ":userAddress",
                        JSON.stringify(_tokenIDs),
                      ],
                      functionAbi: {
                        inputs: [
                          {
                            internalType: "address",
                            name: "addr",
                            type: "address",
                          },
                          {
                            internalType: "uint256[]",
                            name: "tokens",
                            type: "uint256[]",
                          },
                        ],
                        name: "isOwner",
                        outputs: [
                          {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                          },
                        ],
                        stateMutability: "view",
                        type: "function",
                      },
                      chain: "goerli",
                      returnValueTest: {
                        key: "",
                        comparator: "=",
                        value: "true",
                      },
                    },
                  ]
				  
				  // encrypt the message with Lit Protocol
                  try {
                    lit = new LitJsSdk.LitNodeClient()
                    await lit.connect()
                    const authSig = await LitJsSdk.checkAndSignAuthMessage({
                      chain: "goerli",
                    })
                    await lf.setItem("lit-authSig", authSig)
                    const { encryptedString, symmetricKey } =
                      await LitJsSdk.encryptString(message)
                    const encryptedSymmetricKey = await lit.saveEncryptionKey({
                      evmContractConditions,
                      symmetricKey,
                      authSig,
                      chain: "goerli",
                    })
                    const blobToDataURI = blob => {
                      return new Promise((resolve, reject) => {
                        var reader = new FileReader()

                        reader.onload = e => {
                          var data = e.target.result
                          resolve(data)
                        }
                        reader.readAsDataURL(blob)
                      })
                    }
                    const encryptedData = await blobToDataURI(encryptedString)
					
					// create package data into an object (we call it a lit object)
                    packaged = {
                      encryptedData,
                      encryptedSymmetricKey: Array.from(encryptedSymmetricKey),
                      evmContractConditions,
                    }
                  } catch (e) {
                    alert("something went wrong")
                  }
				  
				  // sign the query and send it to the relayer
                  try {
                    const provider = new ethers.providers.Web3Provider(
                      window.ethereum,
                      "any"
                    )
                    await provider.send("eth_requestAccounts", [])
                    const addr = await provider.getSigner().getAddress()

                    const params = await sdk.sign(
                      "add",
                      { date: sdk.ts() },
                      "lit_messages",
                      {
                        wallet: addr,
                        jobID: "lit",
                      }
                    )
					
					// send the signed params and the lit object to the relayer
                    const res = await fetch("/api/isOwner", {
                      method: "POST",
                      body: JSON.stringify({ params, lit: packaged }),
                    }).then(v => v.json())
                    if (res.success === false) {
                      alert("Something went wrong")
                    } else {
					
					  // if successful, clear forms and update the message list
                      setMessage("")
                      setTokenIDs("")
                      setMessages(
                        compose(
                          reverse,
                          sortBy(prop("date")),
                          append({
                            tokenIDs: _tokenIDs,
                            date: Math.round(Date.now() / 1000),
                            text: message,
                            owner: authSig.address,
                          })
                        )(messages)
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
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    )
  }
```

#### Messages

:::note Messages View

![](/img/relayer-lit-5.png)

:::


The Messages component loops through and displays the `messages`.

```jsx
  const Messages = () => (
    <Box>
      {map(v => (
        <Flex
          p={2}
          bg="#4C2471"
          color="white"
          m={4}
          sx={{
            borderRadius: "10px",
            boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
          }}
          w="600px"
        >
          <Flex justify="center" py={2} px={4}>
            <Flex direction="column">
              <Flex bg="white" sx={{ borderRadius: "50%" }} p={2}>
                <Jdenticon size="30px" value={v.owner} />
              </Flex>
              <Flex justify="center" mt={2} fontSize="12px">
                {v.owner.slice(0, 7)}
              </Flex>
            </Flex>
          </Flex>
          <Flex p={2} flex={1} mx={2} fontSize="16px" direction="column">
            <Box flex={1}>{v.text}</Box>
            <Flex fontSize="12px" color="#F893F6">
              <Box>To: {v.tokenIDs.join(", ")}</Box>
              <Box flex={1} />
              <Box>{dayjs(v.date * 1000).fromNow()}</Box>
            </Flex>
          </Flex>
        </Flex>
      ))(messages)}
    </Box>
  )
```
#### Return Components

Now return all the components wrapped by `<ChakraProvider>` tag for UI.

```jsx
  return (
    <ChakraProvider>
      <style jsx global>{`
        html,
        #__next,
        body {
          height: 100%;
        }
        body {
          color: white;
          background-image: radial-gradient(
            circle,
            #b51da6,
            #94259a,
            #75288c,
            #58277b,
            #3e2368
          );
        }
      `}</style>
      <Flex direction="column" minHeight="100%" justify="center" align="center">
        <Flex direction="column" align="center" fontSize="12px" flex={1}>
          <Header />
          {isNil(authSig) ? null : (
            <>
              <Post />
              <Messages />
            </>
          )}
        </Flex>
        <Footer />
      </Flex>
    </ChakraProvider>
  )
```


#### The Complete Code

You can also access the entire code [on Github](https://github.com/weavedb/weavedb/blob/master/examples/relayer-nft/pages/lit-protocol.js).

```jsx
import SDK from "weavedb-client"
import Jdenticon from "react-jdenticon"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  intersection,
  append,
  pluck,
  trim,
  reverse,
  compose,
  sortBy,
  values,
  assoc,
  map,
  indexBy,
  prop,
  isNil,
} from "ramda"
import {
  Spinner,
  Box,
  Flex,
  Textarea,
  Input,
  ChakraProvider,
} from "@chakra-ui/react"
import lf from "localforage"
import LitJsSdk from "@lit-protocol/sdk-browser"
import dayjs from "dayjs"
dayjs.extend(require("dayjs/plugin/relativeTime"))

let sdk, lit
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR

export default function Home() {
  const [messages, setMessages] = useState([])
  const [authSig, setAuthSig] = useState(null)
  const [userTokenIDs, setUserTokenIDs] = useState([])
  const [posting, setPosting] = useState(false)
  const [initSDK, setInitSDK] = useState(false)

  useEffect(() => {
    ;(async () => {
      setAuthSig(await lf.getItem("lit-authSig"))
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      sdk = _sdk
      setInitSDK(true)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!isNil(authSig) && initSDK) {
        const query = `
{
  user (id: "${authSig.address}"){
    tokens{
     id
    }
  }
}`

        const data = await fetch(
          "https://api.thegraph.com/subgraphs/name/ocrybit/weavedb-relayer-nft-demo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ query }),
          }
        ).then(r => r.json())
        const tokenIDs = compose(
          map(v => +v),
          pluck("id")
        )(data.data.user.tokens)
        setUserTokenIDs(tokenIDs)
        const res = await sdk.get(
          "lit_messages",
          ["tokenIDs", "array-contains-any", tokenIDs],
          ["date", "desc"]
        )
        lit = new LitJsSdk.LitNodeClient()
        await lit.connect()
        let _messages = []
        for (const msg of res) {
          const {
            evmContractConditions,
            encryptedSymmetricKey,
            encryptedData,
          } = msg.lit
          const symmetricKey = await lit.getEncryptionKey({
            evmContractConditions,
            toDecrypt: LitJsSdk.uint8arrayToString(
              new Uint8Array(encryptedSymmetricKey),
              "base16"
            ),
            chain: "goerli",
            authSig,
          })
          const dataURItoBlob = dataURI => {
            var byteString = window.atob(dataURI.split(",")[1])
            var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
            var ab = new ArrayBuffer(byteString.length)
            var ia = new Uint8Array(ab)
            for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }

            var blob = new Blob([ab], { type: mimeString })

            return blob
          }
          const decryptedString = await LitJsSdk.decryptString(
            dataURItoBlob(encryptedData),
            symmetricKey
          )
          _messages.push(assoc("text", decryptedString, msg))
        }
        setMessages(_messages)
      }
    })()
  }, [authSig, initSDK])

  const Header = () => (
    <>
      <Flex justify="center" width="600px" py={3} align="center">
        {!isNil(authSig) ? (
          <>
            <Flex
              flex={1}
              align="center"
              as="a"
              target="_blank"
              href={`https://goerli.etherscan.io/address/${authSig.address}`}
              sx={{ ":hover": { opacity: 0.75 } }}
            >
              <Box mr={3}>
                <Jdenticon size="30px" value={authSig.address} />
              </Box>
              <Box flex={1}>{isNil(authSig) ? "" : authSig.address}</Box>
            </Flex>
            <Flex
              bg="#1E1930"
              color="#F893F6"
              p={3}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
              }}
              onClick={async () => {
                LitJsSdk.disconnectWeb3()
                setAuthSig(null)
                await lf.removeItem("lit-authSig")
                setUserTokenIDs([])
              }}
            >
              Disconnect
            </Flex>
          </>
        ) : (
          <>
            <Box flex={1} />
            <Box
              bg="#1E1930"
              color="#F893F6"
              p={3}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
              }}
              onClick={async () => {
                lit = new LitJsSdk.LitNodeClient()
                await lit.connect()
                const authSig = await LitJsSdk.checkAndSignAuthMessage({
                  chain: "goerli",
                })
                setAuthSig(authSig)
                await lf.setItem("lit-authSig", authSig)
              }}
            >
              Connect with Lit Protocol
            </Box>
          </>
        )}
      </Flex>

      <Flex justify="center" width="600px" py={3}>
        <Box flex={1}>
          {posting ? (
            <Flex align="center">
              <Spinner boxSize="18px" mr={3} />
              posting...
            </Flex>
          ) : (
            "Mint NFT and post encrypted group messages to tokenIDs! (e.g. 1,2,3)"
          )}
        </Box>
        <Box
          as="a"
          target="_blank"
          sx={{ textDecoration: "underline" }}
          href={`https://goerli.etherscan.io/token/${nftContractAddr}#writeContract`}
        >
          Mint NFT
        </Box>
      </Flex>
    </>
  )

  const Footer = () => (
    <Flex w="100%" justify="center" p={4} bg="#1E1930" color="#F893F6">
      <Flex>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
        >
          Contract Transactions
        </Box>
      </Flex>
    </Flex>
  )

  const Post = () => {
    const [message, setMessage] = useState("")
    const [tokenIDs, setTokenIDs] = useState("")
    return (
      <Flex width="600px">
        <Flex
          width="100%"
          bg="rgba(255,255,255,0.25)"
          direction="column"
          p={4}
          mb={5}
          sx={{
            boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
            borderRadius: "10px",
          }}
        >
          <Textarea
            mb={3}
            height="200px"
            bg="white"
            color="#1E1930"
            disabled={posting}
            flex={1}
            placeholder="Message"
            sx={{ borderRadius: "3px" }}
            value={message}
            onChange={e => {
              setMessage(e.target.value)
            }}
          />

          <Flex justify="center" width="100%" align="center">
            <Input
              bg="white"
              color="#1E1930"
              disabled={posting}
              w="150px"
              placeholder="tokenIDs"
              sx={{ borderRadius: "3px" }}
              value={tokenIDs}
              onChange={e => setTokenIDs(e.target.value)}
            />
            <Box ml={3}>
              Your Token: {userTokenIDs.join(",")} (include at least one)
            </Box>
            <Box flex={1} />
            <Flex
              px={14}
              align="center"
              justify="center"
              width="75px"
              height="40px"
              bg="#1E1930"
              color="#F893F6"
              fontSize="16px"
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                if (!posting) {
                  setPosting(true)
                  if (tokenIDs === "") {
                    alert("enter your tokenID")
                    setPosting(false)
                    return
                  }
                  if (/^\s*$/.test(message)) {
                    alert("enter message")
                    setPosting(false)
                    return
                  }

                  let isNaN = false
                  let packaged = null
                  const _tokenIDs = map(v => {
                    if (Number.isNaN(+trim(v))) isNaN = true
                    return +trim(v)
                  })(tokenIDs.split(","))
                  if (intersection(_tokenIDs, userTokenIDs).length === 0) {
                    alert("include at least one of your tokens")
                    setPosting(false)
                    return
                  }
                  if (isNaN) {
                    alert("Enter numbers")
                    setPosting(false)
                    return
                  }
                  let evmContractConditions = [
                    {
                      contractAddress:
                        process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDR,
                      functionName: "isOwner",
                      functionParams: [
                        ":userAddress",
                        JSON.stringify(_tokenIDs),
                      ],
                      functionAbi: {
                        inputs: [
                          {
                            internalType: "address",
                            name: "addr",
                            type: "address",
                          },
                          {
                            internalType: "uint256[]",
                            name: "tokens",
                            type: "uint256[]",
                          },
                        ],
                        name: "isOwner",
                        outputs: [
                          {
                            internalType: "bool",
                            name: "",
                            type: "bool",
                          },
                        ],
                        stateMutability: "view",
                        type: "function",
                      },
                      chain: "goerli",
                      returnValueTest: {
                        key: "",
                        comparator: "=",
                        value: "true",
                      },
                    },
                  ]
                  try {
                    lit = new LitJsSdk.LitNodeClient()
                    await lit.connect()
                    const authSig = await LitJsSdk.checkAndSignAuthMessage({
                      chain: "goerli",
                    })
                    await lf.setItem("lit-authSig", authSig)
                    const { encryptedString, symmetricKey } =
                      await LitJsSdk.encryptString(message)
                    const encryptedSymmetricKey = await lit.saveEncryptionKey({
                      evmContractConditions,
                      symmetricKey,
                      authSig,
                      chain: "goerli",
                    })
                    const blobToDataURI = blob => {
                      return new Promise((resolve, reject) => {
                        var reader = new FileReader()

                        reader.onload = e => {
                          var data = e.target.result
                          resolve(data)
                        }
                        reader.readAsDataURL(blob)
                      })
                    }
                    const encryptedData = await blobToDataURI(encryptedString)
                    packaged = {
                      encryptedData,
                      encryptedSymmetricKey: Array.from(encryptedSymmetricKey),
                      evmContractConditions,
                    }
                  } catch (e) {
                    alert("something went wrong")
                  }
                  try {
                    const provider = new ethers.providers.Web3Provider(
                      window.ethereum,
                      "any"
                    )
                    await provider.send("eth_requestAccounts", [])
                    const addr = await provider.getSigner().getAddress()

                    const params = await sdk.sign(
                      "add",
                      { date: sdk.ts() },
                      "lit_messages",
                      {
                        wallet: addr,
                        jobID: "lit",
                      }
                    )
                    const res = await fetch("/api/isOwner", {
                      method: "POST",
                      body: JSON.stringify({ params, lit: packaged }),
                    }).then(v => v.json())
                    if (res.success === false) {
                      alert("Something went wrong")
                    } else {
                      setMessage("")
                      setTokenIDs("")
                      setMessages(
                        compose(
                          reverse,
                          sortBy(prop("date")),
                          append({
                            tokenIDs: _tokenIDs,
                            date: Math.round(Date.now() / 1000),
                            text: message,
                            owner: authSig.address,
                          })
                        )(messages)
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
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  const Messages = () => (
    <Box>
      {map(v => (
        <Flex
          p={2}
          bg="#4C2471"
          color="white"
          m={4}
          sx={{
            borderRadius: "10px",
            boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
          }}
          w="600px"
        >
          <Flex justify="center" py={2} px={4}>
            <Flex direction="column">
              <Flex bg="white" sx={{ borderRadius: "50%" }} p={2}>
                <Jdenticon size="30px" value={v.owner} />
              </Flex>
              <Flex justify="center" mt={2} fontSize="12px">
                {v.owner.slice(0, 7)}
              </Flex>
            </Flex>
          </Flex>
          <Flex p={2} flex={1} mx={2} fontSize="16px" direction="column">
            <Box flex={1}>{v.text}</Box>
            <Flex fontSize="12px" color="#F893F6">
              <Box>To: {v.tokenIDs.join(", ")}</Box>
              <Box flex={1} />
              <Box>{dayjs(v.date * 1000).fromNow()}</Box>
            </Flex>
          </Flex>
        </Flex>
      ))(messages)}
    </Box>
  )

  return (
    <ChakraProvider>
      <style jsx global>{`
        html,
        #__next,
        body {
          height: 100%;
        }
        body {
          color: white;
          background-image: radial-gradient(
            circle,
            #b51da6,
            #94259a,
            #75288c,
            #58277b,
            #3e2368
          );
        }
      `}</style>
      <Flex direction="column" minHeight="100%" justify="center" align="center">
        <Flex direction="column" align="center" fontSize="12px" flex={1}>
          <Header />
          {isNil(authSig) ? null : (
            <>
              <Post />
              <Messages />
            </>
          )}
        </Flex>
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
```
