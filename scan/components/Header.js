import { Flex, Box } from "@chakra-ui/react"
import Link from "next/link"

export default function Header() {
  return (
    <Flex
      w="100%"
      align="center"
      justify="center"
      h="60px"
      bg="white"
      css={{ position: "fixed", top: 0, left: 0 }}
    >
      <Flex w="100%" maxW="1360px">
        <Link href="/">
          <Box fontWeight="bold" px={4} color="#5137C5">
            WeaveDB Scan
          </Box>
        </Link>
        <Box flex={1} />
        <Flex fontSize="14px" align="center" px={4}>
          {true ? null : (
            <Link href="https://docs.weavedb.dev" target="_blank">
              <Box mx={2}>Docs</Box>
            </Link>
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
