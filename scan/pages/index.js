import { Flex, Box, Icon, Text, Button, Badge } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { map } from "ramda"
import Link from "next/link"
import {
  FiServer,
  FiExternalLink,
  FiDatabase,
  FiActivity,
  FiUsers,
  FiLayers,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi"
import Header from "../components/Header"
import Main from "../components/Main"

export default function HomePage() {
  const [nodes, setNodes] = useState([
    {
      name: "ZKDB Demo",
      url: "https://db-demo.wdb.ae:10003",
      status: "online",
      collections: 245,
      transactions: "1.2M",
      lastBlock: "2m ago",
      syncStatus: 99.8,
    },
    {
      name: "Localhost",
      url: "http://localhost:6364",
      status: "syncing",
      collections: 12,
      transactions: "45.7K",
      lastBlock: "12s ago",
      syncStatus: 100.0,
    },
  ])

  const stats = [
    { label: "Total Nodes", value: "2", icon: FiServer, color: "#6366f1" },
    {
      label: "Total Databases",
      value: "2",
      icon: FiDatabase,
      color: "#8b5cf6",
    },
    {
      label: "Total Collections",
      value: "2",
      icon: FiLayers,
      color: "#a855f7",
    },
    {
      label: "Total Transactions",
      value: "100",
      icon: FiActivity,
      color: "#c084fc",
    },
  ]

  return (
    <>
      <Header />
      <Main>
        <Box py={6}>
          {/* Stats Overview */}
          <Text fontSize="20px" fontWeight="600" color="gray.800" mb={4}>
            Network Overview
          </Text>
          <Flex gap={4} mb={8} wrap="wrap">
            {stats.map((stat, idx) => (
              <Box
                key={idx}
                bg="white"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                p={4}
                flex={1}
                minW="200px"
                _hover={{ borderColor: "#6366f1" }}
                transition="border-color 0.2s"
              >
                <Flex align="center" justify="space-between" mb={2}>
                  <Box p={2} bg={`${stat.color}20`} borderRadius="6px">
                    <Icon as={stat.icon} color={stat.color} size="16" />
                  </Box>
                  <FiTrendingUp size="12" color="#8b5cf6" />
                </Flex>
                <Text fontSize="24px" fontWeight="700" color="gray.800">
                  {stat.value}
                </Text>
                <Text fontSize="12px" color="gray.600">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Flex>

          {/* Nodes Section */}
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
                    Available Nodes
                  </Text>
                  <Badge
                    ml={2}
                    bg="#6366f120"
                    color="#6366f1"
                    px={2}
                    py={1}
                    borderRadius="full"
                    fontSize="10px"
                  >
                    {nodes.length} nodes
                  </Badge>
                </Flex>
                <Button
                  size="sm"
                  bg="#6366f1"
                  color="white"
                  _hover={{ bg: "#5b21b6" }}
                >
                  Add Node
                </Button>
              </Flex>
            </Box>

            {/* Table Header */}
            <Box bg="#fafbfc" px={4} py={3} borderBottom="1px solid #e2e8f0">
              <Flex
                align="center"
                fontSize="11px"
                fontWeight="600"
                color="gray.600"
              >
                <Box flex="2">NODE</Box>
                <Box flex="1">STATUS</Box>
                <Box flex="1">COLLECTIONS</Box>
                <Box flex="1">TRANSACTIONS</Box>
                <Box flex="1">LAST BLOCK</Box>
                <Box flex="1">SYNC %</Box>
                <Box flex="1">ACTION</Box>
              </Flex>
            </Box>

            {/* Table Rows */}
            {nodes.map((node, idx) => (
              <Box
                key={idx}
                px={4}
                py={4}
                borderBottom={
                  idx < nodes.length - 1 ? "1px solid #e2e8f0" : "none"
                }
                _hover={{ bg: "#f7fafc" }}
                transition="background 0.2s"
              >
                <Flex align="center">
                  {/* Node Info */}
                  <Box flex="2">
                    <Flex align="center">
                      <Box
                        w="8px"
                        h="8px"
                        bg={node.status === "online" ? "#10b981" : "#f59e0b"}
                        borderRadius="50%"
                        mr={3}
                      />
                      <Box>
                        <Text fontWeight="500" fontSize="14px" color="gray.800">
                          {node.name}
                        </Text>
                        <Text
                          fontSize="12px"
                          color="gray.500"
                          fontFamily="mono"
                        >
                          {node.url}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>

                  {/* Status */}
                  <Box flex="1">
                    <Badge
                      bg={node.status === "online" ? "#10b98120" : "#f59e0b20"}
                      color={node.status === "online" ? "#10b981" : "#f59e0b"}
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="10px"
                      textTransform="capitalize"
                    >
                      {node.status}
                    </Badge>
                  </Box>

                  {/* Collections */}
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="500" color="gray.700">
                      {node.collections}
                    </Text>
                  </Box>

                  {/* Transactions */}
                  <Box flex="1">
                    <Text fontSize="13px" fontWeight="500" color="gray.700">
                      {node.transactions}
                    </Text>
                  </Box>

                  {/* Last Block */}
                  <Box flex="1">
                    <Flex align="center">
                      <FiClock size="12" color="#a0aec0" />
                      <Text fontSize="12px" color="gray.600" ml={1}>
                        {node.lastBlock}
                      </Text>
                    </Flex>
                  </Box>

                  {/* Sync Status */}
                  <Box flex="1">
                    <Flex align="center">
                      <Box
                        w="40px"
                        h="4px"
                        bg="gray.200"
                        borderRadius="2px"
                        mr={2}
                        overflow="hidden"
                      >
                        <Box
                          h="100%"
                          w={`${node.syncStatus}%`}
                          bg={node.syncStatus === 100 ? "#10b981" : "#6366f1"}
                        />
                      </Box>
                      <Text fontSize="12px" color="gray.600">
                        {node.syncStatus}%
                      </Text>
                    </Flex>
                  </Box>

                  {/* Action */}
                  <Box flex="1">
                    <Link href={`/node?url=${node.url}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="#6366f1"
                        color="#6366f1"
                        _hover={{ bg: "#6366f120" }}
                        fontSize="12px"
                        h="28px"
                      >
                        <Flex align="center">
                          Explore
                          <Icon as={FiExternalLink} ml={1} size="12px" />
                        </Flex>
                      </Button>
                    </Link>
                  </Box>
                </Flex>
              </Box>
            ))}
          </Box>

          {/* Add Node CTA */}
          <Box
            mt={8}
            p={6}
            bg="rgba(255, 255, 255, 0.7)"
            borderRadius="16px"
            border="2px dashed rgba(102, 126, 234, 0.3)"
            textAlign="center"
            cursor="pointer"
            transition="all 0.3s ease"
            _hover={{
              bg: "rgba(102, 126, 234, 0.05)",
              borderColor: "rgba(102, 126, 234, 0.5)",
            }}
          >
            <Icon as={FiServer} fontSize="24px" color="gray.400" mb={2} />
            <Text color="gray.600" fontWeight="500">
              Add a new node connection
            </Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              Connect to additional WeaveDB instances
            </Text>
          </Box>
        </Box>
      </Main>
    </>
  )
}
