---
sidebar_position: 1
---
# Data Schema

WeaveDB utilizes [JSON Schema](https://json-schema.org/) to validate incoming data.

It's essential to set a presice data schema and access control rules to each collection as otherwise WeaveDB is permissionless and anyone can put arbitrary data.

To validate write data, WeaveDB uses [jsonschema](https://github.com/tdegrunt/jsonschema) with a restriction that you cannot pass validator functions.

:::info
`db` is assumed to be the state variable storing the WeaveDB SDK object.

For references, see [Initialize WeaveDB](/docs/get-started#initialize-weavedb)
:::

In this example, we consider `bookmarks` as the name of our collection.

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
await db.getSchema("bookmarks")
```

Remove a schema from a collection

```js
await db.removeSchema(schema, "bookmarks")
```
