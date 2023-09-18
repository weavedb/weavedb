// const DB = require("weavedb-sdk-node");
const DB = require("weavedb-node-client");
require("dotenv").config();
// import SDK from "weavedb-client"
const COLLECTION_NAME = "ppls";

// const EVM_WALLET_ADDRESS = process.env.EVM_WALLET_ADDRESS.toLowerCase();
const EVM_WALLET_ADDRESS = process.env.EVM_WALLET_ADDRESS;
const EVM_PRIVATE_KEY = Buffer.from(process.env.EVM_PRIVATE_KEY, "hex");

const wallet = {
  getAddressString: () => EVM_WALLET_ADDRESS,
  getPrivateKey: () => EVM_PRIVATE_KEY,
};

// const arweav _wallet = require("./wallet-USW6hUOZ9RZm5w9tTVVhnneIFRVmffH0CsHd9H8au-s.json");
// const arweave_wallet = require("./arweave-keyfile-0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0.json");

// const contractTxId = "klaVHpNE-Z9z6ZuiMky8_nhvULg2iGoRdqgsE90-uXg";
// const contr  actTxId = "70uhR8YuJnvMmAEFxIdjdiYtvHiba1VKnWXPZmg4emQ"; // main_owner=arweave_wallet0 0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0
// const contractTxId = "J9FheVGK9qCc7j0  zqrE0g6v6boHB7EXos3Xc_wfHdXQ"; // main_owner=eth_wallet0 0x0fa4fe1a58a7815adbc16d74111462661843b83b
const contractTxId = "7-_p-08gQiD8HbcVK0uYD0SZhh37SGzmKf8JOdipS4g"; // main_owner=eth_wallet0 0x0fa4fe1a58a7815adbc16d74111462661843b83b
// const contractTxId = "ioRYutPpDbzDC6OCJSw03jhA6PzuQ-X1jF1HJDRt8AU"; // main_owner=eth_wallet0 0x0fa4fe1a58a7815adbc16d74111462661843b83b
// const rpc = "http://3.29.190.91:9091";
// const rpc = "rollup-node-me-central-1-testnet.weavedb-node.xyz:9091";
// const rpc = "rollup-node-me-central-1-testnet.weavedb-node.xyz:8080";
// const rpc = "https://rollup-node-testnet.weavedb-node.xyz:443";
// const rpc = "rollup-node-testnet.weavedb-node.xyz:443";
// const rpc = "rollup-testnet.weavedb-node.xyz:9090";
// const rpc = "rollup-me-central-1-testnet.weavedb-node.xyz:9091";
//http://alb-rollup-testnet-661026499.me-central-1.elb.amazonaws.com
//https://rollup-testnet.weavedb-node.xyz
// const rpc = "rollup-testnet.weavedb-node.xyz:9090";
// const rpc = "rollup-me-central-1-testnet.weavedb-node.xyz:9090";
// const rpc = "nlb-rollup-testnet.weavedb-node.xyz:9090";
// const rpc = "rollup-me-central-1-testnet.weavedb-node.xyz:9090";
// const rpc = "nlb-rollup-testnet.weavedb-node.xyz:8080";

// const rpc = "https://rollup-me-central-1-testnet.weavedb-node.xyz:8080";
// const rpc = "nlb-rollup-testnet.weavedb-node.xyz:8080";
// const rpc = "nlb-rollup-testnet.weavedb-node.xyz:8080";
// const rpc = "rollup-me-central-1-testnet.weavedb-node.xyz:9090";
// const rpc =  "rollup-me-central-1-testnet.weavedb-node.xyz";
// const rpc = "rollup-me-central-1-testnet.weavedb-node.xyz:8080";
// const rpc = "rollup-me-central-1-testnet.weavedb-node.xyz:9090";
const rpc = "localhost:9090";

(async () => {
  console.log("contractTxId:", contractTxId);
  const db = new DB({
    contractTxId: contractTxId,
    rpc: rpc,
  });

  db.setDefaultWallet(wallet, "evm");

  // const ret0 = await db.add({ aaa: "test", utime: Date.now() }, "test2", {
  //   nocache: true,
  // });

  const ret0 = await db.set(
    { name: "Alice" },
    COLLECTION_NAME,
    "Alice",
    // { evm: true, wallet: wallet },
  );

  console.log("ret0: ", ret0);
  // const docid = `doc_${Date.now()}`;
  // const ret2 = await db.set({ aaa: "test", utime: Date.now() }, "test2", docid);
  // console.log("ret2: ", ret2);
  // const ret = await db.get("test2");
  // console.log("count: ", re  t.length);
  // await db.commit();
  process.exit(0);
})();
