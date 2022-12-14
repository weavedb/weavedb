import { Box, Flex } from "@chakra-ui/react"

export default function Footer() {
  return (
    <Flex
      align="center"
      justify="center"
      fontSize="14px"
      minH="100px"
      p={6}
      bg="#161822"
      color="white"
    >
      <Box>
        <Box>
          The Wall EXM is a fullstack dapp demo built with
          <Box
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
              textDecoration: "underline",
            }}
            as="a"
            target="_blank"
            mx={1}
            href="https://weavedb.dev"
          >
            WeaveDB
          </Box>
          on
          <Box
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
              textDecoration: "underline",
            }}
            as="a"
            target="_blank"
            ml={1}
            href="https://exm.dev"
          >
            Execution Machine
          </Box>
          .
        </Box>
      </Box>
    </Flex>
  )
}
