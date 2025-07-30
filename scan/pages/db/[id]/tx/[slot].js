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
        const hb = new HB({ url: router.query.url })
        const { body } = await hb.get({
          path: `/wal/${router.query.id}?start=${router.query.slot}&limit=1`,
        })
        const { wal } = JSON.parse(body)
        setTx(wal[0]?.value ?? null)
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
              <Link
                href={`/db/${router.query.id}/${router.query.slot}?url=${router.query.url}`}
              >
                <Box>{router.query.slot}</Box>
              </Link>
            </Flex>
            {!tx ? null : (
              <>
                <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
                  Hashpath
                </Box>
                <Flex
                  mb={4}
                  px={2}
                  bg="white"
                  w="100%"
                  css={{
                    cursor: "pointer",
                    _hover: { opacity: 0.75 },
                    borderRadius: "5px",
                  }}
                >
                  <Box p={2}>{tx.hashpath}</Box>
                </Flex>
                <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
                  Headers
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
                    {map(v => (
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
                          {tx.opt.headers[v]}
                        </Box>
                      </>
                    ))(keys(tx.opt.headers).sort())}
                  </Box>
                </Flex>
                <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
                  Updated Paths
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
                    {map(v => (
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
                          {JSON.stringify(tx.cl[v])}
                        </Box>
                      </>
                    ))(keys(tx.cl).sort())}
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
