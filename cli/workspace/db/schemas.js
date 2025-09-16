export default {
  notes: {
    type: "object",
    required: ["id", "actor", "content", "published", "likes"],
    properties: {
      id: { type: "string" },
      actor: { type: "string", pattern: "^[a-zA-Z0-9_-]{43}$" },
      content: { type: "string", minLength: 1, maxLength: 140 },
      published: { type: "integer" },
      likes: { type: "integer" },
    },
    additionalProperties: false,
  },
  likes: {
    type: "object",
    required: ["actor", "object", "published"],
    properties: {
      actor: { type: "string", pattern: "^[a-zA-Z0-9_-]{43}$" },
      object: { type: "string" },
      published: { type: "integer" },
    },
    additionalProperties: false,
  },
}
