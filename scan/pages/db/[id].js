import { Flex, Box, Icon, Text, Button, Badge } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { HB } from "wao"
import { map, reverse } from "ramda"
import Link from "next/link"
import Header from "../../components/Header"
import Main from "../../components/Main"
import {
  FiChevronRight,
  FiDatabase,
  FiBox,
  FiActivity,
  FiClock,
  FiHash,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi"

const limit = 10

export default function DatabasePage() {
  const router = useRouter()
  const [txs, setTxs] = useState([])
  const [wal_url, setWalUrl] = useState("http://localhost:10000")
  const [tx_from, setTxFrom] = useState(null)
  const [block_from, setBlockFrom] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState({ blocks: false, txs: false })

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
          await getTxs()
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
        <Box py={6}>
          {/* Breadcrumb Navigation */}
          <Flex align="center" mb={6} fontSize="13px" color="gray.600" px={2}>
            <Link href="/">
              <Text
                color="#6366f1"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                Nodes
              </Text>
            </Link>
            <Icon as={FiChevronRight} mx={2} />
            <Link href={`/node?url=${router.query.url}`}>
              <Text
                color="#6366f1"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                fontFamily="mono"
              >
                {router.query.url}
              </Text>
            </Link>
            <Icon as={FiChevronRight} mx={2} />
            <Text fontFamily="mono" color="gray.800" fontWeight="500">
              {router.query.id}
            </Text>
          </Flex>

          {/* Database Header */}
          <Box
            bg="white"
            border="1px solid #e2e8f0"
            borderRadius="8px"
            p={6}
            mb={6}
          >
            <Flex align="center" justify="space-between">
              <Flex align="center">
                <Box
                  p={3}
                  bg="linear-gradient(135deg, #6366f1, #8b5cf6)"
                  borderRadius="10px"
                  mr={4}
                >
                  <Icon as={FiDatabase} color="white" size="20" />
                </Box>
                <Box>
                  <Text fontSize="20px" fontWeight="600" color="gray.800">
                    Database: {router.query.id}
                  </Text>
                  <Text fontSize="13px" color="gray.500" fontFamily="mono">
                    {router.query.url}
                  </Text>
                </Box>
              </Flex>
              <Badge
                bg="#10b98120"
                color="#10b981"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="11px"
              >
                ACTIVE
              </Badge>
            </Flex>
          </Box>

          {/* Stats Overview */}
          <Flex gap={4} mb={6} wrap="wrap">
            <Box
              bg="white"
              border="1px solid #e2e8f0"
              borderRadius="8px"
              p={4}
              flex={1}
              minW="150px"
            >
              <Flex align="center" mb={2}>
                <Box p={2} bg="#6366f120" borderRadius="6px">
                  <Icon as={FiBox} color="#6366f1" size="14" />
                </Box>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="gray.800">
                {blocks.length}
              </Text>
              <Text fontSize="12px" color="gray.600">
                Total Blocks
              </Text>
            </Box>

            <Box
              bg="white"
              border="1px solid #e2e8f0"
              borderRadius="8px"
              p={4}
              flex={1}
              minW="150px"
            >
              <Flex align="center" mb={2}>
                <Box p={2} bg="#8b5cf620" borderRadius="6px">
                  <Icon as={FiActivity} color="#8b5cf6" size="14" />
                </Box>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="gray.800">
                {txs.length}
              </Text>
              <Text fontSize="12px" color="gray.600">
                Total Transactions
              </Text>
            </Box>

            <Box
              bg="white"
              border="1px solid #e2e8f0"
              borderRadius="8px"
              p={4}
              flex={1}
              minW="150px"
            >
              <Flex align="center" mb={2}>
                <Box p={2} bg="#10b98120" borderRadius="6px">
                  <Icon as={FiClock} color="#10b981" size="14" />
                </Box>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="gray.800">
                {blocks.length > 0 && blocks[0]?.cursor
                  ? blocks[0].cursor
                  : "N/A"}
              </Text>
              <Text fontSize="12px" color="gray.600">
                Latest Block (HyperBEAM WAL)
              </Text>
            </Box>
          </Flex>

          {/* Main Content Grid */}
          <Flex gap={6} direction={{ base: "column", lg: "row" }}>
            {/* Blocks Section */}
            <Box flex={1}>
              <Box
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                overflow="hidden"
              >
                <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                  <Flex align="center" justify="space-between">
                    <Flex align="center">
                      <Icon as={FiBox} mr={2} color="#6366f1" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Latest Blocks ( HyperBEAM )
                      </Text>
                    </Flex>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => getBlocks(wal_url)}
                      loadingText="Loading"
                    >
                      <Icon as={FiRefreshCw} size="14" />
                    </Button>
                  </Flex>
                </Box>

                <Box
                  bg="#fafbfc"
                  px={4}
                  py={3}
                  borderBottom="1px solid #e2e8f0"
                >
                  <Flex fontSize="11px" fontWeight="600" color="gray.600">
                    <Box w="80px">BLOCK</Box>
                    <Box flex="1">MESSAGE ID</Box>
                  </Flex>
                </Box>

                {blocks.map((v, idx) => (
                  <Link
                    key={`block-${v.cursor}-${idx}`}
                    href={`/db/${router.query.id}/block/${v.cursor}?url=${router.query.url}`}
                  >
                    <Box
                      px={4}
                      py={3}
                      borderBottom={
                        idx < blocks.length - 1 ? "1px solid #e2e8f0" : "none"
                      }
                      _hover={{ bg: "#f7fafc" }}
                      transition="background 0.2s"
                      cursor="pointer"
                    >
                      <Flex align="center" fontSize="13px">
                        <Box w="80px">
                          <Text
                            fontFamily="mono"
                            fontWeight="500"
                            color="#6366f1"
                          >
                            {v.cursor}
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text
                            fontFamily="mono"
                            color="gray.600"
                            fontSize="12px"
                          >
                            {v.node?.message?.Id || "N/A"}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  </Link>
                ))}

                {!block_from ? null : (
                  <Box
                    px={4}
                    py={3}
                    borderTop="1px solid #e2e8f0"
                    bg="#f7fafc"
                    textAlign="center"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => getBlocks(wal_url)}
                      borderColor="#6366f1"
                      color="#6366f1"
                      _hover={{ bg: "#6366f120" }}
                    >
                      Load More Blocks
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Transactions Section */}
            <Box flex={1}>
              <Box
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                overflow="hidden"
              >
                <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                  <Flex align="center" justify="space-between">
                    <Flex align="center">
                      <Icon as={FiActivity} mr={2} color="#8b5cf6" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Latest Transactions ( Rollup )
                      </Text>
                    </Flex>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => getTxs()}
                      loadingText="Loading"
                    >
                      <Icon as={FiRefreshCw} size="14" />
                    </Button>
                  </Flex>
                </Box>

                <Box
                  bg="#fafbfc"
                  px={4}
                  py={3}
                  borderBottom="1px solid #e2e8f0"
                >
                  <Flex fontSize="11px" fontWeight="600" color="gray.600">
                    <Box w="60px">HEIGHT</Box>
                    <Box flex="1">MESSAGE ID</Box>
                  </Flex>
                </Box>

                {txs.map((v, idx) => (
                  <Link
                    key={`tx-${v.value.i}-${idx}`}
                    href={`/db/${router.query.id}/tx/${v.value.i}?url=${router.query.url}`}
                  >
                    <Box
                      px={4}
                      py={3}
                      borderBottom={
                        idx < txs.length - 1 ? "1px solid #e2e8f0" : "none"
                      }
                      _hover={{ bg: "#f7fafc" }}
                      transition="background 0.2s"
                      cursor="pointer"
                    >
                      <Flex align="center" fontSize="13px">
                        <Box w="60px">
                          <Text
                            fontFamily="mono"
                            fontWeight="500"
                            color="#8b5cf6"
                          >
                            {v.value.i}
                          </Text>
                        </Box>
                        <Box flex="1">
                          <Text
                            fontFamily="mono"
                            color="gray.600"
                            fontSize="12px"
                          >
                            {v.value.hashpath
                              ? v.value.hashpath.split("/")[1] || "N/A"
                              : "N/A"}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  </Link>
                ))}

                {!tx_from ? null : (
                  <Box
                    px={4}
                    py={3}
                    borderTop="1px solid #e2e8f0"
                    bg="#f7fafc"
                    textAlign="center"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => getTxs()}
                      borderColor="#8b5cf6"
                      color="#8b5cf6"
                      _hover={{ bg: "#8b5cf620" }}
                    >
                      Load More Transactions
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Flex>
        </Box>
      </Main>
    </>
  )
}
