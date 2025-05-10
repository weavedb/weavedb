import draft_07 from "./jsonschema-draft-07.js"

const dir_schema = {
  type: "object",
  required: ["index", "schema", "auth"],
  additionalProperties: false,
  properties: {
    index: { type: "number" },
    schema: { $ref: "http://json-schema.org/draft-07/schema#" },
    docs: {
      type: "object",
      propertyNames: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]+$",
        maxLength: 42,
      },
      additionalProperties: {
        type: "object",
        required: ["schema"],
        properties: {
          schema: { $ref: "http://json-schema.org/draft-07/schema#" },
        },
        additionalProperties: false,
      },
    },
    auth: { type: "array" },
  },
  definitions: { draft_07 },
}

export { dir_schema }
