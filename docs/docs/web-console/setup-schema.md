---
sidebar_position: 4
---
# Set up Data Schema

Navigate to the `Schema` section in the side menu, select `people` from the collections list, then click `+` in the top right corner.

![](/img/quick-start-3.png)

In this example, we are defining a schema for the `people` collection, which dictates that the document must be an object and should include required fields for `name` (with a data type of string) and `age` (with a data type of number).

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

You can copy & paste the schema object above to the popped-up textarea and hit `Add`.

![](/img/quick-start-4.png)

With the defined schema, you cannot add a document that violates the schema requirements. For example: 

```bash
set {name:123,age:"Bob"} people Bob
```

