# The Wall EXM

![](../../assets/the-wall-exm.png)

This is a demo dapp built with [WeaveDB](https://weavedb.dev) on [Execution Machine](https://exm.dev).

You can access a working demo at [wall-exm.vercel.app](https://wall-exm.vercel.app/).

## Run Locally

### 1. Clone the WeaveDB repo.

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
```

### 2. Generate a test Arweave account.

```bash
node scripts/generate-wallet.js mainnet
```
A new wallet is stored at `scripts/.wallets/wallet-mainnet.json`

### 3. Deploy a WeaveDB function to EXM.

Sign up for [EXM](https://exm.dev) to get a token, if you haven't yet.

```bash
yarn deploy-exm [YOUR_TOKEN]
```

Take note of the `id` returned by the command. This is your `functionId`.

### 4. Set up the WeaveDB instance.

Set up data schemas and access control rules for the wall dapp.

```bash
node scripts/wall-setup-exm.js mainnet [YOUR_FUNCTION_ID] [YOUR_TOKEN]
```

### 5. Set environmental variables.

Move into the dapp directory, and install the dependencies.

```bash
cd examples/wall-exm
yarn
```

Create `.env.local` in the dapp root directory, and assign environmental variables.

```
TOKEN=[YOUR_TOKEN]
NEXT_PUBLIC_FUNCTION_ID=[YOUR_FUNCTION_ID]
```

### 6. Run the dapp.

```bash
yarn dev
```

Now the dapp is running at [localhost:3000](http://localhost:3000).
