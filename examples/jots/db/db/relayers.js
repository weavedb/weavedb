module.exports = {
  profile: {
    schema: {
      type: "object",
      required: [],
      properties: {
        image: { type: "string" },
        cover: { type: "string" },
      },
    },
  },
  article: {
    schema: {
      type: "object",
      required: [],
      properties: {
        body: { type: "string" },
        cover: { type: "string" },
      },
    },
  },
}
