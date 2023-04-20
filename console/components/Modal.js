import { Box, Flex } from "@chakra-ui/react"
export default ({ title, children, width, close, type = "center" }) => (
  <Flex
    w="100%"
    h="100%"
    position="fixed"
    sx={{ top: 0, left: 0, zIndex: 100 }}
    bg="rgba(0,0,0,0.5)"
    justify={type === "right" ? "flex-end" : "center"}
    align="center"
  >
    <Flex
      direction="column"
      bg="white"
      w={type === "right" ? width ?? "50%" : "500px"}
      minW="500px"
      h={type === "right" ? "100%" : "auto"}
      p={3}
      sx={{ borderRadius: type === "right" ? 0 : "5px" }}
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
    </Flex>
  </Flex>
)
