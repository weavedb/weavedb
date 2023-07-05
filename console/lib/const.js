export const tabs = [
  "DB",
  "Data",
  "Schemas",
  "Rules",
  "Indexes",
  "Crons",
  "Relayers",
  "Triggers",
  "Nodes",
]
export const methods = [
  {
    label: "Data Query Read",
    methods: [
      "get",
      "cget",
      "getNonce",
      "getIds",
      "listCollections",
      "getAddressLink",
    ],
  },
  {
    label: "Data Query Write",
    methods: [
      "add",
      "set",
      "update",
      "upsert",
      "delete",
      "batch",
      "relay",
      "addAddressLink",
      "removeAddressLink",
    ],
  },
  {
    label: "Instance Info",
    methods: [
      "getInfo",
      "getVersion",
      "getHash",
      "getEvolve",
      "getAlgorithms",
      "getOwner",
      "getSchema",
      "getRules",
      "getIndex",
      "getCrons",
      "getRelayerJob",
      "getLinkedContract",
      "listRelayerJobs",
      "getTriggers",
    ],
  },
  {
    label: "Admin Write",
    methods: [
      "addIndex",
      "removeIndex",
      "setRules",
      "setSchema",
      "addCron",
      "removeCron",
      "evolve",
      "migrate",
      "setAlgorithms",
      "setCanEvolve",
      "setSecure",
      "addOwner",
      "removeOwner",
      "linkContract",
      "removeContract",
      "addTrigger",
      "removeTrigger",
    ],
  },
]
export const tabmap = {
  DB: { name: "DB Instances" },
  Data: { name: "Data Collections" },
  Schemas: { name: "Schemas" },
  Rules: { name: "Access Control Rules" },
  Indexes: { name: "Indexes" },
  Crons: { name: "Crons" },
  Relayers: { name: "Relayers" },
  Triggers: { name: "Triggers" },
  Nodes: { name: "gRPC Nodes" },
}

export const wallet_chains = [
  "Arweave",
  "EVM",
  "DFINITY",
  "Intmax",
  "Lens",
  "WebAuthn",
]

export const default_nodes = [
  {
    rpc: "https://grpc.weavedb-node.xyz",
    contract: "XoHBBLZfrrpQIcvnrsWs69OoHfXwWMQWdAbYOifcTQA",
  },
]

export const per_page = 20

export const rpc_types = [
  { key: "none", name: "Local Cache" },
  { key: "sdk", name: "Warp DRE" },
  { key: "preset", name: "WeaveDB Node" },
  { key: "custom", name: "Custom" },
]
export const preset_rpcs = [
  "https://grpc.weavedb-node.xyz",
  "http://localhost:8080",
]

export const preset_dres = [
  "https://dre-1.warp.cc/contract",
  "https://dre-2.warp.cc/contract",
  "https://dre-3.warp.cc/contract",
  "https://dre-4.warp.cc/contract",
  "https://dre-5.warp.cc/contract",
  "https://dre-6.warp.cc/contract",
]

export const latest = "0.26.4"
export const weavedbSrcTxId = {
  "0.27.0": "jsZqVEOGdMFAvVlof_WXi6DO5vWxhteiG91xVPiIwqQ",
  "0.26.0": "zdP_QTSZ2zO9Nxa1sPAKhyR4geua1_a621_fZm2XPKU",
  "0.26.1": "OSYm83qQFF5gf4m3BbdZtrHMHjVAMPJcBhfZiJVYjYE",
  "0.26.2": "-TBbRLWsP8wAlj8y5bh7RHRdwGJ7kT9urFvEbn1UomQ",
  "0.26.3": "rTp2E6oipzJODmAGbqWbo2wzagoV7tt3JRyBsyVgo6A",
  "0.26.4": "QhbIPso1lx8wbHx4c7225L9PkNYh-Djp6N_YCjqdr_E",
}
//export const intmaxSrcTxId = "OTfBnNttwsi8b_95peWJ53eJJRqPrVh0s_0V-e5-s94"
export const dfinitySrcTxId = "3OnjOPuWzB138LOiNxqq2cKby2yANw6RWcQVEkztXX8"
export const ethereumSrcTxId = "Awwzwvw7qfc58cKS8cG3NsPdDet957-Bf-S1RcHry0w"
export const lens = {
  contract: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
  pkp_address: "0xF810D4a6F0118E6a6a86A9FBa0dd9EA669e1CC2E".toLowerCase(),
  pkp_publicKey:
    "0x04e1d2e8be025a1b8bb10b9c9a5ae9f11c02dbde892fee28e5060e146ae0df58182bdba7c7e801b75b80185c9e20a06944556a81355f117fcc5bd9a4851ac243e7",
  ipfsId: "QmYq1RhS5A1LaEFZqN5rCBGnggYC9orEgHc9qEwnPfJci8",
  abi: require("./lens.json"),
}
