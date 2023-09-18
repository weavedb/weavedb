const WeaveDB = require("weavedb-sdk-node");
require("dotenv").config();

const CONTRACT_TX_ID = "7-_p-08gQiD8HbcVK0uYD0SZhh37SGzmKf8JOdipS4g";

const COLLECTION_NAME = "ppls";
const EVM_WALLET_ADDRESS = process.env.EVM_WALLET_ADDRESS.toLowerCase();
const EVM_PRIVATE_KEY = Buffer.from(process.env.EVM_PRIVATE_KEY, "hex");

const BUNDLER_EVM_WALLET_ADDRESS =
  process.env.BUNDLER_EVM_WALLET_ADDRESS.toLowerCase();
const BUNDLER_EVM_PRIVATE_KEY = Buffer.from(
  process.env.BUNDLER_EVM_PRIVATE_KEY,
  "hex",
);

const wallet = {
  getAddressString: () => EVM_WALLET_ADDRESS,
  getPrivateKey: () => EVM_PRIVATE_KEY,
};
const bundler_wallet = {
  getAddressString: () => BUNDLER_EVM_WALLET_ADDRESS,
  getPrivateKey: () => BUNDLER_EVM_PRIVATE_KEY,
};

async function main() {
  try {
    const db = new WeaveDB({ contractTxId: CONTRACT_TX_ID });
    await db.init();
    // db.setDefaultWallet(bundler_wallet, "evm");
    // db.setDefaultWallet(wallet, "evm");
    const nonce1 = await db.getNonce(
      "0x0fa4fe1a58a7815adbc16d74111462661843b83b",
    );
    const nonce2 = await db.getNonce(
      "0x8e7E1eCF5Ec8dC09b325F28E3162174248E9a426",
    );
    // console.log("nonce1: ", nonce1)

    // console.log("nonce2: ", nonce2)
    const query1 = await db.sign(
      "set",
      { name: "query1" },
      COLLECTION_NAME,
      "Bob",
      { evm: true, wallet: wallet },
    );
    // const query1 = await db.sign("set", { name: "query1" }, COLLECTION_NAME, "Bob", {evm: true, wallet:bundler_wallet});
    console.log("query1: ", query1);

    const query2 = await db.sign(
      "set",
      { name: "Alice" },
      COLLECTION_NAME,
      "Alice",
      { evm: true, wallet: wallet },
    );
    // const query2 = await db.sign("set", { name: "Alice" }, COLLECTION_NAME, "Alice", {evm: true, wallet:wallet});
    console.log("query2: ", query2);
    // const query3 = await db.sign("set", { name: "Beth" }, COLLECTION_NAME, "Beth", {
    //   evm: wallet,
    // });
    console.log("query2: ", query2);
    // console.log("query3: ", query3);
    // const tx = await db.bundle([query1, query2, query3])
    // console.log("query2: ", query2);
    // console.log("query3: ", query3);
    // const tx = await db.bundle([query1]);
    // const ret = await db.bundle([query1], {evm: true, wallet:bundler_wallet});
    // const ret = await db.bundle([query1, query2], {evm: true, wallet:bundler_wallet});
    // // // const ret = await db.bundle([query1, query2, query3], {evm: bundler_wallet})
    // console.log("ret: ", ret);
    // const ret = await tx.getResult();
    // console.log("ret: ", ret);

    // const tx4 = await db.add({ name: "Test" }, COLLECTION_NAME, {
    //   evm: wallet,
    // });
    // console.log("tx4: ", tx4);
    // const ret4 = await tx4.getResult();
    // console.log("ret4: ", ret4)
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  }
}

main();
