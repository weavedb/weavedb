import { Box, Flex } from "@chakra-ui/react"
const linkStyle = {
  fontSize: "16px",
  display: "block",
  py: 1,
  as: "a",
  target: "_blank",
  sx: { ":hover": { opacity: 0.75 } },
}

export default () => (
  <Flex
    bg="#333"
    color="white"
    p={4}
    justify="center"
    align="center"
    flex={1}
    direction="column"
    fontSize="12px"
  >
    <Flex maxW="900px" w="100%" justify="center">
      <Flex maxW="900px" w="100%">
        <Box flex={1} py={2} px={6}>
          <Flex align="center" fontSize="18px" fontWeight="bold" mb={3}>
            WeaveDB
          </Flex>
          <Box {...linkStyle} href="https://weavedb.dev">
            About
          </Box>
          <Box {...linkStyle} href="https://weavedb.mirror.xyz">
            Mirror Blog
          </Box>
          <Box
            {...linkStyle}
            href="https://docs.weavedb.dev/docs/category/example-dapps"
          >
            Demo Dapps
          </Box>
        </Box>
        <Box flex={1} py={2} px={6}>
          <Flex align="center" fontSize="18px" fontWeight="bold" mb={3}>
            Developer
          </Flex>
          <Box href="https://docs.weavedb.dev" {...linkStyle}>
            Documentation
          </Box>
          <Box {...linkStyle} href="https://fpjson.weavedb.dev">
            FPJSON
          </Box>
          <Box {...linkStyle} href="https://github.com/weavedb/weavedb">
            <Box as="i" className="fab fa-github" mr={2} />
            Github
          </Box>
        </Box>
        <Box flex={1} py={2} px={6}>
          <Flex align="center" fontSize="18px" fontWeight="bold" mb={3}>
            Community
          </Flex>
          <Box {...linkStyle} href="https://twitter.com/weave_db">
            <Box as="i" className="fab fa-twitter" mr={2} />
            Twitter
          </Box>
          <Box {...linkStyle} href="https://discord.com/invite/YMe3eqf69M">
            <Box as="i" className="fab fa-discord" mr={2} />
            Discord
          </Box>
          <Box
            {...linkStyle}
            href="https://gitcoin.co/grants/7716/weavedb-decentralized-nosql-database"
          >
            Gitcoin Grant
          </Box>
        </Box>
      </Flex>
    </Flex>
  </Flex>
)
