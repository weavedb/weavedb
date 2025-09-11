import { Flex, Box, Icon, Text, Button, Badge } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { map, keys } from "ramda"
import Link from "next/link"
import Header from "../../../../components/Header"
import Main from "../../../../components/Main"
import { useRouter } from "next/router"
import {
  FiChevronRight,
  FiDatabase,
  FiBox,
  FiActivity,
  FiClock,
  FiHash,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi"

export default function FixedBlockPage() {
  const router = useRouter()
  const [blockData, setBlockData] = useState(null)
  const [walUrl, setWalUrl] = useState("http://localhost:10000")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (router.query.slot && router.query.url) {
        try {
          setLoading(true)
          const status = await fetch(`${router.query.url}/status`).then(r =>
            r.json(),
          )
          const url =
            router.query.url === "https://db-demo.wdb.ae:10003"
              ? "https://hb-demo.wdb.ae:10002"
              : (status["wal-url"] ?? "http://localhost:10000")
          setWalUrl(url)
          const hb = new HB({ url })
          const { edges } = await hb.messages({
            pid: router.query.id,
            from: router.query.slot,
            to: router.query.slot,
          })
          setBlockData(edges[0] ?? null)
          setLoading(false)
        } catch (e) {
          console.log(e)
          setError("Failed to load block data")
          setLoading(false)
        }
      }
    }
    loadData()
  }, [router])

  const displayValue = (key, value) => {
    // Special handling for Tags field
    if (key === "Tags") {
      let tagsList = value

      if (typeof value === "string") {
        try {
          tagsList = JSON.parse(value)
        } catch (e) {
          return (
            <Text fontFamily="mono" fontSize="12px" color="gray.700">
              {value}
            </Text>
          )
        }
      }

      if (Array.isArray(tagsList)) {
        return (
          <Box>
            {tagsList.map((tag, idx) => (
              <Flex
                key={idx}
                align="center"
                py={1}
                px={2}
                mb={1}
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="4px"
                fontSize="12px"
                _hover={{ borderColor: "#6366f1" }}
                transition="border-color 0.2s"
              >
                <Text
                  fontWeight="600"
                  color="#6366f1"
                  minW="100px"
                  fontSize="11px"
                  textTransform="uppercase"
                  letterSpacing="0.3px"
                >
                  {tag.name}:
                </Text>
                <Text
                  fontFamily="mono"
                  color="gray.700"
                  fontSize="11px"
                  flex={1}
                  ml={2}
                  css={{
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                  }}
                >
                  {tag.value}
                </Text>
              </Flex>
            ))}
          </Box>
        )
      }
    }

    // Regular display for other fields
    const displayText =
      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)
    return (
      <Text
        fontFamily="mono"
        fontSize="12px"
        color="gray.700"
        css={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          overflowWrap: "break-word",
        }}
      >
        {displayText}
      </Text>
    )
  }

  return (
    <>
      <Header />
      <Main>
        <Box py={6}>
          {/* Breadcrumb */}
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
              Block {router.query.slot}
            </Text>
          </Flex>

          {/* Block Header */}
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
                  bg="linear-gradient(135deg, #6366f1, #8b5cf6)"
                  borderRadius="10px"
                  mr={4}
                >
                  <Icon as={FiBox} color="white" size="20" />
                </Box>
                <Box>
                  <Text fontSize="20px" fontWeight="600" color="gray.800">
                    Block #{router.query.slot}
                  </Text>
                  <Text fontSize="13px" color="gray.500" fontFamily="mono">
                    Database: {router.query.id}
                  </Text>
                </Box>
              </Flex>
              <Badge
                bg="#6366f120"
                color="#6366f1"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="11px"
              >
                BLOCK DATA
              </Badge>
            </Flex>

            {blockData && (
              <Flex gap={6} fontSize="13px" wrap="wrap">
                <Flex align="center">
                  <FiHash size="14" color="#6b7280" />
                  <Text color="gray.600" ml={2}>
                    Message ID:{" "}
                    <Text as="span" fontWeight="500" fontFamily="mono">
                      {blockData.node?.message?.Id || "N/A"}
                    </Text>
                  </Text>
                </Flex>
                <Flex align="center">
                  <FiClock size="14" color="#6b7280" />
                  <Text color="gray.600" ml={2}>
                    Timestamp:{" "}
                    <Text as="span" fontWeight="500">
                      {blockData.node?.message?.Timestamp || "N/A"}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            )}
          </Box>

          {loading ? (
            <Box textAlign="center" py={12}>
              <Box
                w="40px"
                h="40px"
                border="3px solid #e2e8f0"
                borderTop="3px solid #6366f1"
                borderRadius="50%"
                mx="auto"
                mb={4}
                css={{ animation: "spin 1s linear infinite" }}
              />
              <Text fontSize="14px" color="gray.600">
                Loading block data...
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
                <Icon as={FiBox} color="#dc2626" size="20" />
              </Box>
              <Text fontSize="14px" color="#dc2626" fontWeight="500" mb={2}>
                Failed to Load Block
              </Text>
              <Text fontSize="12px" color="gray.600">
                {error}
              </Text>
            </Box>
          ) : !blockData ? (
            <Box textAlign="center" py={12}>
              <Box
                p={3}
                bg="#f3f4f6"
                borderRadius="10px"
                display="inline-block"
                mb={4}
              >
                <Icon as={FiBox} color="#6b7280" size="20" />
              </Box>
              <Text fontSize="14px" color="gray.600" fontWeight="500" mb={2}>
                Block Not Found
              </Text>
              <Text fontSize="12px" color="gray.500">
                The requested block could not be found.
              </Text>
            </Box>
          ) : (
            <Flex gap={6} direction={{ base: "column", lg: "row" }}>
              {/* Assignment Data */}
              <Box flex={1}>
                <Box bg="white" border="1px solid #e2e8f0" borderRadius="8px">
                  <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                    <Flex align="center">
                      <Icon as={FiDatabase} mr={2} color="#6366f1" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Assignment Data
                      </Text>
                    </Flex>
                  </Box>
                  <Box p={4}>
                    {blockData.node?.assignment ? (
                      keys(blockData.node.assignment)
                        .sort()
                        .map(key => {
                          const value = blockData.node.assignment[key]
                          if (value === "") return null

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
                              >
                                {displayValue(key, value)}
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
                        No assignment data available
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Message Data */}
              <Box flex={1}>
                <Box bg="white" border="1px solid #e2e8f0" borderRadius="8px">
                  <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
                    <Flex align="center">
                      <Icon as={FiActivity} mr={2} color="#8b5cf6" />
                      <Text fontSize="16px" fontWeight="600" color="gray.800">
                        Message Data
                      </Text>
                    </Flex>
                  </Box>
                  <Box p={4}>
                    {blockData.node?.message ? (
                      keys(blockData.node.message)
                        .sort()
                        .map(key => {
                          const value = blockData.node.message[key]

                          // Special Data field handling with truncated hash paths
                          if (key === "Data") {
                            try {
                              const dataArray = JSON.parse(value)
                              if (Array.isArray(dataArray)) {
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
                                    >
                                      {dataArray.map((item, idx) => (
                                        <Link
                                          key={idx}
                                          href={`/db/${router.query.id}/tx/${item.slot}?url=${router.query.url}`}
                                        >
                                          <Flex
                                            align="center"
                                            p={2}
                                            mb={2}
                                            bg="white"
                                            borderRadius="4px"
                                            border="1px solid #e2e8f0"
                                            cursor="pointer"
                                            _hover={{
                                              borderColor: "#6366f1",
                                              bg: "#6366f120",
                                            }}
                                            transition="all 0.2s"
                                          >
                                            <Icon
                                              as={FiActivity}
                                              color="#6366f1"
                                              size="14"
                                              mr={2}
                                            />
                                            <Text
                                              fontFamily="mono"
                                              fontSize="12px"
                                              color="gray.700"
                                              flex={1}
                                              title={item.hashpath}
                                            >
                                              {item.hashpath &&
                                              item.hashpath.length > 40
                                                ? item.hashpath.substring(
                                                    0,
                                                    40,
                                                  ) + "..."
                                                : item.hashpath}
                                            </Text>
                                            <Icon
                                              as={FiExternalLink}
                                              color="gray.400"
                                              size="12"
                                            />
                                          </Flex>
                                        </Link>
                                      ))}
                                    </Box>
                                  </Box>
                                )
                              }
                            } catch (e) {
                              // Fall through to regular display
                            }
                          }

                          if (value === "") return null

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
                              >
                                {displayValue(key, value)}
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
                        No message data available
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
