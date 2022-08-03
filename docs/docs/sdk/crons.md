---
sidebar_position: 6
---
# Crons

When writing to the DB, Ethereum-based addresses are authenticated with [EIP-712](https://eips.ethereum.org/EIPS/eip-712) signatures. However, this requires dapp users to sign with Metamask for every action, and it's a very poor UX. To solve this, WeaveDB allows internal address linking, so dapp users can use disposal addresses for auto-signing.

## Auth Flow for Dapps

Users will generate a disposal address by signing with Metamask when logging in to the dapp.

The disposal address will be verified and linked to the original metamask address within the WeaveDB contract.

The private key of the disposal address can be stored in a secure space on the client side such as [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

The dapp can auto-sign write transactions with the disposal private key instead of asking users to sign with Metamask for every action.

The transactions signed by the disposal private key will act as the original metamask address within the WeaveDB.

You can revoke the address link anytime and forget about the disposal address.

This will create a great UX for dapps where users only sign once for address linking (this is also instant) and dapp transactions are free, instant and automatic all thanks to [Bundlr](https://bundlr.network/) used underneath.

## Temporary Address for Auto-signing

Create a temporary address. Dapps would do this only once when users sign in.

```js
const { identity } = db.createTempAddress(METAMASK_ADDRESS)
```

Dapps can store the `identity` in the IndexedDB and auto-sign when the user creates transactions.

Query DB with the temporary address

```js
await db.add(
  { name: "Bob", age: 20 },
  "people",
  {
    wallet: METAMASK_ADDRESS,
    privateKey: identity.privateKey,
  }
)
```

Remove an address link

```js
await db.removeAddressLink({ address: identity.address })
```
