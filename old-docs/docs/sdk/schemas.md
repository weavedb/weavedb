---
sidebar_position: 5
---
# Data Schemas

It's essential to set a presice data schema and access controls to each collection as otherwise WeaveDB is permissionless and anyone can put arbitrary data.

To validate write data, WeaveDB uses [jsonschema](https://github.com/tdegrunt/jsonschema) with a restriction that you cannot pass valiator functions.

Set a schema to a collection

```js
const schema = {
  type: "object",
  required: ["article_id", "date", "user_address"],
  properties: {
    article_id: {
      type: "string",
    },
    user_address: {
      type: "string",
    },
    date: {
      type: "number",
    },
  },
}
await db.setSchema(schema, "bookmarks")
```

Get the schema of a collection

```js
await db.getSchema(schema, "bookmarks")
```

Remove a schema from a collection

```js
await db.removeSchema(schema, "bookmarks")
```
