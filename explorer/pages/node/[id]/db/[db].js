import { useState, useEffect } from "react"
import Link from "next/link"
import DB from "weavedb-client"
import { Box, Flex, Image } from "@chakra-ui/react"
import { concat, last, isNil, map, includes } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Header from "components/Header"
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
            DB Info
          </Box>
          <Box
            w="100%"
            bg="white"
            py={2}
            px={6}
            sx={{ borderRadius: "10px" }}
            mb={6}
          >
            <Flex>
              <Box flex={1}>
                <Box sx={{ color: "#999" }}>Node Endopint</Box>
                <Box sx={{ fontSize: "14px" }}>
                  https://rollup-testnet.weavedb.xyz
                </Box>
              </Box>
              <Box mx={4} py={2} sx={{ borderRight: "1px solid #ddd" }}></Box>
              <Box flex={1}>
                <Box sx={{ color: "#999" }}>DB Instance</Box>
                <Box sx={{ fontSize: "14px" }}>
                  <Box>Jots Alpha</Box>
                </Box>
              </Box>
              <Box mx={4} py={2} sx={{ borderRight: "1px solid #ddd" }}></Box>
              <Box flex={1}>
                <Box sx={{ color: "#999" }}>Rollup Network</Box>
                <Box sx={{ fontSize: "14px" }}>Private Alpha</Box>
              </Box>
            </Flex>
            <Flex pt={2} mt={2} sx={{ borderTop: "1px solid #ddd" }}>
              <Box flex={1}>
                <Box sx={{ color: "#999" }}>Contract TxID</Box>
                <Box sx={{ fontSize: "14px" }}>None</Box>
              </Box>
              <Box mx={4} py={2} sx={{ borderRight: "1px solid #ddd" }}></Box>
              <Box flex={1}>
                <Box sx={{ color: "#999" }}>Transactions</Box>
                <Box sx={{ fontSize: "14px" }}>557</Box>
              </Box>
              <Box mx={4} py={2} sx={{ borderRight: "1px solid #ddd" }}></Box>
              <Box flex={1}>
                <Box sx={{ color: "#999" }}>App URL</Box>
                <Box sx={{ fontSize: "14px" }}>
                  <Box
                    as="a"
                    href="https://jots-alpha.weavedb.dev"
                    target="_blank"
                  >
                    jots-alpha.weavedb.dev
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Box>
          {txs.length === 0 ? null : (
            <>
              <Box px={2} mb={2} fontWeight="bold" color="#666" fontSize="16px">
                Latest Transactions
              </Box>
              <Box
                w="100%"
                bg="white"
                py={2}
                px={6}
                sx={{ borderRadius: "10px" }}
              >
                <Box as="table" w="100%">
                  <Box as="thead" fontSize="14px" color="#999">
                    <Box as="td" p={2} w="50px">
                      #
                    </Box>
                    <Box as="td" p={2}>
                      Query ID
                    </Box>
                    <Box as="td" p={2} w="100px">
                      Function
                    </Box>
                    <Box as="td" p={2}>
                      Collection
                    </Box>
                    <Box as="td" p={2}>
                      Signer
                    </Box>
                    <Box as="td" p={2} w="70px">
                      Date
                    </Box>
                    <Box as="td" p={2} w="100px">
                      Rollup
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {map(_v => {
                      let v = _v.data
                      let path = "-"
                      if (includes(v.input.function, ["add"])) {
                        path = v.input.query.slice(1).join(" / ")
                      } else if (
                        includes(v.input.function, [
                          "set",
                          "update",
                          "upsert",
                          "addIndex",
                          "removeIndex",
                          "setSchema",
                          "removeIndex",
                          "setRules",
                          "addTrigger",
                          "removeTrigger",
                        ])
                      ) {
                        path = v.input.query.slice(1, -1).join(" / ")
                      } else if (includes(v.input.function, ["delete"])) {
                        path = v.input.query.join(" / ")
                      }
                      return (
                        <>
                          <Box
                            bg={tx === v.id ? "#F2F2F2" : "white"}
                            as="tr"
                            sx={{
                              borderTop: "1px solid #ddd",
                              ":hover": { bg: "#F2F2F2", cursor: "pointer" },
                            }}
                            onClick={() => setTx(v.id)}
                          >
                            <Box as="td" p={2}>
                              {v.id}
                            </Box>
                            <Box as="td" p={2}>
                              {v.txid}
                            </Box>
                            <Box as="td" p={2}>
                              {v.input.function}
                            </Box>
                            <Box as="td" p={2} sx={{ wordBreak: "break-all" }}>
                              {path}
                            </Box>
                            <Box as="td" p={2}>
                              {v.input.caller}
                            </Box>
                            <Box as="td" p={2}>
                              {dayjs((v.tx_ts ?? v.blk_ts ?? 0) * 1000).fromNow(
                                true
                              )}
                            </Box>
                            <Box as="td" p={2}>
                              {!isNil(v.warp) ? (
                                <Box
                                  as="a"
                                  target="_blank"
                                  href={`https://sonar.warp.cc/#/app/interaction/${v.warp}?network=mainnet`}
                                  color="#4F49B6"
                                  sx={{ textDecoration: "underline" }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  {v.warp}
                                </Box>
                              ) : (
                                "not commited"
                              )}
                            </Box>
                          </Box>
                          {tx !== v.id ? null : (
                            <Box as="tr">
                              <Box px={6} pt={6} pb={4} as="td" colspan={10}>
                                <Flex pb={2}>
                                  <Flex
                                    justify="center"
                                    w="75px"
                                    px={2}
                                    bg="#763AAC"
                                    color="white"
                                    mr={2}
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    Query
                                  </Flex>
                                  <Box sx={{ wordBreak: "break-all" }}>
                                    {JSON.stringify(v.input.query)}
                                  </Box>
                                </Flex>
                                <Flex pb={2}>
                                  <Flex
                                    justify="center"
                                    w="75px"
                                    px={2}
                                    bg="#763AAC"
                                    color="white"
                                    mr={2}
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    Signature
                                  </Flex>
                                  <Box sx={{ wordBreak: "break-all" }}>
                                    {v.input.signature}
                                  </Box>
                                </Flex>
                              </Box>
                            </Box>
                          )}
                        </>
                      )
                    })(txs)}
                  </Box>
                </Box>
              </Box>
            </>
          )}
          {isnext ? (
            <Flex justify="center" w="100%" mt={6}>
              <Flex
                justify="center"
                bg="#763AAC"
                color="white"
                w="300px"
                py={2}
                onClick={async () => {
                  const _txs = await db.cget(
                    "txs",
                    ["id", "desc"],
                    ["startAfter", last(txs)],
                    20
                  )
                  setTxs(concat(txs, _txs))
                  setIsnext(_txs.length === 20)
                }}
                sx={{
                  borderRadius: "5px",
                  ":hover": { opacity: 0.75 },
                  cursor: "pointer",
                }}
              >
                Load More
              </Flex>
            </Flex>
          ) : null}
          <Flex px={2} mt={6} pt={4} sx={{ borderTop: "1px solid #ccc" }}>
            WeaveDB © 2023
          </Flex>
        </Box>
      </Flex>
    </>
  )
}
