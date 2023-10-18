---
sidebar_position: 4
---

# FPJSON 2.0

FPJSON is a dmain specific language (DSL) for WeaveDB, and what makes a fully decentralized DB possible.

Apart from performance and scalability, you cannot just bring in an existing web2 database and decentralize it. A web3 database requires highly advanced logic around data ownerships, programmable data manipurations, and access control rules due to the permissionless nature.

Unlike web2 databases with only a few access gateways for admin users, anyone can write anything to a web3 DB from anywhere. We need precise controls over everything but in a decentralized fashion.

WeaveDB has decentralized features such as

- **Crypto Account Authentication** to manage data access and ownerships
- **Data Schemas** to constrain stored data format
- **Access Control Rules** to manage write permissions and manipulate data
- **Crons** to periodically execute queries
- **Triggers** to chain queries with pre-defined logic
- **Verifiable Relayers** to bring in data from outside data sources

Without these features, a web3 database would either be out of control or have only limited use cases. And all these are enabled by FPJSON as the simplest JSON style settings. FPJSON enables highly advanced, and composable functional programming in a simple JSON format, which makes WeaveDB itself the most powerful smart contract sandbox as well.

FPJSON 2.0 has made writing complex logic drastically simpler from [FPJSON 1.0](https://fpjson.weavedb.dev) with syntactic sugar. So to set up a DB instance, you just need to have all these [JSON configuration objects in one place](/docs/get-started/quick-start#write-db-settings), and execute a single-line of the setup command.

That's how simple yet indefinetely powerful the WeaveDB development is.

## Basic FPJSON Blocks

FPJSON is based upon [Ramda.js](https://ramdajs.com/) which comes from the functional programming ecosystem (I believe it's heavily inspired by [Haskell](https://www.haskell.org/)). You can use most of the [250+ pre-defined Ramda functions](https://fpjson.weavedb.dev/), and compose them in any depth of complexity, but in a simple JSON array format. The biggest advantage of JSON style programming is we can store any logic as a JSON data object as a smart contract state and reuse them to compose with other logic. This is the only viable (yet super powerful) way to dynamically construct, compose and extend logic after smart contract is immutably deployed without deploying a new contract.

Basic FPJSON blocks look something like these.

```js
/* add */
["add", 1, 2] // = 3

/* difference */
["difference", [1, 2, 3], [3, 4, 5]] // = [1, 2]

/* map */
[["map", ["inc"]], [1, 2, 3]] // = [4, 5, 6]

/* compose */
[["compose", ["map", ["inc"]], ["difference"]], [1, 2, 3], [3, 4, 5]] // = [2, 3]
```
Learn the 250+ powerful functions [here](https://fpjson.weavedb.dev).

## Accecc Control Rules with FPJSON

One big constraint of FPJSON is we can only do pure functional programming with [point-free style](https://en.wikipedia.org/wiki/Tacit_programming), which means functions cannot have arguments. Functional programming is extremely powerful, but pure FP sometimes makes it overly complicated and impractical to build a simple logic.

FPJSON 2.0 makes it easier and more practical by injecting side-effect variables and imperative programming features such as if-else conditional statement.

### allow() / deny()

The simplest form of access control rules is just allow everything.

```js
["write", ["allow()"]]
```

or deny everything.

```js
["write", ["deny()"]]
```

To set up the rules to a collection.

```js
// set only one condition
await db.setRules([ ["allow()"] ], "collection_name", "write")

// set multiple conditions
await db.setRules([ [ "create", ["allow()"] ], [ "delete", ["deny()"] ] ], "collection_name")
```
### Pattern Matching

The first element is an accepted operation and the condition will be evaluated only if the query matches the operation.

- `write` : includes everything
- `create` | `update` | `delete` : if the doc already exists, `update` will be applied to set and upsert operations.
- `add` | `set` | `update` | `upsert` | `delete` : these matche query types

You can always use the basic operation types, but a better solution is define custom operations such as `add:post` and `delete:post`.

```js
["add:post", ["allow()"]]
```

The first part of a custome tag matches query types, and the second part is an arbitrary operation name.

- custome tag: `type:name`
- types: `add` | `set` | `update` | `upsert` | `delete`

In this way, users will only be able to execute the preset custom queries, so you will be in better control.

```js
// a custom query
await db.query("add:post", {title: "Test", body: "hello"}, "posts")

// this will be rejected since "add" is undefined in the access rules
await db.add({title: "Test", body: "hello"}, "posts")
```

### Preset Variables

You can access preset variables in access rule evaluations as explained [here](http://localhost:3000/docs/sdk/rules#preset-variables).

```js
const data = {
  contract: { id, version, owners },
  request: {
    caller,
	op,
    method,
    func,
    auth: { signer, relayer, jobID, extra },
    block: { height, timestamp },
    transaction: { id, timestamp },
    resource: { data },
    id,
    path,
  },
  resource: { data, setter, newData, id, path },
}
```
:::info
`request.transaction.timestamp` is only available for L2 rollup queries, and it's in millisecond. Note that `request.block.timestamp` is in second and not reliable as it's the Arweave block timestamp rather than the granular transaction timestamp. Always use `$ms` over `$ts` for L2 queries.
:::

#### Shortcuts

To make things easiler, there are shortcut variables to most frequently used values. Most logic can be handled with these shortcuts.

- `signer` = `request.auth.signer` : transaction signer
- `id` = `request.id` : doc ID
- `ts` = `request.block.timestamp` : block timestamp in second
- `ms` = `request.transaction.timestamp` : transaction timestamp in millisecond (only L2)
- `new` = `resource.newData` : data after applying the query
- `old` = `resource.data` : data before applying the query
- `req` = `request.resource.data` : updating data in the query

For instance, if `{ title: "Title", body: "hellow"}` is already stored, and the query is updating `{body: "bye"}`, the following is what will be assigned.

- `$old` : `{ title: "Title", body: "hellow" }`
- `$new` : `{ title: "Title", body: "bye" }`
- `$req` : `{ body: "bye" }`

### mod()

`mod()` will manipulate the uploading data before commiting permanently.

```js
[ "add:post", [ [ "mod()", { id: "$id", owner: "$signer", date: "$ms" } ], ["allow()"] ] ]
```

This will set `id` to the auto-generated docID, `owner` to the transaction signer, and `date` to the transaction timestamp.  

```js
const tx = await db.query("add:post", {title: "Test", body: "hello"}, "posts")

const post = await db.get("posts", tx.docID)
// the post has the extra fields auto-assigned : { title, body, id, owner, date }
```

This is how you can control the values of updated fields and minimize the fields users will upload.

### fields()

You can also constrain the user updated fields with `fields()`, and it works great with `mods()`.  
In the previous example, you only want users to update `title` and `body`, not anything else.  
Use `["fields()", ["title", "body"]]` for such an restriction.

```js
[
  "add:post",
  [
    ["fields()", ["title", "body"]],
    ["mod()", { id: "$id", owner: "$signer", date: "$ms" }],
    ["allow()"],
  ],
]
```
`*` will make the field mandatory. e.g. `["fields()", ["*title", "*body"]]`

```js
// these will be rejected
await db.query("add:post", {title: "Test", body: "hello", id: "abc"}, "posts")
await db.query("add:post", {title: "Test"}, "posts") // missing the mandatory body
```

You can also individually whitelist and blacklist fields with `requested_fields()` and `disallowed_fields()` respectively.

### =$

`=$` will assign the result of the following block to a variable. You can use FPJSON logic in the second block.

```js
// this will check if the signer is the post owner
["=$isOwner", ["equals", "$signer", "$old.owner"]]
```

### allowif() / allowifall()

Assigned variables can be used in any later blocks. It's especially useful when combined with `allowif()`.

```js
[
  "delete:post",
  [
    ["=$isOwner", ["equals", "$signer", "$old.owner"]], // the second block is FPJSON
    ["allowif()", "$isOwner"], // allow if the second element is true
  ],
]
```
You can use multiple conditions with `allowifall()`. The following also checks if the signer is the contract owner.

```js
[
  "delete:post",
  [
    ["=$isDataOwner", ["equals", "$signer", "$old.owner"]],
    ["=$isContractOwner", ["includes", "$signer", "$contract.owners"]],
    ["allowifall()", ["$isOwner", "$isContractOwner"],
  ],
]
```

You can use `allowifany()`, `denyif()`, `denyifall()`, `denyifany()`, `breakif()` in the same principle.

### get()

`get()` allows you to query other data during access evaluations.  
The following checks if the signer exists in `users` collection. It's equivalent to `await data.get("users", "$signer")`.

```js
[
  "add:post",
  [
    ["=$user", ["get()", ["users", "$signer"]]],
    ["=$existsUser", [["complement",["isNil"]], "$user"]],
    ["allowif()", "$existsUser"],
  ],
]
```
### Shortcut Symbols

As you can see, functional programming can get a bit too verbose for simple logic like `$existsUser`. So we have a bunch of shortcut symbols to make it more pleasant.

- `o$` : `["complement",["isNil"]]` : true if data exists
- `x$` : `["isNil"]` : true if data is `null` or `undefined`
- `!$` : `["not"]` : flip boolean
- `l$` : `["toLower"]` : lowercase 
- `u$` : `["toUpper"]` : uppercase
- `$$` : `["tail"]` : remove the first element, useful for escaping in FPJSON

For instance, you can simplify the previous example as follows.

```js
[
  "add:post",
  [
    ["=$user", ["get()", ["users", "$signer"]]],
    ["allowif()", "o$user"], // true if $user exists
  ],
]
```

### if-else conditions

Sometimes you want to execute some blocks only if a certain condition is met.  
`if` executes the third block only if the second block evaluates `true`.

```js
["if", "o$user", ["=$existsUser", true]]
```

You can combine `if` with `elif` and `else`. 

```js
["=$existsUser", ["if", "o$user", true, "else", false]]
```
User `break` to exit the whole evaluation without `allow()` and `deny()`. 
```js
["if", "x$user", ["break"]]
```
In this case, the query validity depends on other matched conditions. For example, you could define conditions for `add:post`, but also another condition for `add` and the query matches both patterns.

### Helper Functions

#### split()

It's often useful to make the docID deterministic with some document fields. For example, express follow relationships, you would set the docID `fromUserID:toUserID`, in this case, `split()` comes in handy.

```js
[
  "set:follow",
  [
    // split docID with ":" and assign to $from_id and $to_id
    ["split()", [":", "$id", ["=$from_id", "=$to_id"]]],
	["=$isFromSigner", ["equals", "$from_id", "$signer"]],
	["mod()", { from: "$from_id", to: "$to_id", date: "$ms" }],
    ["allowif()", "$isFromSigner"]
  ],
]
```

Now users can send an empty query as long as the docID checks out.

```js
await db.query("set:follow", {}, "follows", "fromUserID:toUserID")
```

#### parse()

equivalent to `JSON.parse()`.

#### stringify()

equivalent to `JSON.stringify()`.

## Triggers and Crons

[Triggers](/docs/sdk/triggers) and [Crons](/docs/sdk/crons) also use the same FPJSON, but get a different set of pre-defined variables and helper functions.

### Basic Queries

In addition to `get()`, you have access to the basic queries such as `add()`, `set()`, `update()`, `upsert()`, `delete()`, and `batch()`.

For example, to increment `followers_count` when someone follows someone, you wold set a trigger on `follows` collection like the following.

```js
{
  key: "follow",
  version: 2,
  on: "create",
  func: [
    ["update()", [{ followers_count: db.inc(1) }, "users", "$data.after.to"]]
  ],
}
```
### Batch

Since batch queries are convenient, `batch()` gets a special treatment. You can pool a query with `toBatch()` or multiple queries with `toBatchAll()`, then all queries sent during the evaluation will be auto batch executed in the end.

```js
// send single query
["toBatch()", ["add", {}, "posts"]]

// send multiple query
["toBatchAll()", [["add", {}, "posts"], ["add",{},"posts"]]
```
You can also use `toBatch` and `toBatchAll` in FPJSON blocks without `()`.

```js
[
  "when",
  ["always", true],
  ["toBatch", ["add", {}, "posts"]],
  "$some_data_to_trigger",
]
```
