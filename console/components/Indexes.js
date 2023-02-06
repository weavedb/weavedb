import { Box, Flex } from "@chakra-ui/react"
import { isNil, compose, map, filter } from "ramda"
export default ({ indexes, setAddIndex, col }) => (
  <>
    <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
      <Flex py={2} px={3} color="white" bg="#333" h="35px">
        Compound Indexes
        <Box flex={1} />
        {isNil(col) ? null : (
          <Box
            onClick={() => setAddIndex(true)}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-plus" />
          </Box>
        )}
      </Flex>
      <Box height="500px" sx={{ overflowY: "auto" }}>
        {compose(
          map(v => (
            <Flex p={2} px={3}>
              {map(v2 => {
                let ind = v2
                if (v2.length === 1) {
                  ind.push("asc")
                }
                return (
                  <Box px={3} mr={2} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    {v2.join(" : ")}
                  </Box>
                )
              })(v)}
            </Flex>
          )),
          filter(v => v.length > 1)
        )(indexes)}
      </Box>
    </Flex>
    <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
      <Flex py={2} px={3} color="white" bg="#333" h="35px">
        Single Indexes
      </Flex>
      <Box height="500px" sx={{ overflowY: "auto" }}>
        {compose(
          map(v => (
            <Flex p={2} px={3}>
              {map(v2 => {
                let ind = v2
                if (v2.length === 1) {
                  ind.push("asc")
                }
                return (
                  <Box px={3} mr={2} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    {v2.join(" : ")}
                  </Box>
                )
              })(v)}
            </Flex>
          )),
          filter(v => v.length === 1)
        )(indexes)}
      </Box>
    </Flex>
  </>
)