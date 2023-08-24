import { useState, useEffect } from "react"
import DB from "weavedb-client"
import { Box, Flex } from "@chakra-ui/react"
import { concat, last, isNil, map, includes } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
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
      const _txs = await db.cget("txs", ["id", "desc"], ["endBefore", txs[0]])
      if (_txs.length > 0) setTxs(concat(_txs, txs))
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
      <Flex
        justify="center"
        sx={{ position: "fixed", top: 0, left: 0 }}
        height="50px"
        align="center"
        w="100%"
        px={6}
      >
        <Box as="span" mx={2} fontWeight="bold">
          WeaveDB Rollup Explorer
        </Box>
        <Box flex={1} />
        {isNil(process.env.NEXT_PUBLIC_CONTRACT_TX_ID) ? null : (
          <Box
            as="a"
            target="_blank"
            href={`https://sonar.warp.cc/#/app/contract/${process.env.NEXT_PUBLIC_CONTRACT_TX_ID}?network=mainnet`}
            mx={2}
            color="#4F49B6"
            sx={{ textDecoration: "underline" }}
          >
            {process.env.NEXT_PUBLIC_CONTRACT_TX_ID}
          </Box>
        )}
      </Flex>
      <Box
        pb={6}
        pt="50px"
        px={6}
        fontSize="12px"
        width="100%"
        minH="100%"
        bg="#eee"
      >
        {txs.length === 0 ? null : (
          <Box w="100%" bg="white" py={2} px={6} sx={{ borderRadius: "10px" }}>
            <Box as="table" w="100%">
              <Box as="thead" fontSize="14px" color="#999">
                <Box as="td" p={2}>
                  #
                </Box>
                <Box as="td" p={2}>
                  Query ID
                </Box>
                <Box as="td" p={2}>
                  Function
                </Box>
                <Box as="td" p={2}>
                  Path
                </Box>
                <Box as="td" p={2}>
                  Signer
                </Box>
                <Box as="td" p={2}>
                  Timestamp
                </Box>
                <Box as="td" p={2}>
                  Warp Bundle
                </Box>
              </Box>
              <Box as="tbody">
                {map(_v => {
                  let v = _v.data
                  let path = "-"
                  if (
                    includes(v.input.function, [
                      "add",
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
                    path = v.input.query.slice(1).join(" / ")
                  } else if (includes(v.input.function, ["delete"])) {
                    path = v.input.query.join(" / ")
                  }
                  return (
                    <>
                      <Box
                        bg={tx === v.id ? "#eee" : "white"}
                        as="tr"
                        sx={{
                          borderTop: "1px solid #ddd",
                          ":hover": { bg: "#eee", cursor: "pointer" },
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
                        <Box as="td" p={2}>
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
                                bg="#4F49B6"
                                color="white"
                                mr={2}
                                sx={{ borderRadius: "3px" }}
                              >
                                Query
                              </Flex>
                              <Box>{JSON.stringify(v.input.query)}</Box>
                            </Flex>
                            <Flex pb={2}>
                              <Flex
                                justify="center"
                                w="75px"
                                px={2}
                                bg="#4F49B6"
                                color="white"
                                mr={2}
                                sx={{ borderRadius: "3px" }}
                              >
                                Signature
                              </Flex>
                              <Box>{v.input.signature}</Box>
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
        )}
        {isnext ? (
          <Flex justify="center" w="100%" mt={6}>
            <Flex
              justify="center"
              bg="#666"
              color="white"
              w="200px"
              py={1}
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
      </Box>
    </>
  )
}
