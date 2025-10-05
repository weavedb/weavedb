import draft_07 from "./jsonschema-draft-07.js"

const dir_schema = {
  type: "object",
  required: ["index"],
  properties: { index: { type: "number" }, auth: { type: "object" } },
}

export { dir_schema }
