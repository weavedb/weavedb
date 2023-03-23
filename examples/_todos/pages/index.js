import { useRef, useState, useEffect } from "react"
import lf from "localforage"
import { isNil, map } from "ramda"
import SDK from "weavedb-client"
import { Buffer } from "buffer"
import { ethers } from "ethers"
import { Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"
let db
const contractTxId = "W9IXlrcvp8oTx0Xl-IHhpoWleTAxF2ZUGFs9w1Jsscc"
export default function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [initDB, setInitDB] = useState(false)
  const [task, setTask] = useState("")

  const setupWeaveDB = async () => {
    db = new SDK({
      contractTxId,
      rpc: "https://tel-aviv.asteroid.ac",
    })
    setInitDB(true)
  }
  const getTasks = async () => {
    setTasks(await db.cget("tasks", ["date", "desc"]))
  }

  const addTask = async task => {
    await db.add(
      {
        task,
        date: Date.now(),
        user: db.signer(),
        done: false,
      },
      "tasks",
      user
    )
    await getTasks()
  }

  const completeTask = async id => {
    const tx = await db.update({ done: true }, "tasks", id, user)
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
    if (initDB) getTasks()
  }, [initDB])

  const NavBar = () => (
    <Flex py={3} px={6} position="fixed" w="100%" sx={{ top: 0, left: 0 }}>
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

  const Tasks = () =>
    map(v => (
      <Flex
        sx={{ border: "1px solid #ddd", borderRadius: "5px" }}
        color="#333"
        p={3}
        my={3}
        bg={v.data.done ? "#ccc" : "white"}
      >
        <Box
          w="30px"
          textAlign="center"
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        >
          {v.data.done ? (
            "✅"
          ) : v.data.user !== user?.wallet.toLowerCase() ? null : (
            <Box onClick={() => completeTask(v.id)}>⬜</Box>
          )}
        </Box>
        <Box
          px={3}
          flex={1}
          style={{
            marginLeft: "10px",
            textDecoration: v.data.done ? "line-through" : "",
          }}
        >
          {v.data.task}
        </Box>
        <Box w="100px" textAlign="center" style={{ marginLeft: "10px" }}>
          {v.data.user.slice(0, 7)}
        </Box>
      </Flex>
    ))(tasks)

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
    <>
      <style jsx global>{`
        html,
        #__next,
        body.chakra-ui-light {
          color: white;
          background-image: radial-gradient(
            circle,
            #b51da6,
            #94259a,
            #75288c,
            #58277b,
            #3e2368
          );
        }
      `}</style>
      <ChakraProvider>
        <NavBar />
        <Flex mt="60px" justify="center" py={3} px={6}>
          <Box w="100%" maxW="600px">
            {!isNil(user) ? (
              <Flex mb={4}>
                <Input
                  color="#333"
                  flex={1}
                  bg="white"
                  placeholder="Enter New Task"
                  value={task}
                  onChange={e => {
                    setTask(e.target.value)
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
                    if (!/^\s*$/.test(task)) {
                      await addTask(task)
                      setTask("")
                    }
                  }}
                >
                  Add Task
                </Flex>
              </Flex>
            ) : null}
            <Tasks />
          </Box>
        </Flex>
        <Transactions />
      </ChakraProvider>
    </>
  )
}
