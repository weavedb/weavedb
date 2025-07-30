import { Flex, Box, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { HB } from "wao"
import { map } from "ramda"
import Link from "next/link"
import Header from "../../components/Header"
import Main from "../../components/Main"
import { FaAngleRight } from "react-icons/fa6"

export default function Home() {
  const router = useRouter()
  const [txs, setTxs] = useState([])
  useEffect(() => {
    void (async () => {
      if (router.query.id && router.query.url) {
        const hb = new HB({ url: router.query.url })
        const { body } = await hb.get({
          path: `/wal/${router.query.id}?order=desc&limit=10`,
        })
        const { wal } = JSON.parse(body)
        setTxs(wal)
      }
    })()
  }, [router])
  return (
    <>
      <Header />
      <Main>
        <Flex justify="center" fontSize="14px">
          <Box w="100%">
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
                <Box>{router.query.id}</Box>
              </Link>
            </Flex>
            <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
              Transactions
            </Box>
            {map(v => (
              <Link
                href={`/db/${router.query.id}/tx/${v.value.i}?url=${router.query.url}`}
              >
                <Flex
                  px={2}
                  bg="white"
                  my={4}
                  w="100%"
                  css={{
                    cursor: "pointer",
                    _hover: { opacity: 0.75 },
                    borderRadius: "5px",
                  }}
                >
                  <Box p={2}>{v.value.i}</Box>
                  <Box p={2}>{v.value.hashpath}</Box>
                  <Box flex={1} />
                </Flex>
              </Link>
            ))(txs)}
          </Box>
        </Flex>
      </Main>
    </>
  )
}
