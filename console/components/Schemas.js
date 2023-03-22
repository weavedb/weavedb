import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import JSONPretty from "react-json-pretty"
import { inject } from "roidjs"
export default inject(
  [],
  ({ col, schema, setAddSchema, setNewSchema, isOwner }) => (
    <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
      <Flex py={2} px={3} color="white" bg="#333" h="35px">
        <Box>Schemas</Box>
        <Box flex={1} />
        {isNil(col) ? null : (
          <Box
            onClick={() => {
              if (!isOwner) return alert("connect the owner wallet to DB")
              setNewSchema(
                JSON.stringify(
                  schema || { type: "object", required: [], properties: {} }
                )
              )
              setAddSchema(true)
            }}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-plus" />
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
          {isNil(schema) ? (
            <Flex justify="center" align="center" height="100%">
              Schema is not set.
            </Flex>
          ) : (
            <JSONPretty id="json-pretty" data={schema}></JSONPretty>
          )}
        </Box>
      </Box>
    </Flex>
  )
)
