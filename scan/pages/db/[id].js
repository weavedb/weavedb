import { Flex, Box, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { HB } from "wao"
import { map, reverse } from "ramda"
import Link from "next/link"
import Header from "../../components/Header"
import Main from "../../components/Main"
import { FaAngleRight } from "react-icons/fa6"
const limit = 10

export default function Home() {
  const router = useRouter()
  const [txs, setTxs] = useState([])
  const [wal_url, setWalUrl] = useState("http://localhost:10000")
  const [tx_from, setTxFrom] = useState(null)
  const [block_from, setBlockFrom] = useState(null)
  const [blocks, setBlocks] = useState([])
  const getTxs = async () => {
    const hb = new HB({ url: router.query.url })
    let path = `/wal/${router.query.id}?order=desc&limit=${limit}`
    if (tx_from) path += `&start=${tx_from - 1}`
    const { body } = await hb.get({ path })
    const { wal } = JSON.parse(body)
    setTxs([...txs, ...wal])
    console.log(wal)
    if (wal[0]) setTxFrom(wal[wal.length - 1].value.i)
  }

  const getBlocks = async url => {
    const hb2 = new HB({ url })
    let from = 0
    let to = 0
    if (block_from) {
      to = block_from - 1
    } else {
      try {
        const { current } = await hb2.slot({ pid: router.query.id })
        to = current
      } catch (e) {
        try {
          const now = await hb2.now({ pid: router.query.id })
          to = now?.["at-slot"] ?? 0
        } catch (e) {
          to = 9
        }
      }
    }
    from = Math.max(0, to - limit + 1)
    const { edges } = await hb2.messages({ pid: router.query.id, from, to })
    setBlocks([...blocks, ...reverse(edges)])
    if (edges[0]) setBlockFrom(edges[0].cursor)
  }

  useEffect(() => {
    void (async () => {
      if (router.query.id && router.query.url) {
        try {
          const status = await fetch(`${router.query.url}/status`).then(r =>
            r.json(),
          )
          const url =
            router.query.url === "https://db-demo.wdb.ae:10003"
              ? "https://hb-demo.wdb.ae:10002"
              : (status["wal-url"] ?? "http://localhost:10000")
          setWalUrl(url)
          await getTxs(url)
          await getBlocks(url)
        } catch (e) {
          console.log(e)
        }
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
              <Box>{router.query.id}</Box>
            </Flex>
            <Flex>
              <Box flex={1} pr={4}>
                <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
                  Blocks
                </Box>
                {map(v => (
                  <Link
                    href={`/db/${router.query.id}/block/${v.cursor}?url=${router.query.url}`}
                  >
                    <Flex
                      px={2}
                      bg="white"
                      my={4}
                      w="100%"
                      fontSize="11px"
                      css={{
                        cursor: "pointer",
                        _hover: { opacity: 0.75 },
                        borderRadius: "5px",
                      }}
                    >
                      <Box p={2}>{v.cursor}</Box>
                      <Box p={2}>{v.node.message.Id}</Box>
                      <Box flex={1} />
                    </Flex>
                  </Link>
                ))(blocks)}
                {!block_from ? null : (
                  <Flex
                    px={2}
                    bg="white"
                    my={4}
                    w="100%"
                    fontSize="11px"
                    css={{
                      cursor: "pointer",
                      _hover: { opacity: 0.75 },
                      borderRadius: "5px",
                    }}
                    justify="center"
                    onClick={async () => await getBlocks(wal_url)}
                  >
                    <Flex p={2} justify="center" w="100%">
                      Load More
                    </Flex>
                    <Box flex={1} />
                  </Flex>
                )}
              </Box>
              <Box flex={1} pl={4}>
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
                      fontSize="11px"
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
                {!tx_from ? null : (
                  <Flex
                    px={2}
                    bg="white"
                    my={4}
                    w="100%"
                    fontSize="11px"
                    css={{
                      cursor: "pointer",
                      _hover: { opacity: 0.75 },
                      borderRadius: "5px",
                    }}
                    justify="center"
                    onClick={async () => await getTxs(wal_url)}
                  >
                    <Flex p={2} justify="center" w="100%">
                      Load More
                    </Flex>
                    <Box flex={1} />
                  </Flex>
                )}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Main>
    </>
  )
}
