export default {
  ipfs: {
    type: "object",
    required: ["cid", "json"],
    properties: {
      cid: {
        type: "string",
        pattern:
          "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{46}$",
      },
      json: { type: "object" },
    },
    additionalProperties: false,
  },
}
