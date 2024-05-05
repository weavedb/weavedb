---
sidebar_position: 2
---
# REPL

## Run local DB instance and REPL

Run ArLocal and WeaveDB at `http://localhost:1820`.

This will start a REPL in your command line terminal where you can interactively test DB queries.

To execute write queries, `--wallet` needs to be set.

```bash
yarn repl --wallet mainnet
```

The REPL starts a new WeaveDB instance, so the first thing you need to do is to set some rules to collections.

```bash
> setRules({"allow write": true}, "collection_name")
```

Then you can start adding docs.

```bash
> add({field1: "val1", field2: "val2"}, "collection_name")
```

If you also start the [web console](/docs/runlocally/web-console), the REPL and the web console will be in sync, so you can manipulate the DB from both sides.

### Command Line Arguments

- `wallet` : A wallet name of the owner of the contract. If not provided, a random wallet will be generated.
- `dbPath` : A database path to save the persistent data.
- `port` : A port to run ArLocal, default to 1820.
- `contractTxId` : A tx id of the contract.
- `secure` : To deploy a contract with secure mode. No one can update data without schemas and access control rules in secure mode.

#### Use Existing Wallet

To use an existing wallet for deployment, save the JSON file in `/script/.wallets` directory with a name `wallet-[my_wallet_name].json`.

```bash
yarn repl --wallet my_wallet_name
```

#### Deploy DB in Secure Mode

With secure mode, you can set up access control rules to allow anyone to write to the contract.

Whereas without secure mode, anyone can write by default. Insecure mode is convenient for development.

```bash
yarn repl --secure
```

The seecure mode can be switched with `setSecure` method.

```js
await db.setSecure(false)
```

#### Change ArLocal Port

The local Arweave node runs on port `1820` by default.

```bash
yarn repl --port 1984
```

#### Change Cache Directory

The cache to make the database persistent is stored at `scripts/.db`, specify `dbPath` to change the location.

```bash
yarn repl --dbPath scripts/.db
```

#### Interact with Existing Contract

Take note of the `contractTxId` displayed in the console.

```js
{
  contractTxId: 'Mw7Q1LF3uC9cYgyr5dM860HGlwNfxILNXkcg0RNXIFc',
  srcTxId: 'NrErHqzps1ZhNTjNJlzR3l0DJ5NYYlFCBkfgCLkGv7M'
}
```
Then specify the `contractTxId` when running REPL next time.

```bash
yarn repl --dbPath scripts/.db --contractTxId Mw7Q1LF3uC9cYgyr5dM860HGlwNfxILNXkcg0RNXIFc
```

Note that you can only interact with local contract with REPL.
