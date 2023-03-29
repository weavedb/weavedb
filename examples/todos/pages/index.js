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
  const tabs = isNil(user) ? ["All"] : ["All", "Yours"]

  const setupWeaveDB = async () => {
    window.Buffer = Buffer
    db = new SDK({
      contractTxId,
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
        JSON.parse(JSON.stringify(identity))
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

  const NewTask = () => {
    const [newTask, setNewTask] = useState("")

    const handleAddBtnClick = async () => {
      if (!/^\s*$/.test(newTask)) {
        await addTask(newTask)
        setNewTask("")
      }
    }

    return (
      <Flex mb={4}>
        <Input
          placeholder="Enter New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
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
          onClick={handleAddBtnClick}
        >
          add
        </Flex>
      </Flex>
    )
  }

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
