import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import Link from "next/link"
import DB from "weavedb-client"
import { Box, Flex, Image } from "@chakra-ui/react"
import { concat, last, isNil, map, includes, indexBy, prop } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import LocalizedFormat from "dayjs/plugin/localizedFormat"
import Header from "components/Header"
import Footer from "components/Footer"
import { nodes } from "lib/nodes"
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
let db = null
let to = null
export default function Home() {
  const router = useRouter()
  const [info, setInfo] = useState(null)
  const [node, setNode] = useState(null)
  const [err, setErr] = useState(null)
  const [tx, setTx] = useState(null)
  const [tx_info, setTxInfo] = useState(null)
  useEffect(() => {
    ;(async () => {
      if (!isNil(router.query.id)) {
        setTx(router.query.tx)
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
          const _tx = await db.get("txs", ["txid", "==", router.query.tx])
          if (_tx.length > 0) setTxInfo(_tx[0])
        }
      }
    })()
  }, [info])
  const db_info = indexBy(prop("id"), info?.dbs ?? [])[router?.query.db]?.data
  let path = "-"
  let doc = "-"
  let func = tx_info?.input.function
  let custom = null
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
    path = tx_info?.input.query.slice(1).join(" / ")
  } else if (includes(func, ["set", "update", "upsert"])) {
    path = tx_info?.input.query.slice(1, -1).join(" / ")
  } else if (includes(func, ["delete"])) {
    path = tx_info?.input.query.slice(0, -1).join("/")
  } else if (func === "query") {
    func = tx_info?.input.query[0]
    custom = func
    const _func = tx_info?.input.query[0].split(":")[0]
    if (_func === "add") {
      path = tx_info?.input.query.slice(2).join(" / ")
    } else if (includes(_func, ["set", "update", "upsert"])) {
      path = tx_info?.input.query.slice(2, -1).join(" / ")
    } else {
      path = tx_info?.input.query.slice(1, -1).join("/")
    }
    if (includes(_func)(["set", "update", "upsert", "delete"])) {
      doc = last(tx_info.input.query)
    }
  }
  if (
    !isNil(tx_info) &&
    includes(tx_info.input.function)(["set", "update", "upsert", "delete"])
  ) {
    doc = last(tx_info.input.query)
  }
  let isNostr = tx_info?.input["function"] === "nostr"
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
                    <Box sx={{ fontSize: "14px" }}>{router.query.db}</Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>Transaction ID</Box>
                    <Box sx={{ fontSize: "14px" }}>{tx ?? "-"}</Box>
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
              {isNil(tx_info) ? null : (
                <>
                  <Box
                    px={2}
                    mb={2}
                    fontWeight="bold"
                    color="#666"
                    fontSize="16px"
                  >
                    Transaction Info{isNostr ? " | Nostr Event" : null}
                  </Box>
                  <Box
                    w="100%"
                    bg="white"
                    py={2}
                    px={6}
                    sx={{ borderRadius: "10px" }}
                  >
                    <Box as="table" w="100%" fontSize="14px">
                      <Box as="tbody" w="100%">
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Transaction ID:
                          </Box>
                          <Box as="td" px={4} py={2}>
                            {tx_info.txid}
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Block Height:
                          </Box>
                          <Box as="td" px={4} py={2} color="#763AAC">
                            <Link
                              href={`/node/${router.query.id}/db/${router.query.db}/block/${tx_info.block}`}
                            >
                              {tx_info.block}
                            </Link>
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Timestamp:
                          </Box>
                          <Box as="td" px={4} py={2}>
                            {dayjs(
                              tx_info.tx_ts ?? tx_info.blk_ts ?? 0
                            ).fromNow()}{" "}
                            (
                            {dayjs(tx_info.tx_ts ?? tx_info.blk_ts ?? 0).format(
                              "llll"
                            )}
                            )
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Function:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            sx={{ wordBreak: "break-all" }}
                          >
                            {tx_info.input["function"]}
                            {isNil(custom) ? "" : ` (${custom})`}
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Collection:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            sx={{ wordBreak: "break-all" }}
                          >
                            {isNostr ? "nostr_events" : path}
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            {isNostr ? "Event ID" : "Doc"}:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            sx={{ wordBreak: "break-all" }}
                          >
                            {isNostr ? tx_info.input.query.id : doc}
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            {isNostr ? "Pubkey" : "Signer"}:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            color="#763AAC"
                            sx={{ wordBreak: "break-all" }}
                          >
                            {isNostr ? (
                              tx_info.input.query.pubkey
                            ) : (
                              <Link
                                href={`/node/${router.query.id}/db/${router.query.db}/address/${tx_info.input.caller}`}
                              >
                                {tx_info.input.caller}
                              </Link>
                            )}
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            {isNostr ? "Kind" : "Nonce"}:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            sx={{ wordBreak: "break-all" }}
                          >
                            {isNostr
                              ? tx_info.input.query.kind
                              : tx_info.input.nonce}
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            {isNostr ? "Event" : "Query"}:
                          </Box>
                          <Box as="td" px={4} py={2}>
                            <Box
                              sx={{
                                wordBreak: "break-all",
                                borderRadius: "5px",
                                border: "1px solid #eee",
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                              p={4}
                              bg="#F8F9FA"
                              color="##6c757d"
                            >
                              {JSON.stringify(tx_info.input.query)}
                            </Box>
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Signature:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            sx={{ wordBreak: "break-all" }}
                          >
                            <Box
                              sx={{
                                wordBreak: "break-all",
                                borderRadius: "5px",
                                border: "1px solid #eee",
                                fontFamily: "monospace",
                                fontSize: "12px",
                              }}
                              p={4}
                              bg="#F8F9FA"
                              color="##6c757d"
                            >
                              {isNostr
                                ? tx_info.input.query.sig
                                : tx_info.input.signature}
                            </Box>
                          </Box>
                        </Box>
                        <Box as="tr">
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            w="200px"
                            align="left"
                            color="#666"
                          >
                            Warp Bundle:
                          </Box>
                          <Box
                            as="td"
                            px={4}
                            py={2}
                            sx={{ wordBreak: "break-all" }}
                          >
                            {isNil(tx_info.warp) ? (
                              "-"
                            ) : (
                              <Link
                                href={`https://sonar.warp.cc/#/app/interaction/${tx_info.warp}?network=mainnet`}
                                target="_blank"
                              >
                                <Box color="#763AAC">{tx_info.warp}</Box>
                              </Link>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </>
          )}
          <Footer />
        </Box>
      </Flex>
    </>
  )
}
