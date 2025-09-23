export default {
  ipfs: {
    type: "object",
    required: ["cid", "json"],
    properties: {
      cid: { type: "string" },
      json: { type: "object" },
    },
    additionalProperties: false,
  },
}
