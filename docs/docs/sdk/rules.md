---
sidebar_position: 5
---
# Access Control

## Rules

Access control rules are as important as the schemas for decentralized database. WeaveDB rules are extremely powerful using [JsonLogic](https://jsonlogic.com/) with an original add-on that enables JSON-based [ramda](https://ramdajs.com/) functional programming.

Add rules

```js
const rules = {
  let: {
    id: [
      "join",
      ":",
      [
        { var: "resource.newData.article_id" },
        { var: "resource.newData.user_address" },
      ],
    ],
  },
  "allow create": {
    and: [
      { "!=": [{ var: "request.auth.signer" }, null] },
      {
        "==": [{ var: "resource.id" }, { var: "id" }],
      },
      {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
      {
        "==": [
          { var: "request.block.timestamp" },
          { var: "resource.newData.date" },
        ],
      },
    ],
  },
  "allow delete": {
    "!=": [
      { var: "request.auth.signer" },
      { var: "resource.newData.user_address" },
    ],
  },
}
await db.setRules(rules, "bookmarks")
```
Within the rules object, each top level key defines one rule. A keys should be a combination of (`allow` or `deny`) and (`write`, `create`, `update`, `delete`).

`allow write` is equivalent to `allow create,update,delete`.

You can access to various data within the validation blocks.

```js
const data = {
  request: {
    auth: { signer },
    block: { height, timestamp },
    transaction: { id },
    resource: { data },
    id,
    path,
  },
  resource: { data, setter, newData, id, path },
}
```

## Add-on: JSON-based Functional Programming
Javascript functions cannot be passed and stored with Warp contracts. So WeaveDB invented a powerful & simple way to do functional programming using JSON objects. You can use most of the [ramda](https://ramdajs.com) functions, which enables highly complex logics for access controls and data validations.

Within the rules object, you can define variables under `let` key and later use them within `allow/deny` validation blocks.


```js
const rules = {
  let: {
    id: [
      "join",
      ":",
      [
        { var: "resource.newData.article_id" },
        { var: "resource.newData.user_address" },
      ],
    ],
  },
  ...
}
```
For example, above is equivalent to

```js
const id = join(":", [ resource.newData.article_id, resource.newData.user_address ])
```
and later forcing doc ids to be `article_id:user_address` with JsonLogic.

```js
{
  "==": [{ var: "resource.id" }, { var: "id" }],
}
```
