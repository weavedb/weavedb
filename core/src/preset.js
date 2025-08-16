import draft_07 from "./jsonschema-draft-07.js"

const dir_schema = {
  type: "object",
  required: ["index", "schema", "auth"],
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
      },
    },
    auth: { type: "array" },
  },
  definitions: { draft_07 },
}

const dirs_set = [
  "set:dir",
  [
    ["=$isOwner", ["equals", "$signer", "$owner"]],
    ["=$dir", ["get()", ["_config", "info"]]],
    ["=$dirid", ["inc", "$dir.last_dir_id"]],
    ["mod()", { index: "$dirid" }],
    ["update()", [{ last_dir_id: "$dirid" }, "_config", "info"]],
    ["allowif()", "$isOwner"],
  ],
]

const init_query = { schema: dir_schema, auth: [dirs_set] }

export { init_query }
