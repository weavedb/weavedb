import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import DB from "weavedb-client"
import { Box, Flex, Image } from "@chakra-ui/react"
import { concat, last, isNil, map, prop, includes, indexBy } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Header from "components/Header"
import Footer from "components/Footer"
import { nodes } from "lib/nodes"
dayjs.extend(relativeTime)
let db = null
let to = null
export default function Home() {
  const router = useRouter()
  const [info, setInfo] = useState(null)
  const [node, setNode] = useState(null)
  const [err, setErr] = useState(null)
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
                Node Info
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
                    <Box sx={{ fontSize: "14px" }}>{node.endpoint}</Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>DB Instances</Box>
                    <Box sx={{ fontSize: "14px" }}>
                      <Box color={err ? "crimson" : ""}>
                        {err
                          ? "The Node is Offline"
                          : isNil(info)
                          ? "-"
                          : info.dbs.length}
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    mx={4}
                    py={2}
                    sx={{ borderRight: "1px solid #ddd" }}
                  ></Box>
                  <Box flex={1}>
                    <Box sx={{ color: "#999" }}>Rollup Network</Box>
                    <Box sx={{ fontSize: "14px" }}>{node.network}</Box>
                  </Box>
                </Flex>
              </Box>
            </>
          )}
          {isNil(info) ? null : (
            <>
              <Box px={2} mb={2} fontWeight="bold" color="#666" fontSize="16px">
                DB Instances
              </Box>
              {map(v => {
                const db = v.data
                return (
                  <Link href={`/node/${router.query.id}/db/${v.id}`}>
                    <Box
                      w="100%"
                      bg="white"
                      py={2}
                      px={6}
                      sx={{ borderRadius: "10px", ":hover": { opacity: 0.75 } }}
                      mb={4}
                    >
                      <Flex>
                        <Box flex={1}>
                          <Box sx={{ color: "#999" }}>DB Instance</Box>
                          <Box sx={{ fontSize: "14px" }}>
                            <Box>{v.data.name}</Box>
                          </Box>
                        </Box>
                        <Box
                          mx={4}
                          py={2}
                          sx={{ borderRight: "1px solid #ddd" }}
                        ></Box>
                        <Box flex={1}>
                          <Box sx={{ color: "#999" }}>Warp Contract Tx ID</Box>
                          <Box sx={{ fontSize: "14px" }}>
                            <Box>{db.contractTxId ?? "None"}</Box>
                          </Box>
                        </Box>
                        <Box
                          mx={4}
                          py={2}
                          sx={{ borderRight: "1px solid #ddd" }}
                        ></Box>
                        <Box flex={1}>
                          <Box sx={{ color: "#999" }}>DApp URL</Box>
                          <Box sx={{ fontSize: "14px" }}>
                            {db.app?.replace(/^http(s)+\:\/\//, "")}
                          </Box>
                        </Box>
                      </Flex>
                    </Box>
                  </Link>
                )
              })(info.dbs)}
            </>
          )}
          <Footer />
        </Box>
      </Flex>
    </>
  )
}
