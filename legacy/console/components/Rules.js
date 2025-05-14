import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import JSONPretty from "react-json-pretty"

export default ({
  setEditRules,
  rules,
  isOwner,
  setNewRules,
  setAddRules,
  col,
}) => (
  <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
    <Flex py={2} px={3} color="white" bg="#333" h="35px">
      <Box>Rules</Box>
      <Box flex={1} />
      {isNil(col) ? null : (
        <Box
          onClick={() => {
            if (!isOwner) {
              alert("connect the owner wallet to DB")
            } else {
              setNewRules(
                JSON.stringify(rules || { "allow write": true }, undefined, 2)
              )
              setEditRules(col)
              setAddRules(true)
            }
          }}
          sx={{
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          <Box as="i" className="fas fa-edit" />
        </Box>
      )}
    </Flex>
    <Box flex={1} sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
        }}
        p={3}
      >
        <JSONPretty id="json-pretty" data={rules}></JSONPretty>
      </Box>
    </Box>
  </Flex>
)
