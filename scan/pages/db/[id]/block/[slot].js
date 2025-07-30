import { Flex, Box, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { map, keys } from "ramda"
import Link from "next/link"
import Header from "../../../../components/Header"
import Main from "../../../../components/Main"
import { useRouter } from "next/router"
import { FaAngleRight } from "react-icons/fa6"

export default function Home() {
  const router = useRouter()
  const [tx, setTx] = useState(null)
  useEffect(() => {
    void (async () => {
      if (router.query.slot && router.query.url) {
        const hb = new HB({ url: "http://localhost:10000" })
        const { edges } = await hb.messages({
          pid: router.query.id,
          from: router.query.slot,
          to: router.query.slot,
        })
        setTx(edges[0] ?? null)
      }
    })()
  }, [router])
  return (
    <>
      <Header />
      <Main>
        <Flex justify="center" fontSize="14px">
          <Box w="100%" pb={2}>
            <Flex mt={4} mx={2} align="center">
              <Link href={`/`}>
                <Box css={{ textDecoration: "underline" }}>Nodes</Box>
              </Link>
              <Icon as={FaAngleRight} mx={2} />
              <Link href={`/node?url=${router.query.url}`}>
                <Box css={{ textDecoration: "underline" }}>
                  {router.query.url}
                </Box>
              </Link>
              <Icon as={FaAngleRight} mx={2} />
              <Link href={`/db/${router.query.id}?url=${router.query.url}`}>
                <Box css={{ textDecoration: "underline" }}>
                  {router.query.id}
                </Box>
              </Link>
              <Icon as={FaAngleRight} mx={2} />
              <Box>{router.query.slot}</Box>
            </Flex>
            {!tx ? null : (
              <>
                <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
                  Assignment
                </Box>
                <Flex
                  px={2}
                  bg="white"
                  mb={4}
                  w="100%"
                  css={{
                    cursor: "pointer",
                    _hover: { opacity: 0.75 },
                    borderRadius: "5px",
                  }}
                >
                  <Box fontSize="12px" px={2} pb={2} w="100%">
                    {map(v => {
                      const v2 = tx.node.assignment[v]
                      const val =
                        typeof v2 === "object" ? JSON.stringify(v2) : v2
                      return val === "" ? null : (
                        <>
                          <Box mt={4}>{v}</Box>
                          <Box
                            w="100%"
                            bg="#eee"
                            fontSize="12px"
                            as="pre"
                            p={2}
                            my={2}
                            css={{ whiteSpace: "wrap", wordBreak: "break-all" }}
                          >
                            {val}
                          </Box>
                        </>
                      )
                    })(keys(tx.node.assignment).sort())}
                  </Box>
                </Flex>
                <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
                  Message
                </Box>
                <Flex
                  px={2}
                  bg="white"
                  mb={4}
                  w="100%"
                  css={{
                    cursor: "pointer",
                    _hover: { opacity: 0.75 },
                    borderRadius: "5px",
                  }}
                >
                  <Box fontSize="12px" px={2} pb={2} w="100%">
                    {map(v => {
                      const v2 = tx.node.message[v]
                      let val = typeof v2 === "object" ? JSON.stringify(v2) : v2
                      if (v === "Data") {
                        try {
                          val = map(v => (
                            <Link
                              href={`/db/${router.query.id}/tx/${v.slot}?url=${router.query.url}`}
                            >
                              <Box my={1}>{v.hashpath}</Box>
                            </Link>
                          ))(JSON.parse(v2))
                        } catch (e) {
                          val = v2
                        }
                      }
                      return val === "" ? null : (
                        <>
                          <Box mt={4}>{v}</Box>
                          <Box
                            w="100%"
                            bg="#eee"
                            fontSize="12px"
                            as="pre"
                            p={2}
                            my={2}
                            css={{ whiteSpace: "wrap", wordBreak: "break-all" }}
                          >
                            {val}
                          </Box>
                        </>
                      )
                    })(keys(tx.node.message).sort())}
                  </Box>
                </Flex>
              </>
            )}
          </Box>
        </Flex>
      </Main>
    </>
  )
}
