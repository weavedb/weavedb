const WeaveDB = require("weavedb-sdk-node");
require("dotenv").config();

// const arweave_wallet = require("./arweave-keyfile-0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0.json");
// const contractTxId = "70uhR8YuJnvMmAEFxIdjdiYtvHiba1VKnWXPZmg4emQ"; // main_owner=arweave_wallet0 0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0
const contractTxId = "J9FheVGK9qCc7j0zqrE0g6v6boHB7EXos3Xc_wfHdXQ"; // main_owner=eth_wallet0 0x0Fa4fE1a58a7815ADBc16D74111462661843B83B
// const contractTxId = "ioRYutPpDbzDC6OCJSw03jhA6PzuQ-X1jF1HJDRt8AU"; // main_owner=eth_wallet0 0x0Fa4fE1a58a7815ADBc16D74111462661843B83B

const EVM_WALLET_ADDRESS = process.env.EVM_WALLET_ADDRESS.toLowerCase();
const EVM_PRIVATE_KEY = Buffer.from(process.env.EVM_PRIVATE_KEY, "hex");
const TASKS_COLLECTION_NAME = "tasks";

const wallet = {
  getAddressString: () => EVM_WALLET_ADDRESS,
  getPrivateKey: () => EVM_PRIVATE_KEY,
};

(async () => {
  console.log("contractTxId:", contractTxId);

  // const db = new WeaveDB({
  //   contractTxId: contractTxId,
  // });
  const db = new WeaveDB({ contractTxId: contractTxId });
  await db.init({});
  db.setDefaultWallet(wallet, "evm");

  // console.log(
  //   "setRules: ",
  //   await db.setRules({ "allow write": true }, "test", true),
  // );
  // console.log(
  //   "setRules: ",
  //   await db.setRules({ "allow write": true }, "tset", true),
  // );
  // console.log(
  //   "db.add: ",
  //   await db.set({ test: Date.now() + 1234 }, "tset", "test", {
  //     nocache: true,
  //   }),
  // );
  // console.log(
  //   "db.add: ",
  //   await (
  //     await db.set({ test: Date.now() + 1234 }, "test", "test2")
  //   ).getResult(),
  // );
  const tx0 = await db.add({ test: Date.now() + 1234 }, "test");
  console.log("db.add tx0: ", tx0);
  const ret0 = await tx0.getResult();
  console.log("db.add ret0: ", ret0);

  const ret = await db.cget("test", 100);
  console.log("await db.cget('test'): ", ret);
  console.log("count: ", ret.length);

  console.log("await db.listCollections(): ", await db.listCollections());
  process.exit(0);
})();
