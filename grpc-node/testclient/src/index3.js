const WeaveDB = require("weavedb-sdk-node");
require("dotenv").config();

// const CONTRACT_TX_ID = "W00EhrAHqD2CxLd81N8yyCOOK0xtPTtfKIQEZGzKabU"
// const CONTRACT_TX_ID = "70uhR8YuJnvMmAEFxIdjdiYtvHiba1VKnWXPZmg4emQ"; // main_owner=arweave_wallet0 0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0
const CONTRACT_TX_ID = "J9FheVGK9qCc7j0zqrE0g6v6boHB7EXos3Xc_wfHdXQ"; // main_owner=eth_wallet0 0x0Fa4fE1a58a7815ADBc16D74111462661843B83B
// const contractTxId = "70uhR8YuJnvMmAEFxIdjdiYtvHiba1VKnWXPZmg4emQ"; // main_owner=arweave_wallet0 0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0

const COLLECTION_NAME = "tasks";
const EVM_WALLET_ADDRESS = process.env.EVM_WALLET_ADDRESS.toLowerCase();
const EVM_PRIVATE_KEY = Buffer.from(process.env.EVM_PRIVATE_KEY, "hex");

const wallet = {
  getAddressString: () => EVM_WALLET_ADDRESS,
  getPrivateKey: () => EVM_PRIVATE_KEY,
};

async function addTask(db) {
  const task = {
    task: "Hey! I'm a task",
    date: db.ts(),
    user_address: db.signer(),
    done: false,
  };

  const tx = await db.add(task, COLLECTION_NAME);
  console.log("Transaction:", tx);

  const result = await tx.getResult();
  console.log("Result:", result);
}

async function addTest(db) {
  const task = {
    task: "test",
    date: db.ts(),
    user_address: db.signer(),
    done: false,
  };

  const tx = await db.add(task, COLLECTION_NAME);
  console.log("Transaction:", tx);

  const result = await tx.getResult();
  console.log("Result:", result);
}

async function main() {
  try {
    const db = new WeaveDB({ contractTxId: CONTRACT_TX_ID });
    await db.init();
    db.setDefaultWallet(wallet, "evm");

    await addTask(db);
    await addTest(db);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    process.exit(0);
  }
}

main();
