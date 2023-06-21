---
sidebar_position: 1
---

# Basic

This tutorial will guide you through the process of deploying your first WeaveDB database and teach you how to interact with it.

## Deploy database contract

To deploy a WeaveDB database, follow these steps:

1. Go to [console.weavedb.dev](https://console.weavedb.dev/).

2. Click on the Deploy WeaveDB button.

![](https://i.imgur.com/4kzNNZr.png)

3. Connect your wallet by clicking on Connect Owner Wallet. This wallet will serve as the admin account for configuring your database.

![](https://i.imgur.com/dSZfEQ1.png)

4. Set `Secure` to `False` for the purposes of this tutorial. (Note: In a production setting, you should never set `Secure` to `False`.)

5. Finally, click on `Deploy DB Instance`. Your WeaveDB database will be deployed to the mainnet in just a few seconds. You can view the transaction for the deployment by clicking on the `contractTxId` link.

![](https://i.imgur.com/vL4d75W.png)

## Create a new collection

Using the [web console](https://console.weavedb.dev/), click `Data Collections` in the side menu, and then click the `+` icon in the `Collection` box to open up a dialog. After putting the name of your collection in the "Collection ID" input field, click "Add".

For this example, we will set `people` as our collection name.

## Connect database with a web app



### Create NextJS project 

Set up a NextJS project with the app name `basic`

To keep things simple, we'll put everything in one file at `/index.js`

You can skip to the end to copy and paste the complete sample code.
```bash
yarn create next-app basic
```

### Install weavedb-sdk
Open a new terminal and move to the project root directory.
```bash
cd basic
yarn add weavedb-sdk
```

### Import dependencies

```js
import { useEffect, useState } from "react"
import SDK from "weavedb-sdk"
```

### Define variables

Replace `contractTxId` string value with the contractTxId when deploying the WeaveDB contract.

Replace `COLLECTION_NAME` string value with the name of your collection. For this example, we have set `people` as our collection name.
```js
  const contractTxId = ""
  const COLLECTION_NAME = "people"

  // State variable storing an array of people data
  const [people, setPeople] = useState([])
  // State variable storing the weavedb-sdk object
  const [db, setDb] = useState(null)
  // State variable storing a boolean value indicating whether database initialization is complete.
  const [initDb, setInitDb] = useState(false)
```

### Initialize WeaveDB instance

```js
const setupWeaveDB = async () => {
  try {
    const _db = new SDK({
      contractTxId: contractTxId,
    })
    await _db.initializeWithoutWallet()
    setDb(_db)
    setInitDb(true)
  } catch (e) {
    console.error("setupWeaveDB", e)
  }
}
```

### Add a doc to a collection

```js
const handleAddClick = async () => {
  const personData = { name: "Bob", age: Number(20) }

  try {
    const result = await db.add(personData, COLLECTION_NAME)
    getCollection()
    console.log("handleAddClick()", result)
  } catch (e) {
    console.error(e)
  }
}
```

### Get docs in a collection

```js
  const getCollection = async () => {
    try {
      const result = await db.cget(COLLECTION_NAME)
      setPeople(result)
      console.log("getCollection()", result)
    } catch (e) {
      console.error(e)
    }
  }
```

### Complete code

```js
import { useEffect, useState } from "react"
import SDK from "weavedb-sdk"

export default function Home() {
  //Replace contractTxId string value with the contractTxId when deploying the WeaveDB contract.
  const contractTxId = ""
  // Replace COLLECTION_NAME string value with the name of your collection. For this example, we have set people as our collection name.
  const COLLECTION_NAME = "people"

  // State variable storing an array of people data
  const [people, setPeople] = useState([])
  // State variable storing the weavedb-sdk object
  const [db, setDb] = useState(null)
  // State variable storing a boolean value indicating whether database initialization is complete.
  const [initDb, setInitDb] = useState(false)

  const setupWeaveDB = async () => {
    try {
      const _db = new SDK({
        contractTxId: contractTxId,
      })
      await _db.initializeWithoutWallet()
      setDb(_db)
      setInitDb(true)
    } catch (e) {
      console.error("setupWeaveDB", e)
    }
  }

  // Function to retrieve all docs from the database collection.
  const getCollection = async () => {
    try {
      const result = await db.cget(COLLECTION_NAME)
      setPeople(result)
      console.log("getCollection()", result)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddClick = async () => {
    const personData = { name: "Bob", age: Number(20) }

    try {
      const result = await db.add(personData, COLLECTION_NAME)
      getCollection()
      console.log("handleAddClick()", result)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    setupWeaveDB()
  }, [])

  // Effect hook to retrieve all docs from the collection on database initialization.
  useEffect(() => {
    if (initDb) {
      getCollection()
    }
  }, [initDb])

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <br />
        <br />
        <button onClick={handleAddClick}>Add Person</button>
        <br /> <br />
        <table cellPadding="8px">
          <thead>
            <tr align="left">
              <th>Name</th>
              <th>Age</th>
              <th>DocId</th>
            </tr>
          </thead>
          <tbody>
            {people.map((item, index) => (
              <tr key={index}>
                <td>{item.data.name}</td>
                <td>{item.data.age}</td>
                <td>{item.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
```

## Run App

```bash
yarn dev
```
Now your app should be running at [localhost:3000](http://localhost:3000)