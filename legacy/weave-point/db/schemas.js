module.exports = {
  points: {
    type: "object",
    require: ["symbol", "name", "totalSupply", "owner"],
    properties: {
      symbol: { type: "string" },
      name: { type: "string" },
      totalSupply: { type: "number" },
      owner: { type: "address" },
    },
  },
  events: {
    type: "object",
    require: ["op", "date", "signer", "amount", "symbol", "to", "from"],
    properties: {
      op: { type: "string" },
      from: { type: "string" },
      to: { type: "string" },
      date: { type: "number" },
      signer: { type: "string" },
      amount: { type: "number" },
      symbol: { type: "string" },
    },
  },
  balances: {
    type: "object",
    required: [],
    properties: {
      balance: { type: "number" },
      symbol: { type: "string" },
      address: { type: "string" },
    },
  },
}
