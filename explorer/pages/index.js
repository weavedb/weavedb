import { useState, useEffect } from "react"
import Link from "next/link"
import DB from "weavedb-client"
import { Box, Flex, Image } from "@chakra-ui/react"
import { concat, last, isNil, map, includes } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Header from "components/Header"
import Footer from "components/Footer"
dayjs.extend(relativeTime)
let db = null
let to = null
export default function Home() {
  const [txs, setTxs] = useState([])
  const [tx, setTx] = useState(null)
  const [isnext, setIsnext] = useState(false)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    ;(async () => {
      clearTimeout(to)
      db = new DB({
        contractTxId: "offchain#log",
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC,
      })
      const _txs = await db.cget("txs", ["id", "desc"], 20)
      setTxs(_txs)
      setIsnext(_txs.length === 20)
      let i = 0
      setInterval(async () => setTick(++i), 5000)
    })()
  }, [])
  useEffect(() => {
    ;(async () => {
      db = new DB({
        contractTxId: "offchain#log",
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC,
      })
      if (!isNil(txs[0])) {
        const _txs = await db.cget("txs", ["id", "desc"], ["endBefore", txs[0]])
        if (_txs.length > 0) setTxs(concat(_txs, txs))
      }
    })()
  }, [tick])
  return (
    <>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <Header />
      <Box height="50px" />
      <Flex
        p={6}
        fontSize="12px"
        w="100%"
        minH="100%"
        bg="#F2F2F2"
        justify="center"
      >
        <Box w="100%" maxW="1400px">
          <Box px={2} mb={2} fontWeight="bold" color="#666" fontSize="16px">
            Rollup Nodes
          </Box>
          <Link href="/node/alpha">
            <Box
              w="100%"
              bg="white"
              py={2}
              px={6}
              sx={{ borderRadius: "10px", ":hover": { opacity: 0.75 } }}
              mb={6}
            >
              <Flex>
                <Box flex={1}>
                  <Box sx={{ color: "#999" }}>Node Endopint</Box>
                  <Box sx={{ fontSize: "14px" }}>
                    rollup-testnet.weavedb.xyz:443
                  </Box>
                </Box>
                <Box mx={4} py={2} sx={{ borderRight: "1px solid #ddd" }}></Box>
                <Box flex={1}>
                  <Box sx={{ color: "#999" }}>DB Instances</Box>
                  <Box sx={{ fontSize: "14px" }}>
                    <Box>3</Box>
                  </Box>
                </Box>
                <Box mx={4} py={2} sx={{ borderRight: "1px solid #ddd" }}></Box>
                <Box flex={1}>
                  <Box sx={{ color: "#999" }}>Rollup Network</Box>
                  <Box sx={{ fontSize: "14px" }}>Private Alpha</Box>
                </Box>
              </Flex>
            </Box>
          </Link>
          <Footer />
        </Box>
      </Flex>
    </>
  )
}
