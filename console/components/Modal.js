import { Box, Flex } from "@chakra-ui/react"
export default ({ title, children, close }) => (
  <Flex
    w="100%"
    h="100%"
    position="fixed"
    sx={{ top: 0, left: 0, zIndex: 100 }}
    bg="rgba(0,0,0,0.5)"
    justify="center"
    align="center"
  >
    <Box
      bg="white"
      width="500px"
      p={3}
      sx={{ borderRadius: "5px", cursor: "default" }}
      onClick={e => e.stopPropagation()}
    >
      <Flex fontSize="15px" mb={2} pr={2}>
        <Box fontWeight="bold">{title}</Box>
        <Box flex={1}></Box>
        <Box>
          <Box
            color="#ccc"
            sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
            className="fas fa-times"
            onClick={() => close(false)}
          />
        </Box>
      </Flex>
      {children}
    </Box>
  </Flex>
)
