import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import JSONPretty from "react-json-pretty"

export default ({ rules, setAddRules, col }) => (
  <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
    <Flex py={2} px={3} color="white" bg="#333" h="35px">
      <Box>Rules</Box>
      <Box flex={1} />
      {isNil(col) ? null : (
        <Box
          onClick={() => setAddRules(true)}
          sx={{
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          <Box as="i" className="fas fa-plus" />
        </Box>
      )}
    </Flex>
    <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
      <JSONPretty id="json-pretty" data={rules}></JSONPretty>
    </Box>
  </Flex>
)
