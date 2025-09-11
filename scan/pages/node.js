import { Flex, Box, Icon, Text, Button, Badge } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { map } from "ramda"
import Link from "next/link"
import Header from "../components/Header"
import Main from "../components/Main"
import { useRouter } from "next/router"
import {
  FiChevronRight,
  FiDatabase,
  FiServer,
  FiActivity,
  FiClock,
  FiUsers,
  FiArrowLeft,
} from "react-icons/fi"

export default function Home() {
  const router = useRouter()
  const [procs, setProcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [nodeInfo, setNodeInfo] = useState(null)

  useEffect(() => {
    void (async () => {
      if (router.query.url) {
        try {
          setLoading(true)
          const hb = new HB({ url: router.query.url })
          const { body } = await hb.get({ path: "/status" })
          const { processes } = JSON.parse(body)
          setProcs(processes)

          // Mock node info - replace with actual API call
          setNodeInfo({
            name: router.query.url.includes("localhost")
              ? "Localhost"
              : "ZKDB Demo",
            status: "online",
            uptime: "2d 14h 32m",
            version: "v0.43.0",
            lastSync: "12s ago",
          })
          setLoading(false)
        } catch (e) {
          console.log(e)
          setError("Failed to connect to node")
          setLoading(false)
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
            <Text fontFamily="mono" color="gray.800">
              {router.query.url}
            </Text>
          </Flex>

          {/* Node Info Header */}
          {nodeInfo && (
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
                    <Icon as={FiServer} color="white" size="20" />
                  </Box>
                  <Box>
                    <Text fontSize="20px" fontWeight="600" color="gray.800">
                      {nodeInfo.name}
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
                  textTransform="capitalize"
                >
                  {nodeInfo.status}
                </Badge>
              </Flex>

              <Flex gap={6} fontSize="13px">
                <Flex align="center">
                  <FiClock size="14" color="#6b7280" />
                  <Text color="gray.600" ml={2}>
                    Uptime:{" "}
                    <Text as="span" fontWeight="500">
                      {nodeInfo.uptime}
                    </Text>
                  </Text>
                </Flex>
                <Flex align="center">
                  <FiActivity size="14" color="#6b7280" />
                  <Text color="gray.600" ml={2}>
                    Version:{" "}
                    <Text as="span" fontWeight="500">
                      {nodeInfo.version}
                    </Text>
                  </Text>
                </Flex>
                <Flex align="center">
                  <FiDatabase size="14" color="#6b7280" />
                  <Text color="gray.600" ml={2}>
                    Last Sync:{" "}
                    <Text as="span" fontWeight="500">
                      {nodeInfo.lastSync}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )}

          {/* Databases Section */}
          <Box
            bg="white"
            border="1px solid #e2e8f0"
            borderRadius="8px"
            overflow="hidden"
          >
            <Box p={4} borderBottom="1px solid #e2e8f0" bg="#f7fafc">
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={FiDatabase} mr={2} color="#6366f1" />
                  <Text fontSize="16px" fontWeight="600" color="gray.800">
                    Available Databases
                  </Text>
                  {!loading && (
                    <Badge
                      ml={2}
                      bg="#6366f120"
                      color="#6366f1"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="10px"
                    >
                      {procs.length} databases
                    </Badge>
                  )}
                </Flex>
              </Flex>
            </Box>

            {loading ? (
              <Box p={8} textAlign="center">
                <Box
                  w="40px"
                  h="40px"
                  border="3px solid #e2e8f0"
                  borderTop="3px solid #6366f1"
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
                  Loading databases...
                </Text>
              </Box>
            ) : error ? (
              <Box p={8} textAlign="center">
                <Box
                  p={3}
                  bg="#fee2e2"
                  borderRadius="10px"
                  display="inline-block"
                  mb={4}
                >
                  <Icon as={FiServer} color="#dc2626" size="20" />
                </Box>
                <Text fontSize="14px" color="#dc2626" fontWeight="500" mb={2}>
                  Connection Failed
                </Text>
                <Text fontSize="12px" color="gray.600">
                  {error}
                </Text>
              </Box>
            ) : procs.length === 0 ? (
              <Box p={8} textAlign="center">
                <Box
                  p={3}
                  bg="#f3f4f6"
                  borderRadius="10px"
                  display="inline-block"
                  mb={4}
                >
                  <Icon as={FiDatabase} color="#6b7280" size="20" />
                </Box>
                <Text fontSize="14px" color="gray.600" fontWeight="500" mb={2}>
                  No Databases Found
                </Text>
                <Text fontSize="12px" color="gray.500">
                  This node doesn't have any databases configured.
                </Text>
              </Box>
            ) : (
              <Box>
                {map(v => (
                  <Link key={v} href={`/db/${v}?url=${router.query.url}`}>
                    <Box
                      px={4}
                      py={4}
                      borderBottom="1px solid #e2e8f0"
                      _hover={{ bg: "#f7fafc" }}
                      transition="background 0.2s"
                      cursor="pointer"
                      _last={{ borderBottom: "none" }}
                    >
                      <Flex align="center" justify="space-between">
                        <Flex align="center">
                          <Box p={2} bg="#6366f120" borderRadius="6px" mr={3}>
                            <Icon as={FiDatabase} color="#6366f1" size="16" />
                          </Box>
                          <Box>
                            <Text
                              fontWeight="500"
                              fontSize="14px"
                              color="gray.800"
                              fontFamily="mono"
                            >
                              {v}
                            </Text>
                            <Text fontSize="12px" color="gray.500">
                              Database instance
                            </Text>
                          </Box>
                        </Flex>

                        <Flex align="center">
                          <Badge
                            bg="#10b98120"
                            color="#10b981"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="9px"
                            mr={3}
                          >
                            ACTIVE
                          </Badge>
                          <Icon
                            as={FiChevronRight}
                            color="gray.400"
                            size="16"
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </Link>
                ))(procs)}
              </Box>
            )}
          </Box>

          {/* Quick Stats */}
          {!loading && !error && procs.length > 0 && (
            <Flex gap={4} mt={6} wrap="wrap">
              <Box
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                p={4}
                flex={1}
                minW="200px"
              >
                <Flex align="center" mb={2}>
                  <Box p={2} bg="#6366f120" borderRadius="6px">
                    <Icon as={FiDatabase} color="#6366f1" size="14" />
                  </Box>
                </Flex>
                <Text fontSize="20px" fontWeight="700" color="gray.800">
                  {procs.length}
                </Text>
                <Text fontSize="12px" color="gray.600">
                  Total Databases
                </Text>
              </Box>

              <Box
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                p={4}
                flex={1}
                minW="200px"
              >
                <Flex align="center" mb={2}>
                  <Box p={2} bg="#8b5cf620" borderRadius="6px">
                    <Icon as={FiActivity} color="#8b5cf6" size="14" />
                  </Box>
                </Flex>
                <Text fontSize="20px" fontWeight="700" color="gray.800">
                  {procs.length}
                </Text>
                <Text fontSize="12px" color="gray.600">
                  Active Processes
                </Text>
              </Box>

              <Box
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                p={4}
                flex={1}
                minW="200px"
              >
                <Flex align="center" mb={2}>
                  <Box p={2} bg="#10b98120" borderRadius="6px">
                    <Icon as={FiUsers} color="#10b981" size="14" />
                  </Box>
                </Flex>
                <Text fontSize="20px" fontWeight="700" color="gray.800">
                  100%
                </Text>
                <Text fontSize="12px" color="gray.600">
                  Health Status
                </Text>
              </Box>
            </Flex>
          )}
        </Box>
      </Main>
    </>
  )
}
