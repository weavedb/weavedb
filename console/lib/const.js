export const tabs = [
  "DB",
  "Data",
  "Schemas",
  "Rules",
  "Indexes",
  "Crons",
  "Relayers",
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
      "setCanEvolve",
      "setSecure",
      "addOwner",
      "removeOwner",
      "linkContract",
      "removeContract",
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
  Nodes: { name: "gRPC Nodes" },
}

export const wallet_chains = ["Arweave", "EVM", "DFINITY", "Intmax"]

export const default_nodes = [
  {
    rpc: "https://grpc.asteroid.ac",
    contract: "ULKzK8dmkCCpoTiRpJi2ae3dh6Xfe3GzUbR7w0uInjI",
  },
]

export const per_page = 20
export const latest = "0.19.0"
export const rpc_types = [
  { key: "sdk", name: "None" },
  { key: "preset", name: "Preset" },
  { key: "custom", name: "Custom" },
]
export const preset_rpcs = [
  "https://grpc.weavedb-node.xyz",
  "http://localhost:8080",
]
