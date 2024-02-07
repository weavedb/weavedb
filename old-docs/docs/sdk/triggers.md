---
sidebar_position: 10
---
# Triggers

You can have one query trigger another query.

Triggered queries can bypass access control rules, so this comes in handy when updating one collection owned by a user and another collection not owned by the same person.

For example, a user likes a tweet, which triggers an increment of the like count that the user doesn't have access to update.

You can think of it as an equivalent to [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events?gen=2nd). It's an essential component when building apps.

## Add Triggers

- `key` : name of the trigger
- `on` : create | update | delete
- `func` : FPJSON logic

[FPJSON](https://fpjson.weavedb.dev/) will get an object containing the data `before` and `after` the change.

```javascript
{
  data: { before, after, id, setter }
}
```

A trigger to increment the like count.

```javascript
const { expect } = require("chai")

const trigger = {
  key: "inc-count",
  on: "create",
  func: [["upsert", [{ count: db.inc(1) }, "like-counts", { var: "data.id" }]]]
}
await db.addTrigger(trigger, "likes")

// like tweet
await db.set({ data: Date.now(), user: "Bob" }, "likes", "abc")

// like-count has been incremented
expect((await db.get("like-counts", "abc")).count).to.equal(1)
```

## Remove Triggers

Specify the trigger key to remove.

```javascript
await db.removeTrigger("inc-count", "like-counts")
```
