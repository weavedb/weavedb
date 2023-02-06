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
  "get",
  "cget",
  "add",
  "set",
  "update",
  "upsert",
  "delete",
  "batch",
  "addIndex",
  "getIndex",
  "removeIndex",
  "setRules",
  "getRules",
  "setSchema",
  "getSchema",
  "addCron",
  "getCrons",
  "removeCron",
  "nonce",
  "ids",
  "evolve",
  "getLinkedContract",
  "getAddressLink",
  "getEvolve",
  "getAlgorithms",
  "getOwner",
  "getVersion",
  "getInfo",
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
