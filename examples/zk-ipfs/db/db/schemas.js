export default {
  ipfs: {
    type: "object",
    required: ["cid", "json", "date", "owner"],
    properties: {
      cid: {
        type: "string",
        pattern:
          "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{46}$",
      },
      json: { type: "object" },
      date: { type: "integer" },
      owner: {
        type: "string",
        pattern: "^[0-9a-zA-Z_-]{43}$",
      },
    },
    additionalProperties: false,
  },
}
