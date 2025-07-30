import { Flex, Box } from "@chakra-ui/react"
import Footer from "./Footer"

export default function Main({ children }) {
  return (
    <Flex w="100%" pt="60px">
      <Flex w="100%">
        <Flex w="100%" bg="#eee" direction="column" minH="calc(100vh - 60px)">
          <Flex w="100%" justify="center">
            <Box w="100%" maxW="1360px">
              {children}
            </Box>
          </Flex>
          <Box flex={1} />
          <Footer />
        </Flex>
      </Flex>
    </Flex>
  )
}
