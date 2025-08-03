# Quick Start

:::warning
WeaveDB on HyperBEAM is currently in early development.

The sourcecode have not yet been audited, and the APIs are still evolving. We strongly advise against using it in production environments at this stage.
:::

## WDB SDK

The easiest way to get started is to connect with a remote WeaveDB rollup node with WDB SDK.

```bash [Installation]
yarn add wdb-sdk
```

```js [NodeJS]
import { DB } from "wdb-sdk"

// assume you have JWK for an Arweave wallet
const db = new DB({ 
  jwk, 
  url: "http://34.18.53.73:6364", 
  hb: "http://34.18.53.73:10001"
})

// create a new DB instance
const id = await db.spawn()
console.log(`new DB ID: ${id}`)

// create users dir
await db.mkdir({
  name: "users",
  schema: { type: "object", required: ["name", "age"] },
  auth: [["set:user,del:user", [["allow()"]]]],
})

// add users
await db.set("set:user", { name: "Bob", age: 20 }, "users", "Bob")
await db.set("set:user", { name: "Alice", age: 30 }, "users", "Alice")
await db.set("set:user", { name: "Mike", age: 25 }, "users", "Mike")

// get Alice
const Alice = await db.get("users", "Alice")

// get users
const users = await db.get("users")

// sort by age
const users2 = await db.get("users", ["age", "desc"]) // [Alice, Bob, Mike]

// only get 2
const users3 = await db.get("users", ["age", "asc"], 2) // [Mike, Bob]

// delete Mike
await db.del("users", "Mike")

// get 2 again
const users4 = await db.get("users", ["age", "asc"], 2) // [Bob, Alice]

// get where age equals 30
const users5 = await db.get("users", ["age", "==", 30]) // [Alice]
```

## Running Rollup Node

A WeaveDB rollup node can automatically start with HyperBEAM.

Clone the `weavedb` branch from our HyperBEAM repo.

```bash
git clone -b weavedb https://github.com/weavedb/HyperBEAM.git
cd HyperBEAM
```

Start HyperBEAM `rebar3 shell` with `as weavedb`.

:::warning
Currently starting a mainnet process with the `port` setting is necessary since HyperBEAM somehow doesn't persist data between restarts on the default process.
:::

```bash
rebar3 as weavedb shell --eval 'hb:start_mainnet(#{ port => 10001, priv_key_location => <<".wallet.json">> })'
```
You can explicitlyt start the WeaveDB rollup node by visiting [http://localhost:10001/~weavedb@1.0/start](http://localhost:10001/~weavedb@1.0/start).

Then check the rollup node status at [http://localhost:6364/status](http://localhost:6364/status).

Now you can interact with the nodes with `wdb-sdk`.

- HyperBEAM : [http://localhost:10001](http://localhost:10001)
- WeaveDB Rollup : [http://localhost:6364](http://localhost:6364/)

## Writing Tests

[WAO](https://docs.wao.eco) makes testing WeaveDB absolutely easy.

```js [test/wdb.test.js]
import assert from "assert"
import { describe, it, before, after } from "node:test"
import { HyperBEAM, wait } from "wao/test"
import { DB } from "wdb-sdk"
import server from "../src/server.js"
import { genDir } from "./test-utils.js"

const users = {
  name: "users",
  schema: { type: "object", required: ["name", "age"] },
  auth: [["set:user,del:user", [["allow()"]]]],
}

const bob = { name: "Bob", age: 23 }
describe("WeaveDB SDK", () => {
  let db, hbeam
  before(async () => {
    hbeam = await new HyperBEAM({ as: ["weavedb"] }).ready()
    db = new DB({ hb: hbeam.url, jwk: hbeam.jwk })
	const dbpath = genDir()
    await wait(5000)
  })
  after(() => hbeam.kill())
  
  it("should deploy a database", async () => {
    const pid = await db.spawn()
    assert((await db.mkdir(users)).success)
    assert((await db.set("set:user", bob, "users", "bob")).success)
    assert.deepEqual(await db.get("users", "bob"), bob)
  })
})
```

Then run the tests.

```bash
yarn test test/wdb.test.js
```

## WeaveDB Scan

When running local servers, you can also run a local explorer to view transactions.

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb/scan && yarn
yarn dev
```

Now the explorer is runnint at [localhost:3000](http://localhost:3000).

## Building Social App

### Define Database

To keep it simple, we will only make one `dir` called `posts`, and allow `add:post`.

```js
import { DB } from "wdb-sdk"

const schema = {
  type: "object",
  required: ["uid", "body", "date"],
  properties: {
    uid: { type: "string", pattern: "^[a-zA-Z0-9_-]{43}$" },
    body: { type: "string", minLength: 1, maxLength: 280 },
    date: { type: "integer", minimum: 0, maximum: 9999999999999 },
  },
}
const auth_add_post = [
  ["mod()", { uid: "$signer", date: "$ts" }], // add uid and date
  ["allow()"] // allow anyone
]
const posts = {
  name: "posts", // dirname
  schema, // JSON Schema
  auth: [
    ["add:post", auth_add_post], // define a custom query type
  ],
}

const db = new DB({ jwk })
const pid = await db.spawn() // spawn a new DB instance
await db.mkdir(posts) // make posts dir

console.log(pid) // note the database pid
```

### Frontend Dapp

We are going to build the simplest social app ever using NextJS!

For simplicity, use the old `pages` structure insted of `apps`.

```bash
npx create-next-app myapp && cd myapp
```

:::code-group

```jsx [/pages/index.js]
import { useRef, useEffect, useState } from "react"
import { DB } from "wdb-sdk"

export default function Home() {
  const [posts, setPosts] = useState([])
  const [body, setBody] = useState("")
  const db = useRef()
  const getPosts = async () => {
    setPosts(await db.current.get("posts", ["date", "desc"], 10))
  }
  useEffect(() => {
    void (async () => {
      db.current = new DB({ id: YOUR_DB_ID })
      await getPosts()
    })()
  }, [])
  return (
    <>
      <textarea value={body} onChange={e => setBody(e.target.value)} />
      <button
        onClick={async () => {
          await db.current.set("add:post", { body }, "posts")
          setBody("")
          await getPosts()
        }}
      >
        Post
      </button>
      {posts.map(v => (
        <article>
          <p>{v.body}</p>
          <footer>
            <time>{new Date(v.date).toLocaleString()}</time> by{" "}
            <address>{v.uid}</address>
          </footer>
        </article>
      ))}
    </>
  )
}
```

```css [/styles/global.css]
* {
 margin: 0;
 padding: 0;
 box-sizing: border-box;
}

body {
 background: #0a0a0a;
 color: #ffffff;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
 min-height: 100vh;
 padding: 60px 20px;
 position: relative;
 overflow-x: hidden;
}

body::before {
 content: '';
 position: fixed;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: 
   radial-gradient(circle at 20% 50%, rgba(120, 40, 200, 0.3) 0%, transparent 50%),
   radial-gradient(circle at 80% 80%, rgba(255, 40, 120, 0.2) 0%, transparent 50%),
   radial-gradient(circle at 40% 20%, rgba(40, 120, 255, 0.2) 0%, transparent 50%);
 pointer-events: none;
 z-index: 1;
}

textarea {
 width: 100%;
 max-width: 600px;
 height: 140px;
 padding: 24px;
 background: rgba(255, 255, 255, 0.03);
 border: 1px solid rgba(255, 255, 255, 0.1);
 border-radius: 20px;
 color: #ffffff;
 font-size: 16px;
 font-family: inherit;
 resize: none;
 display: block;
 margin: 0 auto 24px;
 backdrop-filter: blur(20px);
 transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
 position: relative;
 z-index: 10;
}

textarea::placeholder {
 color: rgba(255, 255, 255, 0.4);
}

textarea:focus {
 outline: none;
 background: rgba(255, 255, 255, 0.05);
 border-color: rgba(120, 40, 200, 0.5);
 box-shadow: 
   0 0 0 4px rgba(120, 40, 200, 0.1),
   0 10px 40px rgba(120, 40, 200, 0.2);
}

button {
 display: block;
 width: 100%;
 max-width: 600px;
 margin: 0 auto 60px;
 padding: 18px 40px;
 background: linear-gradient(135deg, #7828c8 0%, #ff1874 100%);
 color: white;
 border: none;
 border-radius: 16px;
 font-size: 16px;
 font-weight: 600;
 letter-spacing: 0.5px;
 cursor: pointer;
 transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
 position: relative;
 z-index: 10;
 overflow: hidden;
}

button::before {
 content: '';
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background: linear-gradient(135deg, #ff1874 0%, #7828c8 100%);
 opacity: 0;
 transition: opacity 0.3s ease;
 z-index: -1;
}

button:hover {
 transform: translateY(-2px);
 box-shadow: 
   0 10px 30px rgba(120, 40, 200, 0.4),
   0 0 60px rgba(255, 24, 116, 0.3);
}

button:hover::before {
 opacity: 1;
}

button:active {
 transform: translateY(0);
}

article {
 max-width: 600px;
 margin: 0 auto 20px;
 padding: 28px;
 background: rgba(255, 255, 255, 0.02);
 border: 1px solid rgba(255, 255, 255, 0.08);
 border-radius: 20px;
 backdrop-filter: blur(20px);
 position: relative;
 z-index: 10;
 overflow: hidden;
 animation: fadeSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
 transition: all 0.3s ease;
}

article::before {
 content: '';
 position: absolute;
 top: -50%;
 left: -50%;
 width: 200%;
 height: 200%;
 background: radial-gradient(circle, rgba(120, 40, 200, 0.1) 0%, transparent 70%);
 opacity: 0;
 transition: opacity 0.3s ease;
 pointer-events: none;
}

article:hover {
 background: rgba(255, 255, 255, 0.04);
 border-color: rgba(255, 255, 255, 0.12);
 transform: translateY(-2px);
 box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

article:hover::before {
 opacity: 1;
}

p {
 font-size: 17px;
 line-height: 1.6;
 color: rgba(255, 255, 255, 0.9);
 margin-bottom: 16px;
 word-wrap: break-word;
}

footer {
 font-size: 13px;
 color: rgba(255, 255, 255, 0.5);
 display: flex;
 gap: 6px;
 align-items: center;
 flex-wrap: wrap;
}

time {
 color: rgba(120, 40, 200, 0.8);
 font-weight: 500;
}

address {
 font-style: normal;
 font-family: 'SF Mono', Monaco, monospace;
 font-size: 12px;
 background: rgba(120, 40, 200, 0.2);
 padding: 4px 10px;
 border-radius: 6px;
 color: rgba(255, 255, 255, 0.7);
 display: inline-block;
 word-break: break-all;
}

@keyframes fadeSlideIn {
 from {
   opacity: 0;
   transform: translateY(20px);
 }
 to {
   opacity: 1;
   transform: translateY(0);
 }
}

@media (max-width: 640px) {
 body {
   padding: 40px 16px;
 }
 
 textarea {
   height: 120px;
   padding: 20px;
 }
 
 article {
   padding: 24px;
 }
}
```

:::



You might think this is too simple, but add some styles in `global.css`, and witness the magic!

## Running Validator Node

A validator node is a separate process that handles the following steps.

1. Download WAL from HyperBEAM
2. Verify all messages and hashpaths
3. Compact updates with ARJSON
4. Calculate zkJSON sparse merkle trees
5. Commit to the database process
6. Receive $DB reward for the work

Thanks to ARJSON, only the absolute minimum bits required for full database recovery will be stored on the Arweave permanent storage, which drastically reduces the database cost.

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb && yarn && cd hb && yarn && cd ..
yarn validator --pid DB_PID --vid VALIDATION_PID
```

A new validator process will be spawned if `vid` is not specified.

:::warning
Currently only one validator strategy is enabled. Multi-validator mechanism with token staking will be introduced in the future.
:::


## Running ZK Proof Generator Node

A zk proof generator node is a separate process that handles the following steps.

1. Download validated ARJSON bits from HyperBEAM or Arweave
2. Decode ARJSON into database structures
3. Calculate zkJSON sparse merkle trees
4. Commit the root merkle hash to EVM blockchains
5. Generate zkJSON proofs on demand

:::info
The proof generation takes only a few second on a standard consumer laptop thanks to zkJSON.
:::

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb && yarn && cd hb && yarn && cd ..
yarn zkp --vid VALIDATION_PID
```

You can get zk proofs at `http://localhost:6365/zkp`.

```js
const { zkp, zkhash } = await fetch("http://localhost:6365/zkp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ dir: "posts", doc: "A", path: "body" }),
}).then(r => r.json())
```

## Query from Ethereum with ZK Proof

You can query WeaveDB from Ethereum Solidity contarcts.

Since we are working on the local environment, let's create a test with Hardhat.

```bash
mkdir zkdb && cd zkdb && npx hardhat init
npm install zkjson wdb-sdk
```

:::warning
Don't use `yarn` in a hardhat project as it somehow breaks dependencies.
:::

We will create `ZKDB` contract by extending the simple optimistic zk rollup contract from the `zkjson` package, which comes with the `zkQuery` interface.

```solidity [/contracts/ZKDB.sol]
// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "zkjson/contracts/OPRollup.sol";

interface VerifierDB {
  function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[16] calldata _pubSignals) view external returns (bool);
}

contract ZKDB is OPRollup {
  uint constant SIZE_PATH = 4;
  uint constant SIZE_VAL = 8;
  address public verifierDB;

  constructor (address _verifierDB, address _committer){
    verifierDB = _verifierDB;
    committer = _committer;
  }
  
  function validateQuery(uint[] memory path, uint[] memory zkp) private view returns(uint[] memory){
    verify(zkp, VerifierDB.verifyProof.selector, verifierDB);
    return _validateQueryRU(path, zkp, SIZE_PATH, SIZE_VAL);    
  }

  function qInt (uint[] memory path, uint[] memory zkp) public view returns (int) {
    uint[] memory value = validateQuery(path, zkp);
    return _qInt(value);
  }

  function qFloat (uint[] memory path, uint[] memory zkp) public view returns (uint[3] memory) {
    uint[] memory value = validateQuery(path, zkp);
    return _qFloat(value);
  }

  function qRaw (uint[] memory path, uint[] memory zkp) public view returns (uint[] memory) {
    uint[] memory value = validateQuery(path, zkp);
    return _qRaw(value);
  }
  
  function qString (uint[] memory path, uint[] memory zkp) public view returns (string memory) {
    uint[] memory value = validateQuery(path, zkp);
    return _qString(value);
  }

  function qBool (uint[] memory path, uint[] memory zkp) public view returns (bool) {
    uint[] memory value = validateQuery(path, zkp);
    return _qBool(value);
  }
  
  function qNull (uint[] memory path, uint[] memory zkp) public view returns (bool) {
    uint[] memory value = validateQuery(path, zkp);
    return _qNull(value);
  }

  function qCond (uint[] memory path, uint[] memory cond, uint[] memory zkp) public view returns (bool) {
    uint[] memory value = validateQuery(path, zkp);
    return _qCond(value, cond);
  }

  function qCustom (uint[] memory path, uint[] memory path2, uint[] memory zkp) public view returns (int) {
    uint[] memory value = validateQuery(path, zkp);
    return getInt(path2, value);
  }
}
```

:::warning
You can use one of the existing verifier contracts from the `zkjson` package for testing, but you need to take proper ceremony steps to generate secure verifiers.
:::

```js
const hre = require("hardhat")

async function main() {
  const committer = { address: "0xcD0505F215EFbF9b00C7a1EB39E299E79c4abd31" }
  const VerifierRU = await hre.ethers.getContractFactory("Groth16VerifierRU")
  const verifierRU = await VerifierRU.deploy()
  await verifierRU.deployed()
  console.log(verifierRU.address)

  const VerifierDB = await hre.ethers.getContractFactory("Groth16VerifierDB")
  const verifierDB = await VerifierDB.deploy()
  await verifierDB.deployed()
  console.log(verifierDB.address)

  const MyRU = await hre.ethers.getContractFactory("SimpleOPRU")
  const myru = await MyRU.deploy(
    verifierRU.address,
    verifierDB.address,
    committer.address,
  )
  await myru.deployed()
  console.log(myru.address)
  return
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
```

Now, you can commit `zkhash`, generate zk proofs from a zk prover node, then query WeaveDB from Solidity with the `zkp`.


```js
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")
const { toIndex, path } = require("zkjson")
const { DB } = require("wdb-sdk")

const wait = ms => new Promise(res => setTimeout(() => res(), ms))
async function deploy() {
  const [committer] = await ethers.getSigners()
  const VerifierDB = await ethers.getContractFactory(
    "zkjson/contracts/verifiers/verifier_db.sol:Groth16VerifierDB",
  )
  const verifierDB = await VerifierDB.deploy()
  const ZKDB = await ethers.getContractFactory("ZKDB")
  return (zkdb = await ZKDB.deploy(verifierDB.target, committer.address))
}

describe("ZKDB", function () {
  this.timeout(0)
  it("should query WeaveDB from Solidity", async function () {
    const zkdb = await loadFixture(deploy)
    const db = new DB({ jwk, id: DB_ID })
    await db.set("add:post", { body: "my first post!" }, "posts")
    const post = (await db.cget("posts", ["date", "desc"]))[0]
    await wait(20000)
    const { zkp, zkhash, dirid } = await fetch("http://localhost:6365/zkp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dir: "posts", doc: post.id, path: "body" }),
    }).then(r => r.json())
    await zkdb.commitRoot(zkhash)
    expect(
      await zkdb.qString([dirid, toIndex(post.id), ...path("body")], zkp),
    ).to.eql("my first post!")
  })
})
```

## Query from AOS Processes

You can query WeaveDB from any AOS Lua processes. We will use [WAO SDK](https://docs.wao.eco/api/ao) for simplicity.

AOS processes can `Send` a message with `Query` action to `receive()` from the WeaveDB validation process.

:::info
Currently, AOS processes can only read from WeaveDB. Writing to WeaveDB from AOS processes is under development. It was not our initial focus, since writing from AOS processes (L1) is significantly slower than direct interactions with the rollup node (L2).
:::

```js
import { AO } from "wao"

const lua_script = `
Handlers.add("Query", "Query", function (msg)
  local data = Send({ 
    Target = msg.DB, 
	Action = "Query", 
	Query = msg.Query
  }).receive().Data
  msg.reply({ Data = data })
end)`

const ao = await new AO({ module_type: "mainnet", hb: hb_url }).init(jwk)
const { p } = await ao.deploy({ src_data: lua_script })
const data = await p.m("Query", {
  DB: validation_pid,
  Query: JSON.stringify(["posts"]),
})
console.log(JSON.parse(data))
```
