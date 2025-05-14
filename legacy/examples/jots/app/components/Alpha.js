import { Box, Flex } from "@chakra-ui/react"

export default () => (
  <Flex justify="center" align="center" w="100%" h="calc(100vh - 50px)">
    <Box p={8}>
      We are currently in private alpha.
      <br />
      Sign in to use the dapp.
      <br />
      Only Browser Metamask is supported at this time.
    </Box>
  </Flex>
)
