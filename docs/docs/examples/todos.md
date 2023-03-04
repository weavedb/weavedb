---
sidebar_position: 1
---
# Todo Manager

How to build the simplest todo dapp with WeaveDB and [Next.js](https://nextjs.org/).

## Deploy WeaveDB Contracts

```bash
git clone https://github.com/weavedb/weavedb.git
cd weavedb
yarn
node scripts/generate-wallet.js mainnet
yarn deploy
```
A new wallet is stored at `/scripts/.wallets/wallet-mainnet.json`.

`yarn deploy` returns `contractTxId` and `srcTxId`.

```js
{ contractTxId, srcTxId }
```
## Database Structure

We will only use one collection `tasks` to keep it simple.

## Set up Data Schemas

```js
const schemas = {
  type: "object",
  required: ["task", "date", "user_address", "done"],
  properties: {
    task: {
      type: "string",
    },
    user_address: {
      type: "string",
    },
    date: {
      type: "number",
    },
    done: {
      type: "boolean",
    },
  },
}
await db.setSchema(schemas, "tasks")
```

- `tasks` collection must have 4 fields (`task`, `date`, `user_address`, `done`).

## Set up Access Control Rules

```js
const rules = {
  "allow create": {
    and: [
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
      {
        "==": [{ var: "resource.newData.done" }, false],
      },
    ],
  },
  "allow update": {
    and: [
      {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
      {
        "==": [{ var: "resource.newData.done" }, true],
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
await db.setRules(rules, "tasks")
```

- `user_address` must be set `signer`
- `date` must be the `block.timestamp`
- `done` must default to `false`
- Only `done` can be updated to `true` by the task owner (`user_address`)
- Only the task owner (`user_address`) can delete the task

To set up the schemas and the rules, you can simply run the pre-defined script in the repo.

Replace `CONTRACT_TX_ID` with the `contractTxId` returned when deplying the WeaveDB contract.

```bash
node scripts/todo-setup.js mainnet CONTRACT_TX_ID
```

Now the DB setup is all done!

## Query Data

Set a new task.

```js
await db.add({
  task: "task_name",
  date: db.ts(),
  user_address: db.signer(),
  done: false
}, "tasks")
```

Mark a task done.

```js
await db.update({ done: true }, "tasks", TASK_DOC_ID)
```

Get all tasks sorted by date.

```js
const tasks = await db.get("tasks", ["date", "desc"])
```

Get all tasks of a user sorted by date.

```js
const tasks = await db.get("tasks", ["user_address", "==", USER_ADDRESS], ["date", "desc"])
```

We will implement these queries in the frontend code.

## Frontend Dapp

Set up a next.js project with the app name `todos`.

```bash
yarn create next-app todos
cd todos
yarn dev
```

Now your dapp should be running at [http://localhost:3000](http://localhost:3000).

For simplicity, we will write everything in one file at `/page/index.js`.

### Install Dependencies

Open a new terminal and move to the root directry to continue depelopment.

We use these minimum dependencies.

- [WeaveDB SDK](https://weavedb.dev) - to connect with WeaveDB
- [Buffer](https://github.com/feross/buffer) - a dependency for WeaveDB
- [Ramda.js](https://ramdajs.com) - functional programming utilities
- [Chakra UI](https://chakra-ui.com) - UI library
- [Ethers.js](https://docs.ethers.io) - to connect with Metamask
- [localForage](https://localforage.github.io/localForage/) - IndexedDB wrapper to store a disposal wallet

```bash
yarn add ramda localforage weavedb-sdk buffer ethers @chakra-ui/react @emotion/react@^11 @emotion/styled@^11 framer-motion@^6
```
### Import Dependencies

Open `/page/index.js` and replace everything.

```js
import { useRef, useState, useEffect } from "react"
import lf from "localforage"
import { isNil, map } from "ramda"
import SDK from "weavedb-sdk"
import { Buffer } from "buffer"
import { ethers } from "ethers"
import { Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"
```
### Define Variables

```js
let db
const contractTxId = WEAVEDB_CONTRACT_TX_ID
```

- `db` - to assign the WeaveDB instance later
- `contractTxID` - WeaveDB contract tx id

### Define React States

```js
export default function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [tab, setTab] = useState("All")
  const [initDB, setInitDB] = useState(false)
  let task = useRef()
  const tabs = isNil(user) ? ["All"] : ["All", "Yours"]
  return (...)
}
```
- `user` - logged in user
- `tasks` - tasks to do
- `tab` - current page tab
- `initDB` - to determine if the WeaveDB is ready to use
- `task` - a new task name linked with the input form
- `tabs` - page tab options, `All` to display everyone's tasks, `Yours` for only your tasks

### Define Functions

#### setupWeaveDB

`Buffer` needs to be exposed to `window`.

```js
  const setupWeaveDB = async () => {
    window.Buffer = Buffer
    db = new SDK({
      contractTxId
    })
	await db.initializeWithoutWallet()
    setInitDB(true)
  }
```
#### getTasks

```js
  const getTasks = async () => {
    setTasks(await db.cget("tasks", ["date", "desc"]))
  }
```

#### getMyTasks

```js
  const getMyTasks = async () => {
    setTasks(
      await db.cget(
        "tasks",
        ["user_address", "==", user.wallet.toLowerCase()],
        ["date", "desc"]
      )
    )
  }
```

#### addTask

```js
  const addTask = async task => {
    await db.add(
      {
        task,
        date: db.ts(),
        user_address: db.signer(),
        done: false,
      },
      "tasks",
      user
    )
    await getTasks()
  }
```

#### completeTask

```js
  const completeTask = async id => {
    await db.update(
      {
        done: true,
      },
      "tasks",
      id,
      user
    )
    await getTasks()
  }
```

#### deleteTask

```js
  const deleteTask = async id => {
    await db.delete("tasks", id, user)
    await getTasks()
  }
```

#### login

We will generate a disposal account the first time a user logs in, link it with the Metamask address within WeaveDB, and save it locally in the browser's IndexedDB.

`{ wallet, privateKey }` is how we need to pass the user object to the SDK when making transactions, so we will save it like so.

```js
  const login = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    await provider.send("eth_requestAccounts", [])
    const wallet_address = await provider.getSigner().getAddress()
    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    )
    let tx
    let err
    if (isNil(identity)) {
      ;({ tx, identity, err } = await db.createTempAddress(wallet_address))
	  const linked = await db.getAddressLink(identity.address)
      if (isNil(linked)) {
        alert("something went wrong")
        return
      }
    } else {
      await lf.setItem("temp_address:current", wallet_address)
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      })
      return
    }
    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx
      identity.linked_address = wallet_address
      await lf.setItem("temp_address:current", wallet_address)
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        identity
      )
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      })
    }
  }
```

#### logout

We will simply remove the current logged in state. The disposal address will be reused the next time the user logs in.

```js
  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current")
      setUser(null, "temp_current")
    }
  }
```

#### checkUser

When the page is loaded, check if the user is logged in.

```js
  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`)
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      )
      if (!isNil(identity))
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        })
    }
  }
```

### Define Reactive State Changes

```js
  useEffect(() => {
    checkUser()
    setupWeaveDB()
  }, [])

  useEffect(() => {
    if (initDB) {
      if (tab === "All") {
        getTasks()
      } else {
        getMyTasks()
      }
    }
  }, [tab, initDB])
```

- When the page is loaded, check if the user is logged in and set up WeaveDB.
- Get specified tasks, when the page tab is switched.

### Define React Components

#### NavBar

```jsx
  const NavBar = () => (
    <Flex p={3} position="fixed" w="100%" sx={{ top: 0, left: 0 }}>
      <Box flex={1} />
      <Flex
        bg="#111"
        color="white"
        py={2}
        px={6}
        sx={{
          borderRadius: "5px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
      >
        {!isNil(user) ? (
          <Box onClick={() => logout()}>{user.wallet.slice(0, 7)}</Box>
        ) : (
          <Box onClick={() => login()}>Connect Wallet</Box>
        )}
      </Flex>
    </Flex>
  )
```

#### Tabs

```jsx
  const Tabs = () => (
    <Flex justify="center" style={{ display: "flex" }} mb={4}>
      {map(v => (
        <Box
          mx={2}
          onClick={() => setTab(v)}
          color={tab === v ? "red" : ""}
          textDecoration={tab === v ? "underline" : ""}
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v}
        </Box>
      ))(tabs)}
    </Flex>
  )
```

#### Tasks

```jsx
  const Tasks = () =>
    map(v => (
      <Flex sx={{ border: "1px solid #ddd", borderRadius: "5px" }} p={3} my={1}>
        <Box
          w="30px"
          textAlign="center"
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v.data.done ? (
            "✅"
          ) : v.data.user_address !== user?.wallet.toLowerCase() ? null : (
            <Box onClick={() => completeTask(v.id)}>⬜</Box>
          )}
        </Box>
        <Box px={3} flex={1} style={{ marginLeft: "10px" }}>
          {v.data.task}
        </Box>
        <Box w="100px" textAlign="center" style={{ marginLeft: "10px" }}>
          {v.data.user_address.slice(0, 7)}
        </Box>
        <Box
          w="50px"
          textAlign="center"
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v.data.user_address === user?.wallet.toLowerCase() ? (
            <Box
              style={{ marginLeft: "10px" }}
              onClick={() => deleteTask(v.id)}
            >
              ❌
            </Box>
          ) : null}
        </Box>
      </Flex>
    ))(tasks)
```

#### NewTask

```jsx
  const NewTask = () => (
    <Flex mb={4}>
      <Input
        placeholder="Enter New Task"
        value={task.current}
        onChange={e => {
          task.current = e.target.value
        }}
        sx={{ borderRadius: "5px 0 0 5px" }}
      />
      <Flex
        bg="#111"
        color="white"
        py={2}
        px={6}
        sx={{
          borderRadius: "0 5px 5px 0",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        onClick={async () => {
          if (!/^\s*$/.test(task.current)) {
            await addTask(task.current)
            task.current = ""
          }
        }}
      >
        add
      </Flex>
    </Flex>
  )
```

#### Transactions

```jsx
  const Transactions = () => {
    return (
      <Flex justify="center" p={4}>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
          sx={{ textDecoration: "underline" }}
        >
          view transactions
        </Box>
      </Flex>
    )
  }

```

### Return Components

```jsx
  return (
    <ChakraProvider>
      <NavBar />
      <Flex mt="60px" justify="center" p={3}>
        <Box w="100%" maxW="600px">
          <Tabs />
          {!isNil(user) ? <NewTask /> : null}
          <Tasks />
        </Box>
      </Flex>
    </ChakraProvider>
  )
```

### The Complete Code

```js  title="/pages/index.js"
import { useRef, useState, useEffect } from "react"
import lf from "localforage"
import { isNil, map } from "ramda"
import SDK from "weavedb-sdk"
import { Buffer } from "buffer"
import { ethers } from "ethers"
import { Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"

let db
const contractTxId = WEAVEDB_CONTRACT_TX_ID

export default function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [tab, setTab] = useState("All")
  const [initDB, setInitDB] = useState(false)
  let task = useRef()
  const tabs = isNil(user) ? ["All"] : ["All", "Yours"]

  const setupWeaveDB = async () => {
    window.Buffer = Buffer
    db = new SDK({
      contractTxId
    })
	await db.initializeWithoutWallet()
    setInitDB(true)
  }

  const getTasks = async () => {
    setTasks(await db.cget("tasks", ["date", "desc"]))
  }

  const getMyTasks = async () => {
    setTasks(
      await db.cget(
        "tasks",
        ["user_address", "==", user.wallet.toLowerCase()],
        ["date", "desc"]
      )
    )
  }

  const addTask = async task => {
    await db.add(
      {
        task,
        date: db.ts(),
        user_address: db.signer(),
        done: false,
      },
      "tasks",
      user
    )
    await getTasks()
  }

  const completeTask = async id => {
    await db.update(
      {
        done: true,
      },
      "tasks",
      id,
      user
    )
    await getTasks()
  }

  const deleteTask = async id => {
    await db.delete("tasks", id, user)
    await getTasks()
  }

  const login = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    await provider.send("eth_requestAccounts", [])
    const wallet_address = await provider.getSigner().getAddress()
    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    )
    let tx
    let err
    if (isNil(identity)) {
      ;({ tx, identity, err } = await db.createTempAddress(wallet_address))
	  const linked = await db.getAddressLink(identity.address)
      if (isNil(linked)) {
        alert("something went wrong")
        return
      }

    } else {
      await lf.setItem("temp_address:current", wallet_address)
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      })
      return
    }
    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx
      identity.linked_address = wallet_address
      await lf.setItem("temp_address:current", wallet_address)
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        identity
      )
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      })
    }
  }

  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current")
      setUser(null, "temp_current")
    }
  }

  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`)
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      )
      if (!isNil(identity))
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        })
    }
  }

  useEffect(() => {
    checkUser()
    setupWeaveDB()
  }, [])

  useEffect(() => {
    if (initDB) {
      if (tab === "All") {
        getTasks()
      } else {
        getMyTasks()
      }
    }
  }, [tab, initDB])

  const NavBar = () => (
    <Flex p={3} position="fixed" w="100%" sx={{ top: 0, left: 0 }}>
      <Box flex={1} />
      <Flex
        bg="#111"
        color="white"
        py={2}
        px={6}
        sx={{
          borderRadius: "5px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
      >
        {!isNil(user) ? (
          <Box onClick={() => logout()}>{user.wallet.slice(0, 7)}</Box>
        ) : (
          <Box onClick={() => login()}>Connect Wallet</Box>
        )}
      </Flex>
    </Flex>
  )

  const Tabs = () => (
    <Flex justify="center" style={{ display: "flex" }} mb={4}>
      {map(v => (
        <Box
          mx={2}
          onClick={() => setTab(v)}
          color={tab === v ? "red" : ""}
          textDecoration={tab === v ? "underline" : ""}
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v}
        </Box>
      ))(tabs)}
    </Flex>
  )

  const Tasks = () =>
    map(v => (
      <Flex sx={{ border: "1px solid #ddd", borderRadius: "5px" }} p={3} my={1}>
        <Box
          w="30px"
          textAlign="center"
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v.data.done ? (
            "✅"
          ) : v.data.user_address !== user?.wallet.toLowerCase() ? null : (
            <Box onClick={() => completeTask(v.id)}>⬜</Box>
          )}
        </Box>
        <Box px={3} flex={1} style={{ marginLeft: "10px" }}>
          {v.data.task}
        </Box>
        <Box w="100px" textAlign="center" style={{ marginLeft: "10px" }}>
          {v.data.user_address.slice(0, 7)}
        </Box>
        <Box
          w="50px"
          textAlign="center"
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v.data.user_address === user?.wallet.toLowerCase() ? (
            <Box
              style={{ marginLeft: "10px" }}
              onClick={() => deleteTask(v.id)}
            >
              ❌
            </Box>
          ) : null}
        </Box>
      </Flex>
    ))(tasks)

  const NewTask = () => (
    <Flex mb={4}>
      <Input
        placeholder="Enter New Task"
        value={task.current}
        onChange={e => {
          task.current = e.target.value
        }}
        sx={{ borderRadius: "5px 0 0 5px" }}
      />
      <Flex
        bg="#111"
        color="white"
        py={2}
        px={6}
        sx={{
          borderRadius: "0 5px 5px 0",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        onClick={async () => {
          if (!/^\s*$/.test(task.current)) {
            await addTask(task.current)
            task.current = ""
          }
        }}
      >
        add
      </Flex>
    </Flex>
  )
  
  const Transactions = () => {
    return (
      <Flex justify="center" p={4}>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
          sx={{ textDecoration: "underline" }}
        >
          view transactions
        </Box>
      </Flex>
    )
  }

  return (
    <ChakraProvider>
      <NavBar />
      <Flex mt="60px" justify="center" p={3}>
        <Box w="100%" maxW="600px">
          <Tabs />
          {!isNil(user) ? <NewTask /> : null}
          <Tasks />
        </Box>
      </Flex>
	  <Transactions />
    </ChakraProvider>
  )
}
```
## Congratulations!

Congrats! You have built a fully-decentralized Todo Manager Dapp from scratch using WeaveDB.

Go to [localhost:3000](http://localhost:3000) and see how it works.

You can also access the entire dapp code at [/examples/todos](https://github.com/weavedb/weavedb/tree/master/examples/todos).
