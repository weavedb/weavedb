---
sidebar_position: 3
---
# Web Console

## Run Web Console in Browser

Start the web console at [http://localhost:3000](http://localhost:3000).

```bash
cd console
yarn
yarn dev
```

You can sign in with MetaMask, view data, and test DB queries.

[REPL needs to be running](/docs/runlocally/repl) before starting the web console.


## Internet Identity

[Internet Identity](https://identity.ic0.app) (II) from Dfinity Internet Computer can be integrated into WeaveDB.

To test II with the console, run local canisters first.

```bash
git clone https://github.com/dfinity/internet-identity.git
cd internet-identity # or cd internet-identity/demos/using-dev-build
dfx start --background --clean
npm ci
dfx deploy --no-wallet --argument `(null)`
```

Now you can log into the web console with your II.
