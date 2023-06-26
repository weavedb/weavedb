---
sidebar_position: 9
---

# Web2 Auth with Next.ID

This demo is a variant of the [custom authentication](/docs/examples/custom-auth) flow to let WeaveDB dapps use web2 identities such as Twitter and Github.

[Next.ID](https://next.id) is a decentralized protocol to link web2 social identities to crypto public keys. You can, for example, use the [Mask Extension](https://mask.io/) or [MetaMask](https://metamask.io/) to sign a generated payload, and tweet it to your Twitter timeline, and verify your ownership of the Twitter account to link it to the signer public key, as explained [here](https://docs.next.id/getting-started/quick-start).

Once your web2 identity is verified, you can always proove that your crypto wallet is the owner of that identity, which could replace the centralized OAuth flow of web2 services.

:::info
We are in the process of making the Next.ID flow built-in with the WeaveDB SDK and the core contracts. This demo is rather to show you what is possible with the [custom authentication](/docs/examples/custom-auth) flow.
:::

## Authentication Flow

![](/img/nextid-auth.png)

You can try a working demo at [nextid-weavedb.vercel.app](https://nextid-weavedb.vercel.app/).

#### Short Version

1. Next.ID links a Twitter account to a crypto public key (EVM).
2. Lit Action verifies the Next.ID link and PKP signs a relay query.
3. WeaveDB verifies the PKP signature and links the Twitter handle with a disposal address.
4. The user can act as the Twitter identity on the dapp.


#### Long Version

1. The user specifies a Twitter account they own.
2. The dapp checks, if the connected crypto wallet owns the Twitter account via the [Next.ID ProofService](https://docs.next.id/proof-service/ps-intro).
3. If the wallet doesn't own it, the dapp asks the ProofService to generate a payload to sign, and have the wallet sign it.
4. The user posts, the generated tweet with the signature, and get the Tweet status ID.
5. The dapp asks the ProofService to verify the ownership.
6. Once the user wallet owns the Twitter account, the dapp creates a disposal temporary address and asks Lit Action to verify the ownership of the Twitter account and have the PKP sign the relay query.
7. The relay query will be sent to WeaveDB and WeaveDB verifies the PKP signature, and links the Twitter account with the temporary address. The temporary address is stored in the device local storage, and used to auto-sign dapp transactions so the dapp user won't need to be prompted for signature for every transaction.
8. Now the user is authenticated as the Twitter account and the whole authentication process is verifiable without involving web2 authentication providers.
9. The user creates and updates content as the Twitter account.

:::info
The Lit Action is an immutable script stored on IPFS, and the PKP can only sign in that script, which means as long as the PKP signature is valid, the ownership of the Twitter account is guaranteed by this verifiable flow. This is how WeaveDB can securely use data from outside sources by using Lit Actions as oracles.

The temp address is a disposal key pair stored on the local device to auto-sign transactions. So now the temp address can auto-sign and act on behalf of the tokenID owner without forcing the user to sign every transaction with wallet pop-ups.
:::

## 1. Deploy Contract

Deploy a WeaveDB contract using [the Web Console](https://console.weavedb.dev/), and get the `contractTxId`.

## 2. Write Lit Action Script

The script for this Lit Action is rather complex because we need vanilla JS code to convert a compressed secp256k1 public key to an address.
Let us omit the `toAddress()` function and focus on the main part to verify and sign the query. The entire script is deployed [here](https://cloudflare-ipfs.com/ipfs/QmQTJsCtEEvprBVRdhZGqXum2LBW82MbeB7VTXJqFMwiE1).

```javascript
/*
  const toAddress = (publicKey)=>{
    // convert the publicKey to an address
  }
*/

const go = async () => {
  const proofs = await fetch(
    `https://proof-service.next.id/v1/proof?platform=${platform}&identity=${handle}`
  ).then(v => v.json())
  let isValid = false
  for (const v of proofs.ids) {
    for (const v2 of v.proofs) {
      if (
        v2.platform === platform &&
        v2.is_valid &&
        v2.identity.toLowerCase() === handle &&
        toAddress(v.persona.slice(2)) === params.caller
      ) {
        isValid = true
        break
      }
    }
    if (isValid) break
  }
  if (!isValid) return null

  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  const query = {
    func: "relay",
    query: [`auth:nextid:${platform}`, params, { linkTo: handle }],
  }
  const message = {
    nonce: 1,
    query: JSON.stringify(query),
  }
  const data = {
    types: {
      EIP712Domain,
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain: {
      name: "weavedb",
      version: "1",
      verifyingContract,
    },
    primaryType: "Query",
    message,
  }
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
    message: JSON.stringify(data),
    publicKey,
    sigName: "sig1",
  })
}

go()
```

Upload the js file above to IPFS and get the `CID`. You could, for example, use [Pinata](https://www.pinata.cloud/) and they will be immediately available through [the Cloudflare gateway](https://developers.cloudflare.com/web3/how-to/use-ipfs-gateway/).

## 3. Mint/Grant/Burn PKP

[Mint/Grant/Burn a PKP](/docs/sdk/relayers#mint-grant-burn-pkp) on Chronicle testnet using the script below. You need to get some testnet LIT token through [the official faucet](https://faucet.litprotocol.com/).

```javascript
const bs58 = require("bs58")
const { Wallet, Contract, ethers } = require("ethers")
const privatekey = "ANY_EVM_PRIVATE_KEY" // this could be any account since the NFT will be immediately burnt
const ipfsCid = "YOUR_IPFS_CID"

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "keyType",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "ipfsCID",
        type: "bytes",
      },
    ],
    name: "mintGrantAndBurnNext",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
]

function getBytesFromMultihash(multihash) {
  const decoded = bs58.decode(multihash)
  return `0x${Buffer.from(decoded).toString("hex")}`
}

const go = async () => {
  const provider = new ethers.JsonRpcProvider(
    "https://chain-rpc.litprotocol.com/http"
  )

  const wallet = new Wallet(privatekey, provider)
  const contract = new Contract(
    "0x8F75a53F65e31DD0D2e40d0827becAaE2299D111",
    abi,
    wallet
  )

  const tx = await contract.mintGrantAndBurnNext(
    2,
    getBytesFromMultihash(ipfsCid),
    { value: "1" }
  )
  console.log(await tx.wait())
}

go()
```

#### PKP script

You can also run the sample script from the repo. Just replace your own values for `privatekey` and `ipfsCid` in [custom-auth-pkp.js](https://github.com/weavedb/weavedb/tree/master/examples/custom-auth/pkp-script/custom-auth-pkp.js)

Run the script using the terminal commands shown below.

```bash
cd examples/custom-auth/pkp-script
yarn
node custom-auth-pkp.js
```

Go to the Chronicle Explorer and check the [PKP NFT contract](https://lit-protocol.calderaexplorer.xyz/address/0x8F75a53F65e31DD0D2e40d0827becAaE2299D111)

Use the given hash or your wallet address to find your most recent transaction on the explorer. When you click on the equivalent transaction, the newly minted and burned tokenID will show up.

Now go to the PKP page on the Lit Explorer [https://explorer.litprotocol.com/pkps/[tokenID]](https://explorer.litprotocol.com/pkps/tokenID), and get the `PKP Public Key` and the `PKP ETH Address`.

## 4. Add RelayerJob

Add a relayer job named `auth:nextid:twitter` for the authentication method. You can use [the web console](https://console.weavedb.dev) or CLI.

#### Web Console

![](/img/console-relayers.png)

Fill in the `relayers` input field with the `ETH Address` that you had previously obtained from https://explorer.litprotocol.com/pkps/[tokenID]

Set the following schema for extra data 

```javascript
{
   relayers: [ PKP_ETH_ADDRESS ],
   schema: {
     type: "object",
     required: ["linkTo"],
     properties: {
       linkTo: {
         type: "string",
       },
     },
   },
 } 
```

#### CLI
```javascript
const job = {
   relayers: [ PKP_ETH_ADDRESS ],
   schema: {
     type: "object",
     required: ["linkTo"],
     properties: {
       linkTo: {
         type: "string",
       },
     },
   },
 } 
```

```javascript
await db.addRelayerJob("auth:nextid:twitter", job)
```

## 5. Authenticate Users

Let's build a simple app using NextJS.

```bash
npx create-next-app nextid-auth
cd nextid-auth
yarn add @lit-protocol/lit-node-client-nodejs ethers weavedb-sdk
yarn dev
```

Now the default app is running at [localhost:3000](http://localhost:3000/).

Create `.env.local` file with the following variables.

```bash
# public variables
NEXT_PUBLIC_CONTRACT_TX_ID="..."
NEXT_PUBLIC_PKP_ADDRESS="0x..."
NEXT_PUBLIC_PKP_PUBLIC_KEY="0x..."
NEXT_PUBLIC_IPFS_ID="..."

# private variables
TWITTER_BEARER_TOKEN="..."
AUTH_SIG= '{"sig":"...","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost:3000 wants you to sign in with your Ethereum account:\n0x...\n\n\nURI: http://localhost:3000/\nVersion: 1\nChain ID: 1\nNonce: Oqv19Q5ShqRJtttXh\nIssued At: 2023-06-21T08:42:51.899Z\nExpiration Time: 2123-05-28T08:42:51.837Z","address":"0x...}'
```

- `NEXT_PUBLIC_CONTRACT_TX_ID` - contractTxId when you deployed the WeaveDB contract.
- `NEXT_PUBLIC_PKP_ADDRESS` - ETH Address that you had previously obtained from https://explorer.litprotocol.com/pkps/[tokenID]
- `NEXT_PUBLIC_PKP_PUBLIC_KEY` - PKP Public Key that you had previously obtained from https://explorer.litprotocol.com/pkps/[tokenID]
- `NEXT_PUBLIC_IPFS_ID` - IPFS content identifier obtained from Pinata.
- `TWITTER_BEARER_TOKEN` - Twitter API bearer token to fetch profile data.
- `AUTH_SIG` - Lit Action [AuthSig](https://developer.litprotocol.com/sdk/explanation/authentication/authsig/) for the dapp admin to call the Lit Action.

You can get an AuthSig by runnining the following code in browser with the `expiration` set in 100 years. The dapp admin will connect with the Lit Action via the `/api/auth` endpoint, so you might not want the AuthSig to expire.

```javascript
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';

const authSig = await checkAndSignAuthMessage({
  chain: "ethereum",
  expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 100).toISOString()
});
```
:::info
You could let users call the Lit Action in browser, but in that case, the dapp needs to requre every user for an additional signature to generate an AuthSig, which will greatly degrade the authentication UX.
:::

#### `/api/auth`

Then update `/api/auth.js` with the following code. This is a serverless function to connect with the Lit Action to verify the ownership of your Twitter account via Next.ID, then fetch the profile data via Twitter API.

```javascript 
const { Signature } = require("ethers")
const LitJsSdk = require("@lit-protocol/lit-node-client-nodejs")

const pkp_address = process.env.NEXT_PUBLIC_PKP_ADDRESS
const publicKey = process.env.NEXT_PUBLIC_PKP_PUBLIC_KEY
const ipfsId = process.env.NEXT_PUBLIC_IPFS_ID
const verifyingContract = process.env.NEXT_PUBLIC_CONTRACT_TX_ID
const authSig = JSON.parse(process.env.AUTH_SIG)
const bearer = process.env.TWITTER_BEARER_TOKEN

export default async (req, res) => {
  const handle = req.body.params.query.linkTo
  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    litNetwork: "serrano",
  })
  await litNodeClient.connect()

  const _res = await litNodeClient.executeJs({
    ipfsId,
    authSig,
    jsParams: {
      platform: "twitter",
      handle,
      params: req.body.params,
      publicKey,
      verifyingContract,
    },
  })
  const _sig = _res.signatures.sig1
  const sig = Signature.from({
    r: "0x" + _sig.r,
    s: "0x" + _sig.s,
    v: _sig.recid,
  }).serialized
  if (sig === null) return res.json({success: false})

  const profile = await fetch(
    `https://api.twitter.com/1.1/users/show.json?screen_name=${handle}`,
    { headers: { Authorization: `Bearer ${bearer}` } }
  ).then(v => v.json())

  res.json({ success: true, profile, sig })
}
```

#### `/pages/index.js`

Finally, we will show you only the authentication related functions used in the frontend script at `/pages/index.js`. You can view the complete code [here](https://github.com/weavedb/weavedb/blob/master/examples/nextid-auth/pages/index.js).

##### connectWithWeaveDB

Connecting with an WeaveDB contract.

```javascript
export async function connectWithWeaveDB(contractTxId) {
  const sdk = new SDK({ contractTxId })
  await sdk.init()
  return sdk
}
```

##### getPubKey

Getting a public key of the connected account. It requires the wallet to sign a message to recover the associated public key.

```javascript
import { publicKey } from "eth-crypto"
import { SigningKey, getBytes, hashMessage, BrowserProvider } from "ethers"

export async function getPubKey(identity) {
  const signer = await new BrowserProvider(window.ethereum).getSigner()
  const addr = await signer.getAddress()
  const message = `Next.ID\nPlatform: twitter\nIdentity: ${identity}\nTimestamp: ${Date.now()}\nWallet Address: ${addr}`
  const pubKey = SigningKey.recoverPublicKey(
    getBytes(hashMessage(message)),
    await signer.signMessage(message)
  )
  const compressed = EthCrypto.publicKey.compress(pubKey.slice(2))
  const public_key = `0x${compressed}`
  return { public_key, addr, signer }
}
```

##### isOwner

Check if the given public key is the owner of the twitter identity via Next.ID.

```javascript
export async function isOwner(identity, public_key) {
  const proofs = await fetch(
    `https://proof-service.next.id/v1/proof?platform=twitter&identity=${identity}`
  ).then(v => v.json())
  for (const v of proofs.ids) {
    for (const v2 of v.proofs) {
      if (
        v2.platform === "twitter" &&
        v2.is_valid &&
        v2.identity.toLowerCase() === identity &&
        v.persona === public_key
      ) {
        return true
      }
    }
  }
  return false
}
```

##### signPayload

If `isOwner` returns `false`, we need to link the public key to the twitter identity via Next.ID. The first step is to sign the generated payload.

```javascript
export async function signPayload(identity, public_key, signer) {
  const res = await fetch("https://proof-service.next.id/v1/proof/payload", {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      platform: "twitter",
      identity,
      public_key,
    }),
  }).then(v => v.json())
  const sig = await signer.signMessage(res.sign_payload)
  const base64 = Buffer.from(sig.slice(2), "hex").toString("base64")
  const tweet = res.post_content.default
    .split("\n")
    .map(v => v.replace("%SIG_BASE64%", base64))
    .join("\n")
  return {
    signature: base64,
    uuid: res.uuid,
    created_at: res.created_at,
    tweet,
  }
}
```

##### verifyProof

The user needs to tweet the generated tweet with the signature and get the status id of the tweet. Then NextId will verify the ownership by checking the tweet.

```javascript
export async function verifyProof(statusID, nextID) {
  try {
    const verify = await fetch("https://proof-service.next.id/v1/proof", {
      method: "POST",
      body: JSON.stringify({
        action: "create",
        platform: "twitter",
        identity: nextID.identity,
        public_key: nextID.public_key,
        proof_location: statusID,
        extra: { signature: nextID.signature },
        uuid: nextID.uuid,
        created_at: nextID.created_at,
      }),
    }).then(v => v.json())
    return isEmpty(verify)
  } catch (e) {}
  return false
}
```

##### createTempAddress

Finally, the dapp will generate a temporary address and send a relay query to WeaveDB to link the twitter account to it with a signature from Lit Action to verify the ownership.

```javascript
export async function createTempAddress(handle, signer, sdk) {

  // sign a query to link a temporary address to the twitter handle
  const { identity: user_cred, tx: params } = await sdk._createTempAddress(
    (await signer.getAddress()).toLowerCase(),
    null,
    handle,
    {
      evm: signer,
      relay: true,
      jobID: `auth:nextid:twitter`,
    },
    "custom"
  )
  
  // get a signature from PKP via Lit Action, and the Twitter profile data
  const res = await fetch("/api/auth", {
    method: "POST",
    body: JSON.stringify({ params }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(v => v.json())
  if (isNil(res.sig)) {
    return { _user: null, id_user: null }
  }
  
  // construct a relay query to send to WeaveDB
  const relay_params = {
    function: "relay",
    query: [`auth:nextid:twitter`, params, { linkTo: params.query.linkTo }],
    signature: res.sig,
    nonce: 1,
    caller: process.env.NEXT_PUBLIC_PKP_ADDRESS.toLowerCase(),
    type: "secp256k1-2",
  }
  
  // send the relay query to WeaveDB
  const tx = await sdk.write("relay", relay_params)
  if (tx.success !== true) return { _user: null, id_user: null }

  const { profile } = res
  const new_user = {
    name: profile.name,
    image: profile.profile_image_url_https,
    uid: handle,
    handle,
  }
  const user_with_cred = mergeLeft(user_cred, new_user)
  
  // store the user data to WeaveDB users collection, if it doesn't exist
  const wuser = await sdk.get("users", handle)
  if (isNil(wuser)) {
    await sdk.set(new_user, "users", handle, user_with_cred)
  }
  return { new_user, user_with_cred }
}
```
You can try a working demo [here](https://nextid-weavedb.vercel.app/), and view the entire repo [here](https://github.com/weavedb/weavedb/tree/master/examples/nextid-auth).
