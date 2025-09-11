import { Flex, Box } from "@chakra-ui/react"
import Footer from "./Footer"

export default function Main({ children }) {
  return (
    <Box w="100%" pt="90px" bg="#fafbfc" minH="100vh">
      <Flex direction="column" minH="calc(100vh - 90px)">
        {/* Main content area */}
        <Flex justify="center" flex="1">
          <Box w="100%" maxW="1200px" px={4}>
            {children}
          </Box>
        </Flex>

        {/* Footer at bottom */}
        <Footer />
      </Flex>
    </Box>
  )
}
