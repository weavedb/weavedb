import {
  Box,
  ChakraProvider,
  Flex,
  Text,
  useColorMode,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react"
import { MoonIcon, SunIcon } from "@chakra-ui/icons"
import { isNil, map } from "ramda"
import { useEffect, useRef, useState } from "react"
import { ethers } from "ethers"
import lf from "localforage"
import SDK from "weavedb-sdk"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Chart } from "chart.js/auto"
import { nanoid } from "nanoid"

let db
const contractTxId = "I-4lx8uOt-tOR6ebAEDw4jw3X4ntokdIBE7l4bXIHnM"
const COLLECTION_NAME = "game_results"
const LAST_GUESS_DATE_DEFAULT = 0

export default function Home() {
  const [user, setUser] = useState(null)
  const [initDB, setInitDB] = useState(false)
  const [winCount, setWinCount] = useState(0)
  const [lossCount, setLossCount] = useState(0)
  const [totalCount, setTotalCount] = useState(-1)
  const [lastGuessDate, setLastGuessDate] = useState(LAST_GUESS_DATE_DEFAULT)
  const [chart, setChart] = useState(null)
  const chartRef = useRef(null)

  const setupWeaveDB = async () => {
    db = await new SDK({
      contractTxId: contractTxId,
    })
    await db.initializeWithoutWallet()
    setInitDB(true)
  }

  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`)
    if (!isNil(wallet_address)) {
      const identity = await lf.getItem(
        `temp_address:${contractTxId}:${wallet_address}`
      )
      if (!isNil(identity)) {
        setUser({
          wallet: wallet_address,
          privateKey: identity.privateKey,
        })
      }
    }
    console.log("<<checkUser()")
  }

  const login = async () => {
    console.log(">>login()")
    const provider = new ethers.BrowserProvider(window.ethereum, "any")
    const signer = await provider.getSigner()
    await provider.send("eth_requestAccounts", [])
    const wallet_address = await signer.getAddress()
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
    console.log("<<login()")
  }

  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current")
      setUser(null, "temp_current")
    }
    console.log("<<logout()")
  }

  const onClickOdd = async () => {
    addGuess(false)
  }

  const onClickEven = async () => {
    addGuess(true)
  }

  const addGuess = async (isEven) => {
    const docId = nanoid()
    console.log("docId", docId)
    console.log("addGuess() : isEven", isEven)
    console.log("addGuess() : lastGuessDate", lastGuessDate)

    try {
      const tx = await db.set(
        {
          is_even: isEven,
          date: db.ts(),
          user_address: db.signer(),
          last_guess_date: lastGuessDate,
        },
        COLLECTION_NAME,
        docId,
        user
      )
      console.log("tx", tx)

      const newDocument = await db.get(COLLECTION_NAME, docId)
      console.log("addGuess newDocument", newDocument)
      if (isNil(newDocument)) {
        const txResult = await db.getResult()
        console.log("addGuess txResult", txResult)
        toast(txResult.error)
      } else {
        const str = isEven ? "EVEN" : "ODD"
        newDocument.has_won
          ? toast("You won! Your guess is " + str + "==" + newDocument.date)
          : toast("You lost! Your guess is " + str + "==" + newDocument.date)
      }

      getMyGameResults()
    } catch (e) {
      toast(e.message)
      console.log(e)
    }
  }

  const getMyGameResults = async () => {
    try {
      if (!isNil(user)) {
        const result = await db.cget(
          COLLECTION_NAME,
          ["user_address", "==", user.wallet.toLowerCase()],
          ["date", "desc"]
        )
        console.log("getMyGameResults result", result)
        setLastGuessDate(result[0]?.data?.date ?? LAST_GUESS_DATE_DEFAULT)

        let winCount = 0
        let lossCount = 0
        map((v) => {
          v.data.has_won ? winCount++ : lossCount++
        })(result)
        setWinCount(winCount)
        setLossCount(lossCount)
        setTotalCount(winCount + lossCount)
      }
    } catch (e) {
      toast(e.message)
      console.log(e)
    }
    console.log("<<getMyGameResults()")
    setupPieChart()
  }

  const chart_data = {
    labels: ["Win", "Loss"],
    datasets: [
      {
        data: [winCount, lossCount],
        backgroundColor: ["#0080ff", "#ff0080"],
      },
    ],
  }

  const chart_config = {
    type: "doughnut",
    data: chart_data,
  }

  const setupPieChart = async () => {
    if (!isNil(chart)) {
      chart.destroy()
    }
    const context = chartRef.current
    const chartInstance = new Chart(context, chart_config)
    setChart(chartInstance)
    console.log("<<setupPieChart()")
  }

  const NavBar = () => {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
      <Flex p={3} position="fixed" top={0} w="100%" bg="#7928ca" color="white">
        <Box flex={1} />
        <Box
          py={2}
          mx={8}
          cursor="pointer"
          _hover={{ opacity: 0.75 }}
          onClick={() => toggleColorMode()}
        >
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        </Box>
        <Box
          bg="#ff0080"
          py={2}
          px={6}
          borderRadius="lg"
          cursor="pointer"
          _hover={{ opacity: 0.75 }}
        >
          {!isNil(user) ? (
            <Box onClick={() => logout()}>{user.wallet.slice(0, 8)}</Box>
          ) : (
            <Box onClick={() => login()}>Connect Wallet</Box>
          )}
        </Box>
      </Flex>
    )
  }

  const AnswerButton = (props) => {
    const { btnText, btnClick } = props

    return (
      <Box
        borderRadius="lg"
        p={4}
        background="linear-gradient(to bottom, #ff0080, #7928ca)"
        minW="200px"
        cursor="pointer"
        _hover={{ opacity: 0.75 }}
        onClick={btnClick}
      >
        <Text
          fontSize="5xl"
          fontWeight="bold"
          textAlign="center"
          color="white"
          fontFamily="monospace"
        >
          {btnText}
        </Text>
      </Box>
    )
  }

  const AnswerButtons = () => {
    return (
      <Flex justifyContent="space-between" my={8}>
        <AnswerButton btnText="ODD" btnClick={onClickOdd} />
        <AnswerButton btnText="EVEN" btnClick={onClickEven} />
      </Flex>
    )
  }

  const GameResultStats = () => {
    return (
      <>
        <Flex borderWidth="1px" borderRadius="lg" p={3} mb={8}>
          <Stat>
            <StatLabel>Win</StatLabel>
            <StatNumber>{winCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Loss</StatLabel>
            <StatNumber>{lossCount}</StatNumber>
          </Stat>
        </Flex>
      </>
    )
  }

  const Transactions = () => {
    return (
      <Flex justify="center" my={18}>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
          textDecoration="underline"
        >
          view transactions
        </Box>
      </Flex>
    )
  }

  useEffect(() => {
    checkUser()
    setupWeaveDB()
  }, [])

  useEffect(() => {
    console.log("useEffect() initDB", initDB)
    if (initDB) {
      if (!isNil(user)) getMyGameResults()
    }
  }, [initDB, totalCount, winCount, lossCount, user])

  return (
    <>
      <ToastContainer />
      <ChakraProvider>
        <NavBar />
        <Flex mt="60px" justify="center" p={3}>
          <Box w="100%" maxW="600px">
            <AnswerButtons />
            {!isNil(user) ? (
              <>
                <GameResultStats /> <canvas ref={chartRef} />
              </>
            ) : null}
          </Box>
        </Flex>
        <Transactions />
      </ChakraProvider>
    </>
  )
}
