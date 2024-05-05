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
  const [block, setBlock] = useState(null)
  const [txs, setTxs] = useState([])
  const [blks, setBlks] = useState([])
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
          const _txs = await db.cget(
            "txs",
            ["id", "desc"],
            ["block", "==", +router.query.block]
          )
          setTxs(_txs)
          let i = 0
          const _blk = await db.cget("blocks", router.query.block)
          setBlock(_blk)
        }
      }
    })()
  }, [info])
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
                    <Box sx={{ color: "#999" }}>Block Height</Box>
                    <Box sx={{ fontSize: "14px" }}>{router?.query?.block}</Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>Warp TxId</Box>
                    <Box sx={{ fontSize: "14px" }}>
                      {!isNil(block?.data?.txid) ? (
                        <Box
                          as="a"
                          color="#763AAC"
                          href={`https://sonar.warp.cc/#/app/interaction/${block.data.txid}?network=mainnet`}
                          target="_blank"
                        >
                          {block.data.txid}
                        </Box>
                      ) : (
                        "-"
                      )}
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
                          Warp TxId
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {map(_v => {
                          let v = _v.data
                          let path = "-"
                          if (
                            includes(v.input.function, [
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
                            includes(v.input.function, [
                              "set",
                              "update",
                              "upsert",
                            ])
                          ) {
                            path = v.input.query.slice(1, -1).join(" / ")
                          } else if (includes(v.input.function, ["delete"])) {
                            path = v.input.query.slice(0, -1).join("/")
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
                                  {v.input.function}
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
                                    <Box
                                      as="a"
                                      target="_blank"
                                      href={`https://sonar.warp.cc/#/app/interaction/${v.warp}?network=mainnet`}
                                      color="#763AAC"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {v.warp.slice(0, 5)}...
                                      {v.warp.slice(-5)}
                                    </Box>
                                  ) : (
                                    "not commited"
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
