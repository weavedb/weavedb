---
sidebar_position: 3
---
# Social Bookmarking

We are going to set up a WeaveDB contract for a social bookmarking dapp.

The actual dapp with the same setup is deployed at [asteroid.ac](https://asteroid.ac) which let you bookmark and explore [Mirror.xyz](https://mirror.xyz) articles.

The implementation details will be omitted for this tutorial. You can go through the whole granular process of building both the contracts and the frontend dapp in the previous [Todo Manager example](/docs/examples/todos).

## Deploy WeaveDB Contracts

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
node scripts/generate-wallet.js mainnet
yarn deploy
```

## Database Structure

We are going to set up 3 collections.

- `bookmarks` : user bookmarks
- `mirror` : mirror articles
- `conf` : for some bookkeeping

## Set up Data Schemas

```js
const schemas_bookmarks = {
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
await db.setSchema(schemas_bookmarks, "bookmarks")

const schemas_conf = {
  type: "object",
  required: ["ver"],
  properties: {
    ver: {
      type: "number",
    },
  },
}
await db.setSchema(schemas_conf, "conf")
```
- `bookmarks` must have 3 fields (`article_id`, `data`, `user_address`).
- `conf` must have `ver` field.

## Set up Access Control Rules

### bookmarks collection

```js
const rules_bookmarks = {
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
    "==": [
      { var: "request.auth.signer" },
      { var: "resource.data.user_address" },
    ],
  },
}
await db.setRules(rules_bookmarks, "bookmarks")
```
- `let` declares `id` variable and assign `article_id:user_address` of the `newData` to it.
- The doc `id` must be `article_id:user_address`.
- `user_address` must be tx `signer`.
- `data` must be `block.timestamp`
- Only the setter of the record (`user_address`) can delete it.


### mirror collection

```js
const rules_mirror = {
  "allow write": {
    "==": [{ var: "request.auth.signer" }, ADMIN_ADDRESS],
  },
}
await db.setRules(rules_mirror, "mirror")
```

`mirror` articles will be recorded when calculating bookmark counts and only `ADMIN_ADDRESS` can write.

### conf collection

```js
const rules_conf = {
  "allow write": {
    "==": [{ var: "request.auth.signer" }, ADMIN_ADDRESS],
  },
}
await db.setRules(rules_conf, "conf")
```

`conf` will be used for periodic bookmark counting and only `ADMIN_ADDRESS` can write.


## Bookmark Articles

The frontend dapp can implement the following query for bookmarking.

It forces `date` to be the block timestamp, and `user_address` to be the tx signer address which should be the same as `USER_ADDRESS`.

```js
await db.set(
  {
    date: db.ts(),
	article_id: ARTICLE_ID,
    user_address: db.signer(),
  },
  "bookmarks",
  `${ARTICLE_ID}:${USER_ADDRESS}`
)
```

## Calculate Bookmark Counts

Our dapp will show trending articles by periodically calculating bookmark counts.

We will use a time-decay algorithm to rank articles by the bookmarks in the past 2 weeks.

```js
import {isNil, indexBy, prop} from "ramda"

const conf = (await db.get("conf", "mirror-calc")) || { ver: 0 }
const exists = (await db.get("mirror", ["ver"], ["ver", "!=", 0])) || []
let exists_map = indexBy(prop("id"))(exists)
const day = 60 * 60 * 24
const two_weeks = day * 14
const now = Date.now() / 1000
const deadline = now - two_weeks
const bookmarks = await db.get(
  "bookmarks",
  ["date", "desc"],
  ["date", ">=", deadline]
)
const rank = {}
let batches = [
  ["upsert", { ver: conf.ver + 1, date: now }, "conf", "mirror-calc"],
]
for (let v of bookmarks) {
  if (isNil(rank[v.article_id])) {
    rank[v.article_id] = {
      id: v.article_id,
      pt: 0,
      bookmarks: 0,
    }
  }
  rank[v.article_id].bookmarks += 1
  const k = (two_weeks - (now - v.date)) / day
  rank[v.article_id].pt += k
}
for (let k in rank) {
  let v = rank[k]
  if (!isNil(exists_map[k])) {
  exists_map[k].exists = true
  }
  batches.push([
    "upsert",
    {
      id: k,
      ver: conf.ver + 1,
      pt: v.pt,
      bookmarks: v.bookmarks,
    },
    "mirror",
    k,
  ])
}
for (let k in exists_map) {
  if (exists_map[k].exists !== true) {
    batches.push(["update", { pt: db.del(), ver: db.del() }, "mirror", k])
  }
}
await db.batch(batches)
```

## Advanced: Calculate Bookmark Counts with Cron

You can do the same thing by automating the periodical calculation with a cron.

```js
const cron = {
  span: 60 * 60 * 12, // execute every 12 hours
  do: true,
  jobs: [
    ["get", "conf", ["conf", "mirror-calc"], { ver: 0 }],
    ["get", "exists", ["mirror", ["ver"], ["ver", "!=", 0]]],
    ["let", "exists_map", ["indexBy", ["prop", "id"], { var: "exists" }]],
    ["let", "day", 60 * 60 * 24],
    ["let", "two_weeks", ["multiply", { var: "day" }, 14]],
    ["let", "now", { var: "block.timestamp" }],
    ["let", "deadline", ["subtract", { var: "now" }, { var: "two_weeks" }]],
    [
      "get",
      "bookmarks",
      ["bookmarks", ["date", "desc"], ["date", ">=", { var: "deadline" }]],
    ],
    ["let", "rank", {}],
    [
      "let",
      "batches",
      [
        [
          "upsert",
          {
            ver: ["add", 1, ["prop", "ver", { var: "conf" }]],
            date: { var: "now" },
          },
          "conf",
          "mirror-calc",
        ],
      ],
    ],
    [
      "do",
      [
        "forEach",
        [
          "pipe",
          ["let", "v"],
          ["prop", "article_id"],
          ["pair", "rank"],
          ["join", "."],
          ["let", "rank_path"],
          [
            "when",
            ["pipe", ["var", "$rank_path"], ["isNil"]],
            [
              "pipe",
              [
                "applySpec",
                {
                  id: ["identity"],
                  pt: ["always", 0],
                  bookmarks: ["always", 0],
                },
              ],
              ["let", "$rank_path"],
            ],
          ],
          ["var", "$rank_path"],
          ["over", ["lensProp", "bookmarks"], ["inc"]],
          ["let", "$rank_path"],
          ["var", "v"],
          ["prop", "date"],
          ["subtract", { var: "now" }],
          ["subtract", { var: "two_weeks" }],
          ["divide", ["__"], { var: "day" }],
          ["let", "k"],
          ["var", "$rank_path"],
          [
            "over",
            ["lensProp", "pt"],
            [
              "pipe",
              ["applySpec", { pt: ["identity"], k: ["var", "k"] }],
              ["values"],
              ["sum"],
            ],
          ],
          ["let", "$rank_path"],
        ],
        { var: "bookmarks" },
      ],
    ],
    [
      "do",
      [
        "forEachObjIndexed",
        [
          "pipe",
          ["unapply", ["take", 2]],
          ["tap", ["pipe", ["head"], ["let", "v"]]],
          ["pipe", ["last"], ["let", "k"]],
          ["pair", "exists_map"],
          ["join", "."],
          ["let", "ex_path"],
          ["var", ["__"], true],
          [
            "when",
            ["pipe", ["isNil"], ["not"]],
            ["pipe", ["assoc", true, "exists"], ["let", "$ex_path"]],
          ],
          ["var", "v"],
          [
            "applySpec",
            {
              method: ["always", "upsert"],
              query: {
                id: ["var", "k"],
                ver: ["pipe", ["var", "conf"], ["prop", "ver"], ["inc"]],
                pt: ["prop", "pt"],
                bookmarks: ["prop", "bookmarks"],
              },
              collection: ["always", "mirror"],
              doc: ["var", "k"],
            },
          ],
          ["values"],
          ["applySpec", { query: ["identity"], batches: ["var", "batches"] }],
          ["values"],
          ["apply", ["append"]],
          ["let", "batches"],
        ],
        { var: "rank" },
      ],
    ],
    [
      "do",
      [
        "forEachObjIndexed",
        [
          "pipe",
          ["unapply", ["take", 2]],
          ["tap", ["pipe", ["head"], ["let", "v"]]],
          ["pipe", ["last"], ["let", "k"]],
        ],
        ["pair", "exists_map"],
        ["join", "."],
        ["var", ["__"], true],
        [
          "when",
          ["pipe", ["propEq", "exists", true], ["not"]],
          [
            "pipe",
            [
              "applySpec",
              {
                method: ["always", "update"],
                query: {
                  pt: ["always", db.del()],
                  ver: ["always", db.del()],
                },
                collection: ["always", "mirror"],
                doc: ["var", "k"],
              },
            ],
            ["values"],
            ["applySpec", { query: ["identity"], batches: ["var", "batches"] }],
            ["values"],
            ["apply", ["append"]],
            ["let", "batches"],
          ],
        ],
      ],
    ],
    ["batch", { var: "batches" }],
  ],
}

await db.addCron(cron, "count")
```

## Get Trending Articles

The following query will fetch top 10 trending articles in the past 2 weeks.

```js
const articles = await db.get("mirror", ["pt", "desc"], 10)
```

## The Frontend Dapp

The frontend implementation will be omitted for this tutorial.

An example dapp with the same setup as this tutorial is deployed at [asteroid.ac](https://asteroid.ac).
