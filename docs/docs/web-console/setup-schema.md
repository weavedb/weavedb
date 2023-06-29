---
sidebar_position: 4
---
# Set up Data Schema

In this example, let's set a schema to the `people` collection.

```javascript
{
  type: "object",
  required: ["name", "age"],
  properties: {
    name: { type: "string" },
    age: { type: "number" }
  }
}
```

This means:

- the document must be an `object`
- `name` and `age` fields are required
- `name` must be `string`
- `age` must be `number`

To add the schema, click `Schema` in the side menu, select `people` from collection list, then click `+` in the top right corner of the Schema box.

![](/img/quick-start-3.png)

You can copy & paste the schema object above to the popped-up textarea and hit `Add`.

![](/img/quick-start-4.png)

Now you cannot add a document to `people` violating the schema, such as:

```bash
set {name:123,age:"Bob"} people Bob
```

