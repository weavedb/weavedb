import { Flex, Box, Icon, Text, Button, Badge } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { toAddr, parseSignatureInput } from "wao/utils"
import { map, keys, includes } from "ramda"
import Link from "next/link"
import Header from "../../../../components/Header"
import Main from "../../../../components/Main"
import { useRouter } from "next/router"
import {
  FiChevronRight,
  FiDatabase,
  FiActivity,
  FiHash,
  FiClock,
  FiCopy,
  FiCode,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
} from "react-icons/fi"

export default function TransactionPage() {
  const router = useRouter()
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openPaths, setOpenPaths] = useState({})

  useEffect(() => {
    const loadTransactionData = async () => {
      if (router.query.slot && router.query.url) {
        try {
          setLoading(true)
          const hb = new HB({ url: router.query.url })
          const { body } = await hb.get({
            path: `/wal/${router.query.id}?start=${router.query.slot}&limit=1`,
          })
          const { wal } = JSON.parse(body)
          setTx(wal[0]?.value ?? null)
          setLoading(false)
        } catch (e) {
          console.log(e)
          setError("Failed to load transaction data")
          setLoading(false)
        }
      }
    }
    loadTransactionData()
  }, [router])

  const copyToClipboard = text => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  const togglePath = pathKey => {
    setOpenPaths(prevState => ({
      ...prevState,
      [pathKey]: !prevState[pathKey],
    }))
  }
  let dir, signer, op, signed_fields, algorithm
  if (tx) {
    try {
      console.log(tx.opt?.headers)
      const query = JSON.parse(tx.opt?.headers?.query)
      const si = tx.opt?.headers?.["signature-input"]
      const { label, fields, keyid, alg } = parseSignatureInput(si)
      signed_fields = fields
      algorithm = alg
      signer = toAddr(keyid)
      op = query[0]
      const [opcode, oprand] = op.split(":")
      dir = null
      if (includes(opcode, ["del"])) {
        dir = query[1]
      } else {
        dir = query[2]
      }
    } catch (e) {}
  }
  return (
    <>
      <Header />
      <Main>
        <Box py={6}>
          {/* Breadcrumb Navigation */}
          <Flex
            align="center"
            mb={6}
            fontSize="13px"
            color="gray.600"
            px={2}
            wrap="wrap"
          >
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
            <Link href={`/db/${router.query.id}?url=${router.query.url}`}>
              <Text
                color="#6366f1"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                fontFamily="mono"
              >
                {router.query.id}
              </Text>
            </Link>
            <Icon as={FiChevronRight} mx={2} />
            <Text fontFamily="mono" color="gray.800" fontWeight="500">
              Transaction {router.query.slot}
            </Text>
          </Flex>

          {/* Transaction Header */}
          <Box
            bg="white"
            border="1px solid #e2e8f0"
            borderRadius="8px"
            p={6}
            mb={6}
          >
            <Flex align="center" justify="space-between" mb={4}>
              <Flex align="center">
                <Box
                  p={3}
                  bg="linear-gradient(135deg, #8b5cf6, #a855f7)"
                  borderRadius="10px"
                  mr={4}
                >
                  <Icon as={FiActivity} color="white" size="20" />
                </Box>
                <Box>
                  <Text fontSize="20px" fontWeight="600" color="gray.800">
                    Transaction #{router.query.slot}
                  </Text>
                  <Text fontSize="13px" color="gray.500" fontFamily="mono">
                    Database: {router.query.id}
                  </Text>
                </Box>
              </Flex>
              <Badge
                bg="#8b5cf620"
                color="#8b5cf6"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="11px"
              >
                TRANSACTION
              </Badge>
            </Flex>

            {tx && (
              <Box>
                <Text fontSize="13px" fontWeight="600" color="gray.700" mb={2}>
                  Hash Path
                </Text>
                <Flex
                  align="center"
                  bg="#f7fafc"
                  border="1px solid #e2e8f0"
                  borderRadius="6px"
                  p={3}
                  mb={4}
                >
                  <Icon as={FiHash} color="#8b5cf6" size="16" mr={3} />
                  <Text
                    fontFamily="mono"
                    fontSize="13px"
                    color="gray.800"
                    flex={1}
                    wordBreak="break-all"
                  >
                    {tx.hashpath}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(tx.hashpath)}
                    _hover={{ bg: "#8b5cf620" }}
                  >
                    <Icon as={FiCopy} size="14" />
                  </Button>
                </Flex>

                <Flex gap={6} fontSize="13px" wrap="wrap">
                  <Flex align="center">
                    <FiClock size="14" color="#6b7280" />
                    <Text color="gray.600" ml={2}>
                      Transaction ID:{" "}
                      <Text as="span" fontWeight="500" fontFamily="mono">
                        {tx.i}
                      </Text>
                    </Text>
                  </Flex>
                  <Flex align="center">
                    <FiDatabase size="14" color="#6b7280" />
                    <Text color="gray.600" ml={2}>
                      Status:{" "}
                      <Text as="span" fontWeight="500" color="#10b981">
                        Confirmed
                      </Text>
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            )}
          </Box>

          {loading ? (
            <Box textAlign="center" py={12}>
              <Box
                w="40px"
                h="40px"
                border="3px solid #e2e8f0"
                borderTop="3px solid #8b5cf6"
                borderRadius="50%"
                mx="auto"
                mb={4}
                css={{
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Text fontSize="14px" color="gray.600">
                Loading transaction data...
              </Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={12}>
              <Box
                p={3}
                bg="#fee2e2"
                borderRadius="10px"
                display="inline-block"
                mb={4}
              >
                <Icon as={FiActivity} color="#dc2626" size="20" />
              </Box>
              <Text fontSize="14px" color="#dc2626" fontWeight="500" mb={2}>
                Failed to Load Transaction
              </Text>
              <Text fontSize="12px" color="gray.600">
                {error}
              </Text>
            </Box>
          ) : !tx ? (
            <Box textAlign="center" py={12}>
              <Box
                p={3}
                bg="#f3f4f6"
                borderRadius="10px"
                display="inline-block"
                mb={4}
              >
                <Icon as={FiActivity} color="#6b7280" size="20" />
              </Box>
              <Text fontSize="14px" color="gray.600" fontWeight="500" mb={2}>
                Transaction Not Found
              </Text>
              <Text fontSize="12px" color="gray.500">
                The requested transaction could not be found.
              </Text>
            </Box>
          ) : (
            <Flex gap={6} direction={{ base: "column", lg: "row" }}>
              {/* Left Column - Metadata and Headers */}
              <Box flex={1}>
                {/* Metadata Section */}
                <Box
                  bg="white"
                  border="1px solid #e2e8f0"
                  borderRadius="8px"
                  mb={6}
                >
                  <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                    <Flex align="center">
                      <Icon as={FiDatabase} mr={2} color="#6366f1" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Metadata
                      </Text>
                    </Flex>
                  </Box>
                  <Box p={4}>
                    <Flex direction="column" gap={3}>
                      {/* Query Type */}
                      <Flex align="center" justify="space-between">
                        <Text fontSize="13px" color="gray.500">
                          Query Type
                        </Text>
                        <Badge
                          bg="#6366f1"
                          color="white"
                          px={2}
                          py={1}
                          borderRadius="3px"
                          fontSize="11px"
                          fontFamily="mono"
                          fontWeight="600"
                        >
                          {op || "Unknown"}
                        </Badge>
                      </Flex>

                      {/* Dir */}
                      <Flex align="center" justify="space-between">
                        <Text fontSize="13px" color="gray.500">
                          Dir
                        </Text>
                        <Text
                          fontSize="13px"
                          fontFamily="mono"
                          color="gray.800"
                        >
                          {dir || "—"}
                        </Text>
                      </Flex>

                      {/* Signer */}
                      <Flex align="center" justify="space-between">
                        <Text fontSize="13px" color="gray.500">
                          Signer
                        </Text>
                        <Text
                          fontSize="12px"
                          fontFamily="mono"
                          color="gray.800"
                          wordBreak="break-all"
                        >
                          {signer || "—"}
                        </Text>
                      </Flex>

                      {/* Algorithm */}
                      <Flex align="center" justify="space-between">
                        <Text fontSize="13px" color="gray.500">
                          Algorithm
                        </Text>
                        <Text
                          fontSize="13px"
                          fontFamily="mono"
                          color="gray.800"
                        >
                          {algorithm || "—"}
                        </Text>
                      </Flex>

                      {/* Signed Fields */}
                      <Flex align="center" justify="space-between">
                        <Text fontSize="13px" color="gray.500">
                          Fields
                        </Text>
                        <Text
                          fontSize="12px"
                          fontFamily="mono"
                          color="gray.800"
                          maxW="200px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {signed_fields ? signed_fields.join(", ") : "—"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                </Box>

                {/* Headers Section */}
                <Box bg="white" border="1px solid #e2e8f0" borderRadius="8px">
                  <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                    <Flex align="center">
                      <Icon as={FiFileText} mr={2} color="#6366f1" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Headers
                      </Text>
                      {tx.opt?.headers && (
                        <Badge
                          ml={2}
                          bg="#6366f120"
                          color="#6366f1"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="10px"
                        >
                          {keys(tx.opt.headers).length} fields
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                  <Box p={4}>
                    {tx.opt?.headers ? (
                      keys(tx.opt.headers)
                        .sort()
                        .map(key => {
                          const value = tx.opt.headers[key]
                          return (
                            <Box key={key} mb={4}>
                              <Text
                                fontSize="13px"
                                fontWeight="600"
                                color="gray.700"
                                mb={2}
                              >
                                {key}
                              </Text>
                              <Box
                                bg="#f7fafc"
                                border="1px solid #e2e8f0"
                                borderRadius="6px"
                                p={3}
                                fontFamily="mono"
                                fontSize="12px"
                                color="gray.800"
                                css={{
                                  overflow: "visible !important",
                                  maxHeight: "none !important",
                                  height: "auto !important",
                                }}
                              >
                                <Text
                                  whiteSpace="pre-wrap"
                                  wordBreak="break-all"
                                >
                                  {value}
                                </Text>
                              </Box>
                            </Box>
                          )
                        })
                    ) : (
                      <Text
                        fontSize="13px"
                        color="gray.500"
                        textAlign="center"
                        py={4}
                      >
                        No header data available
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Right Column - Updated Paths */}
              <Box flex={1}>
                <Box bg="white" border="1px solid #e2e8f0" borderRadius="8px">
                  <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                    <Flex align="center">
                      <Icon as={FiCode} mr={2} color="#8b5cf6" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Updated Paths
                      </Text>
                      {tx.cl && (
                        <Badge
                          ml={2}
                          bg="#8b5cf620"
                          color="#8b5cf6"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="10px"
                        >
                          {keys(tx.cl).length} paths
                        </Badge>
                      )}
                    </Flex>
                  </Box>
                  <Box p={4}>
                    {tx.cl ? (
                      keys(tx.cl)
                        .sort()
                        .map(pathKey => {
                          const pathValue = tx.cl[pathKey]
                          const jsonData = JSON.stringify(pathValue, null, 2)
                          const isOpen = openPaths[pathKey] || false

                          return (
                            <Box key={pathKey} mb={4}>
                              <Flex
                                align="center"
                                justify="space-between"
                                cursor="pointer"
                                onClick={() => togglePath(pathKey)}
                                _hover={{ bg: "#f7fafc" }}
                                p={2}
                                borderRadius="4px"
                                transition="background 0.2s"
                              >
                                <Text
                                  fontSize="13px"
                                  fontWeight="600"
                                  color="gray.700"
                                >
                                  {pathKey}
                                </Text>
                                <Icon
                                  as={isOpen ? FiChevronUp : FiChevronDown}
                                  color="gray.400"
                                  size="16"
                                />
                              </Flex>
                              {isOpen && (
                                <Box
                                  bg="#f7fafc"
                                  border="1px solid #e2e8f0"
                                  borderRadius="6px"
                                  p={3}
                                  mt={2}
                                  fontFamily="mono"
                                  fontSize="12px"
                                  color="gray.800"
                                  css={{
                                    overflow: "visible !important",
                                    maxHeight: "none !important",
                                    height: "auto !important",
                                  }}
                                >
                                  <Text
                                    whiteSpace="pre-wrap"
                                    wordBreak="break-all"
                                  >
                                    {jsonData}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          )
                        })
                    ) : (
                      <Text
                        fontSize="13px"
                        color="gray.500"
                        textAlign="center"
                        py={4}
                      >
                        No path updates available
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>
            </Flex>
          )}
        </Box>
      </Main>
    </>
  )
}
