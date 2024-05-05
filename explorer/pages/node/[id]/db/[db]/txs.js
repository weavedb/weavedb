import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import Link from "next/link"
import DB from "weavedb-client"
import { Box, Flex, Image } from "@chakra-ui/react"
import { concat, last, isNil, map, includes, indexBy, prop } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Header from "components/Header"
import { nodes } from "lib/nodes"
dayjs.extend(relativeTime)
let db = null
let to = null
export default function Home() {
  const router = useRouter()
  const [info, setInfo] = useState(null)
  const [node, setNode] = useState(null)
  const [err, setErr] = useState(null)

  const [txs, setTxs] = useState([])
  const [blks, setBlks] = useState([])
  const [isnext, setIsnext] = useState(false)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    ;(async () => {
      if (!isNil(router.query.id)) {
        const node = indexBy(prop("key"), nodes)[router.query.id]
        if (!isNil(node)) {
          setNode(node)
          const rpc =
            node.endpoint.split(":")[1] === "443"
              ? `https://${node.endpoint.split(":")[0]}`
              : `http://${node.endpoint}`
          db = new DB({
            contractTxId: "offchain",
            rpc,
          })
          try {
            setInfo(await db.node({ op: "stats" }))
          } catch (e) {
            setErr(true)
          }
        }
      }
    })()
  }, [router])
  useEffect(() => {
    ;(async () => {
      if (!isNil(info)) {
        clearTimeout(to)
        const db_info = indexBy(prop("id"), info.dbs)[router.query.db]
        if (!isNil(db_info)) {
          const rpc =
            node.endpoint.split(":")[1] === "443"
              ? `https://${node.endpoint.split(":")[0]}`
              : `http://${node.endpoint}`
          db = new DB({
            contractTxId: `${router.query.db}#log`,
            rpc,
          })
          const _txs = await db.cget("txs", ["id", "desc"], 20)
          setTxs(_txs)
          setIsnext(_txs.length === 20)
          let i = 0
          setInterval(async () => setTick(++i), 5000)
          const _blks = await db.cget("blocks", ["height", "desc"], 20)
          console.log(_blks)
        }
      }
    })()
  }, [info])
  console.log(blks)
  useEffect(() => {
    ;(async () => {
      if (!isNil(info)) {
        const rpc =
          node.endpoint.split(":")[1] === "443"
            ? `https://${node.endpoint.split(":")[0]}`
            : `http://${node.endpoint}`

        db = new DB({
          contractTxId: `${router.query.db}#log`,
          rpc,
        })
        if (!isNil(txs[0])) {
          const _txs = await db.cget(
            "txs",
            ["id", "desc"],
            ["endBefore", txs[0]]
          )
          if (_txs.length > 0) setTxs(concat(_txs, txs))
        }
      }
    })()
  }, [tick])
  const db_info = indexBy(prop("id"), info?.dbs ?? [])[router?.query.db]?.data
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
        minH="calc(100% - 50px)"
        bg="#F2F2F2"
        justify="center"
      >
        <Box w="100%" maxW="1400px">
          {isNil(node) ? null : (
            <>
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
                    <Box sx={{ fontSize: "14px" }} color="#763AAC">
                      <Link href={`/node/${router.query.id}`}>
                        {node.endpoint}
                      </Link>
                    </Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>DB Instance</Box>
                    <Box sx={{ fontSize: "14px" }} color="#763AAC">
                      <Link
                        href={`/node/${router.query.id}/db/${router.query.db}`}
                      >
                        <Box>{db_info?.name ?? "-"}</Box>
                      </Link>
                    </Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>Rollup Network</Box>
                    <Box sx={{ fontSize: "14px" }}>Private Alpha</Box>
                  </Box>
                </Flex>
                <Flex pt={2} mt={2} sx={{ borderTop: "1px solid #ddd" }}>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>Contract TxID</Box>
                    <Box sx={{ fontSize: "14px" }}>
                      {!isNil(db_info?.contractTxId) ? (
                        <Box
                          as="a"
                          color="#763AAC"
                          href={`https://sonar.warp.cc/#/app/contract/${db_info.contractTxId}`}
                          target="_blank"
                        >
                          {db_info.contractTxId}
                        </Box>
                      ) : (
                        router.query?.db ?? "-"
                      )}
                    </Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>Transactions</Box>
                    <Box sx={{ fontSize: "14px" }}>
                      {txs.length === 0 ? 0 : +txs[0].id}
                    </Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>App URL</Box>
                    <Box sx={{ fontSize: "14px" }}>
                      <Box
                        color="#763AAC"
                        as="a"
                        href={db_info?.app}
                        target="_blank"
                        sx={{ ":hover": { opacity: 0.75 } }}
                      >
                        {(db_info?.app ?? "-").replace(/^http(s)+\:\/\//i, "")}
                      </Box>
                    </Box>
                  </Box>
                </Flex>
              </Box>
              {txs.length === 0 ? null : (
                <>
                  <Box
                    px={2}
                    mb={2}
                    fontWeight="bold"
                    color="#666"
                    fontSize="16px"
                  >
                    Transactions
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
                        <Box as="td" p={2} w="150px">
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
                          Block
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {map(_v => {
                          let v = _v.data
                          let path = "-"
                          let func = v.input.function
                          if (
                            includes(func, [
                              "add",
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
                          } else if (
                            includes(func, ["set", "update", "upsert"])
                          ) {
                            path = v.input.query.slice(1, -1).join(" / ")
                          } else if (includes(func, ["delete"])) {
                            path = v.input.query.slice(0, -1).join("/")
                          } else if (func === "query") {
                            func = v.input.query[0]
                            const _func = v.input.query[0].split(":")[0]
                            if (_func === "add") {
                              path = v.input.query.slice(2).join(" / ")
                            } else if (
                              includes(_func, ["set", "update", "upsert"])
                            ) {
                              path = v.input.query.slice(2, -1).join(" / ")
                            } else {
                              path = v.input.query.slice(1, -1).join("/")
                            }
                          }
                          let isNostr = v.input.function === "nostr"
                          return (
                            <>
                              <Box
                                as="tr"
                                sx={{
                                  borderTop: "1px solid #ddd",
                                  ":hover": {
                                    bg: "#F2F2F2",
                                  },
                                }}
                              >
                                <Box as="td" p={2}>
                                  {v.id}
                                </Box>
                                <Box as="td" p={2} color="#763AAC">
                                  <Link
                                    href={`/node/${router.query.id}/db/${router.query.db}/tx/${v.txid}`}
                                    sx={{ ":hover": { opacity: 0.75 } }}
                                  >
                                    {v.txid}
                                  </Link>
                                </Box>
                                <Box as="td" p={2}>
                                  {func}
                                </Box>
                                <Box
                                  as="td"
                                  p={2}
                                  sx={{ wordBreak: "break-all" }}
                                >
                                  {isNostr ? "nostr_events" : path}
                                </Box>
                                <Box as="td" p={2} color="#763AAC">
                                  {isNostr ? (
                                    <Box>
                                      {v.input.query.pubkey.slice(1, 10)}...
                                      {v.input.query.pubkey.slice(-10)}
                                    </Box>
                                  ) : (
                                    <Link
                                      href={`/node/${router.query.id}/db/${router.query.db}/address/${v.input.caller}`}
                                      sx={{ ":hover": { opacity: 0.75 } }}
                                    >
                                      {v.input.caller}
                                    </Link>
                                  )}
                                </Box>
                                <Box as="td" p={2} w="100px">
                                  {dayjs(v.tx_ts ?? v.blk_ts ?? 0).fromNow(
                                    true
                                  )}
                                </Box>
                                <Box as="td" p={2}>
                                  {!isNil(v.warp) ? (
                                    <Link
                                      href={`/node/${router.query.id}/db/${router.query.db}/block/${v.block}`}
                                      sx={{ ":hover": { opacity: 0.75 } }}
                                    >
                                      <Box color="#763AAC">{v.block}</Box>
                                    </Link>
                                  ) : (
                                    "-"
                                  )}
                                </Box>
                              </Box>
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
            </>
          )}
          <Flex px={2} mt={6} pt={4} sx={{ borderTop: "1px solid #ccc" }}>
            WeaveDB © {new Date().getFullYear()}
          </Flex>
        </Box>
      </Flex>
    </>
  )
}
