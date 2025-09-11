import { Flex, Box, Button, Input, Icon, Text } from "@chakra-ui/react"
import Link from "next/link"
import { FiSearch, FiDatabase, FiGlobe } from "react-icons/fi"

export default function Header() {
  return (
    <Box
      w="100%"
      bg="white"
      borderBottom="1px solid #e2e8f0"
      css={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Top bar with network info */}
      <Flex
        w="100%"
        bg="#f7fafc"
        borderBottom="1px solid #e2e8f0"
        fontSize="12px"
        color="gray.600"
        py={1}
        justify="center"
      >
        <Flex w="100%" maxW="1200px" px={4} align="center">
          <Flex align="center">
            <Box w="6px" h="6px" bg="#10b981" borderRadius="50%" mr={2} />
            WeaveDB Network: Preview
          </Flex>
          <Box flex={1} />
          <Flex align="center" gap={4}>
            <Box>Query Fee: 0 DB</Box>
            <Box>$DB Price: $0.00</Box>
          </Flex>
        </Flex>
      </Flex>

      {/* Main header */}
      <Flex w="100%" align="center" justify="center" py={3}>
        <Flex w="100%" maxW="1200px" px={4} align="center">
          <Link href="/">
            <Flex align="center" cursor="pointer">
              <Box
                p={2}
                bg="linear-gradient(135deg, #6366f1, #8b5cf6)"
                borderRadius="8px"
                mr={3}
              >
                <FiDatabase size="18" color="white" />
              </Box>
              <Box>
                <Box fontWeight="700" fontSize="18px" color="#6366f1">
                  WeaveDB Scan
                </Box>
                <Box fontSize="11px" color="gray.500" mt="-2px">
                  Database Explorer
                </Box>
              </Box>
            </Flex>
          </Link>

          <Box mx={8} maxW="400px">
            <Box position="relative">
              <Input
                placeholder="Search by Collection, Transaction Hash, Address..."
                bg="#f7fafc"
                border="1px solid #e2e8f0"
                borderRadius="6px"
                fontSize="13px"
                pl="32px"
                size="sm"
                isDisabled
                cursor="not-allowed"
                opacity={0.6}
              />
              <Box
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                pointerEvents="none"
              >
                <Icon as={FiSearch} color="#a0aec0" size="14px" />
              </Box>
            </Box>
          </Box>

          <Box flex={1} />

          <Flex fontSize="13px" align="center" gap={3}>
            <Flex align="center" px={3} py={1} bg="#f7fafc" borderRadius="6px">
              <FiGlobe size="14" color="#6b7280" />
              <Text color="gray.600" ml={2} fontSize="12px">
                Preview
              </Text>
            </Flex>
            <Button
              variant="outline"
              size="sm"
              fontWeight="500"
              borderColor="#e2e8f0"
              color="gray.400"
              cursor="not-allowed"
              isDisabled
            >
              Connect
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
