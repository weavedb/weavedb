# WeaveDB SDK

## Install

```bash
yarn add wdb-sdk
```
## Usage

```js
import { DB } from "wdb-sdk"

const hostname = "http://34.18.53.73"
//const id = "Npiag-iJQJEv2fiZhrSgMJJ1FujBL_6ElmNdIE3pd6Y"
const port = `${hostname}:6363`
const hb = `${hostname}:10001`

const db = new DB({ port, hb, jwk, id })

const pid = await db.spawn()

await db.mkdir({
  name: "users",
  schema: { type: "object", required: ["name", "age"] },
  auth: [["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]]],
})

await db.set("set:user", { name: "Bob", age: 20 }, "users", "bob")
await db.set("set:user", { name: "Alice", age: 30 }, "users", "alice")

const users = await db.get("users")
```
