---
sidebar_position: 6
---
# Authentication

When writing to the DB, Ethereum-based addresses are authenticated with [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signatures. However, this requires dapp users to sign with Metamask for every action, and it's a very poor UX. To solve this, WeaveDB allows internal address linking, so dapp users can use disposal addresses for auto-signing.

There are 5 wallet integrations at the moment, which includes:

- [Metamask](https://metamask.io/) ([EVM](https://ethereum.org/en/developers/docs/evm/)) - `secp256k1`
- [Internet Identity](https://identity.ic0.app/) ([Dfinity](https://dfinity.org/)) - `ed25519`
- [ArConnect](https://www.arconnect.io/) ([Arweave](https://arweave.org/)) - `rsa256`
- [IntmaxWallet](https://www.intmaxwallet.io/) ([Intmax zkRollup](https://intmax.io/)) - `secp256k1-2` | `poseidon`
- [Lens Profile](https://polygonscan.com/token/0xdb46d1dc155634fbc732f92e853b10b288ad5a1d) ([Lens Protocol](https://lens.xyz)) - `secp256k1-2`

![](/img/wallets.png)

## Auth Flow for Dapps

Users will generate a disposal address by signing with Metamask when logging in to the dapp.

The disposal address will be verified and linked to the original metamask address within the WeaveDB contract.

The private key of the disposal address can be stored in a secure space on the client side such as [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

The dapp can auto-sign write transactions with the disposal private key instead of asking users to sign with Metamask for every action.

The transactions signed by the disposal private key will act as the original metamask address within the WeaveDB.

You can revoke the address link anytime and forget about the disposal address.

This will create a great UX for dapps where users only sign once for address linking (this is also instant) and dapp transactions are free, instant and automatic all thanks to [Bundlr](https://bundlr.network/) used underneath.

## Temporary Address for Auto-signing

By generating a disposal address, dapp users won't be asked for a signature with a wallet popup every time they are to send a transaction. The disposal key stored in browser storage will auto-sign transactions.

### MetaMask (EVM)

Create a temporary address. Dapps would do this only once when users sign in.

```js
const expiry = 60 * 60 * 24 * 7 // set expiry to a week

// the first argument is to manually set a wallet.
// null will automatically use the browser-connected Metamask
const { identity } = await db.createTempAddress(null, expiry)

// or set no expiry
const { identity } = await db.createTempAddress()
```

Dapps can store the `identity` in the IndexedDB and auto-sign when the user creates transactions.

Query DB with the temporary address

```js
await db.add({ name: "Bob", age: 20 }, "people", identity)
```

### Internet Identity (DFINITY)

[Internet Identity](https://identity.ic0.app/) enables biometric authentication on any device.

```js
import { AuthClient } from "@dfinity/auth-client"

const iiUrl = `https://identity.ic0.app`
const authClient = await AuthClient.create()
  await new Promise((resolve, reject) => {
  authClient.login({
    identityProvider: iiUrl,
	onSuccess: resolve,
	onError: reject
  })
})

const ii = authClient.getIdentity()
if (isNil(ii._inner)) return
const addr = ii._inner.toJSON()[0]
const expiry = 60 * 60 * 24 * 7 // set expiry to a week

const { identity } = await db.createTempAddressWithII(ii, expiry)

// or set no expiry
const { identity } = await db.createTempAddressWithII(ii)
```

### ArConnect (Arweave)

[ArConnect](https://arconnect.io) is a simple browser wallet for Arweave.

```js
const expiry = 60 * 60 * 24 * 7 // set expiry to a week

const { identity } = await db.createTempAddressWithAR(null, expiry)

// or set no expiry
const { identity } = await db.createTempAddressWithAR()
```

### IntmaxWallet (Intmax)

[Intmax](https://intmax.io) is the most scalable Ethereum L2 zkRollup with privacy for the web.

```js
import { IntmaxWalletSigner } from "webmax"

const signer = new IntmaxWalletSigner()
let addr = null
try {
  await signer.connectToAccount()
  addr.signer._account
} catch (e) {
  console.log(e)
}
const expiry = 60 * 60 * 24 * 7 // set expiry to a week

const { identity } = db.createTempAddressWithIntmax(signer, expiry)

// or set no expiry
const { identity } = db.createTempAddressWithIntmax(signer)
```

### Lens Profile (Lens Protocol)

[Lens Protocol](https://lens.xyz) is a Polygon-based NFT social protocol. WeaveDB utilizes [Lit Protocol](https://litprotocol.com/) to securely authenticate Lens Profile NFT.

```js
const expiry = 60 * 60 * 24 * 7 // set expiry to a week

const { identity } = db.createTempAddressWithLens(expiry)

// or set no expiry
const { identity } = db.createTempAddressWithLens()
```

## Get Address Link

Get an linked address

```js
await db.getAddressLink(address)
```

## Remove Address Link

Remove an address link

```js
await db.removeAddressLink({ address: identity.address })
```

## Without Temporary Address

You can also write to the DB without a temporary address, which requires a manual signature every time you write.

### MetaMask (EVM)

```js
await db.add({ name: "Bob", age: 20 }, "ppl")
```

### Internet Identity (DFINITY)

```js
await db.add({ name: "Bob", age: 20 }, "ppl", { ii: ii })
```

### ArConnect (Arweave)

```js
await db.add({ name: "Bob", age: 20 }, "ppl", { ar: wallet })
```

### IntmaxWallet (Intmax)

```js
await db.add({ name: "Bob", age: 20 }, "ppl", { intmax: signer })
```
## Setting Authentication Algorithms

WeaveDB defaults to use all algorithms, but you can specify authentication algorithms to enable for your instance.

### Algorithms

- `secp256k1` : for EVM-based accounts ( Metamask )
- `ed25519` : for DFINITY ( Internet Identity )
- `rsa256` : for Arweave ( ArConnect )
- `poseidon` : for IntmaxWallet with Zero Knowledge Proof ( temporaliry disabled )
- `secp256k1-2` : for Lens Profile, and IntmaxWallet with EVM-based accounts

You can enable/disable authentication by setting required algorithms listed above.

`secp256k1` is for [EIP712](https://eips.ethereum.org/EIPS/eip-712) typed structured data signatures and `secp256k1-2` is for regular [EIP191](https://eips.ethereum.org/EIPS/eip-191) signatures used in Lit Action.

### Set Algorithms

For example, to enable Arweave, and disable the others.

```javascript
await db.setAlgorithms([ "rsa256" ])
```

For example, to enable only EVM, Arweave and Lens.
```javascript
await db.setAlgorithms(["secp256k1","rsa256","secp256k1-2"])
```

## setDefaultWallet

You can set a default wallet and it will be used if no wallet is specified with queries.

### MetaMask (EVM)

```js
db.setDefaultWallet(wallet, "evm")
```

### Internet Identity (DFINITY)

```js
db.setDefaultWallet(wallet, "ii")
```

### ArConnect (Arweave)

```js
db.setDefaultWallet(wallet, "ar")
```

### IntmaxWallet (Intmax)

```js
db.setDefaultWallet(wallet, "intmax")
```
