import { Flex, Box, Text } from "@chakra-ui/react"
import Link from "next/link"
import { Icon } from "@chakra-ui/react"
import { FaGithub, FaXTwitter, FaDiscord } from "react-icons/fa6"
import { FiHeart } from "react-icons/fi"

export default function Footer() {
  return (
    <Box w="100%" bg="white" borderTop="1px solid #e2e8f0" mt={12} py={8}>
      <Flex justify="center" w="100%">
        <Flex w="100%" maxW="1200px" px={4}>
          <Flex direction="column" gap={6} w="100%">
            {/* Main footer content */}
            <Flex justify="space-between" align="start">
              <Box>
                <Flex align="center" mb={2}>
                  <Text fontWeight="600" fontSize="16px" color="gray.800">
                    WeaveDB Scan
                  </Text>
                  <Text fontSize="12px" color="gray.500" ml={2}>
                    v0.1.0
                  </Text>
                </Flex>
                <Text fontSize="13px" color="gray.600" maxW="300px">
                  The premier WeaveDB blockchain explorer and analytics
                  platform. Explore collections, transactions, and network data.
                </Text>
              </Box>

              <Flex gap={8}>
                <Box>
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.700"
                    mb={3}
                  >
                    Resources
                  </Text>
                  <Flex direction="column" gap={2}>
                    <Link
                      href="https://docs.weavedb.dev/api/wdb-sdk"
                      target="_blank"
                    >
                      <Text
                        fontSize="12px"
                        color="gray.600"
                        _hover={{ color: "#6366f1" }}
                        cursor="pointer"
                      >
                        API Documentation
                      </Text>
                    </Link>
                    <Link
                      href="https://docs.weavedb.dev/build/quick-start"
                      target="_blank"
                    >
                      <Text
                        fontSize="12px"
                        color="gray.600"
                        _hover={{ color: "#6366f1" }}
                        cursor="pointer"
                      >
                        Developer Guide
                      </Text>
                    </Link>
                    <Link
                      href="https://docs.weavedb.dev/litepaper"
                      target="_blank"
                    >
                      <Text
                        fontSize="12px"
                        color="gray.600"
                        _hover={{ color: "#6366f1" }}
                        cursor="pointer"
                      >
                        Litepaper
                      </Text>
                    </Link>
                  </Flex>
                </Box>

                <Box>
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.700"
                    mb={3}
                  >
                    Community
                  </Text>
                  <Flex gap={3}>
                    <Link href="https://github.com/weavedb" target="_blank">
                      <Box
                        p={2}
                        borderRadius="6px"
                        _hover={{ bg: "#f7fafc" }}
                        transition="background 0.2s"
                        cursor="pointer"
                      >
                        <Icon as={FaGithub} fontSize="16px" color="gray.600" />
                      </Box>
                    </Link>
                    <Link href="https://x.com/weave_db" target="_blank">
                      <Box
                        p={2}
                        borderRadius="6px"
                        _hover={{ bg: "#f7fafc" }}
                        transition="background 0.2s"
                        cursor="pointer"
                      >
                        <Icon
                          as={FaXTwitter}
                          fontSize="16px"
                          color="gray.600"
                        />
                      </Box>
                    </Link>
                    <Link
                      href="https://discord.com/invite/YMe3eqf69M"
                      target="_blank"
                    >
                      <Box
                        p={2}
                        borderRadius="6px"
                        _hover={{ bg: "#f7fafc" }}
                        transition="background 0.2s"
                        cursor="pointer"
                      >
                        <Icon as={FaDiscord} fontSize="16px" color="gray.600" />
                      </Box>
                    </Link>
                  </Flex>
                </Box>
              </Flex>
            </Flex>

            {/* Bottom section */}
            <Flex
              justify="space-between"
              align="center"
              pt={6}
              borderTop="1px solid #e2e8f0"
            >
              <Flex align="center" fontSize="12px" color="gray.500">
                <Text>© 2024 WeaveDB Scan</Text>
                <Box mx={2}>•</Box>
                <Text>Made with</Text>
                <Icon as={FiHeart} mx={1} color="red.400" />
                <Text>for the WeaveDB community</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
