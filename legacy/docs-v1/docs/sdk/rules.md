---
sidebar_position: 6
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

## Preset Variables

You can access various data within the validation blocks.

```js
const data = {
  contract: { id, owners },
  request: {
    method,
	func,
    auth: { signer, relayer, jobID, extra },
    block: { height, timestamp },
    transaction: { id },
    resource: { data },
    id,
    path,
  },
  resource: { data, setter, newData, id, path },
}
```

#### contract

- `id` : contractTxId
- `owners` : contract owners, equivalent to `getOwner()`

#### Request

- `auth` : `signer` of the query, and relayer info (`relayer` / `jobID` / `extra`)
- `block` : block info
- `transaction` : transaction info
- `resource` : `data` in the query
- `id` : doc id
- `path` : collection / doc path

#### Resource

- `data` : data before this query
- `newData` : data after this query
- `id` : doc id
- `path` : collection / doc path
- `setter` : original creator of the doc

### Modify Updated Data

You can amend the updated data before it's stored by modifying `newData` in access control rules.

For example always add `signer` address field as `address` field.

```js
const rules = {
  let : { "resource.newData.address" : { var: "request.auth.signer" } },
  "allow create" : true
}
await db.setRules(rules, "people", { ar : arweave_wallet })
```

If you set `{ name : "Bob"}` with wallet `0xABC`, the stored data will be `{ name : "Bob", address : "0xABC" }`.

```js
await db.set({ name : "Bob" }, "people", "Bob")
expect(await db.get("people", "Bob")).to.eql({name : "Bob", address: "0xABC" }) // true
```

### Get Other Data

You can also execute `get` query in `let` variable assignments. Use the syntax `["get", [QUERY]]`.

The following will first get `Bob` from `ppl` collection and assign it to `user`, then set `age` field with the user's age.

```js
const rules = {
  "let create" : { "user" : ["get", ["ppl", "Bob"]], "resource.newData.age": {var: "user.age"} },
  "allow create" : true
}
```

### Conditional Statements

`if` and `ifelse` can be used for conditional statements in access control rules.

```js
// assigning age=20 if the name is Bob
const rules = {
  "let create" : { 
    "resource.newData.age" : ["if", ["equals", "Bob", {var: "resource.newData.name"}], 20] 
  },
  "allow create" : true
}

// assigning age=20 if the name is Bob, and age=30 otherwise
const rules = {
  "let create" : { 
    "resource.newData.age" : ["ifelse", ["equals", "Bob", {var: "resource.newData.name"}], 20, 30] 
  },
  "allow create" : true
}
```

### Renaming Method

You can rename `request.method` to something other than `create` / `update` / `delete` and assign rules to the renamed method for beter branching.

```js
// rename method to create_bob if the name is Bob, and only allow create_bob
const rules = {
  "let create" : { 
    "request.method" : ["if", ["equals", "Bob", {var: "resource.newData.name"}], "create_bob"] 
  },
  "allow create_bob" : true
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
