import { Box, Flex } from "@chakra-ui/react"
import { isNil, map, includes, last } from "ramda"
import { per_page } from "../lib/const"
import { inject } from "roidjs"
import { read } from "../lib/weavedb"

export default inject(
  ["tx_logs", "temp_current"],
  ({
    fn,
    tab,
    setAddCollection,
    setDocPath,
    setDocdata,
    setDocuments,
    setSubCollections,
    db,
    setLoadMore,
    base_path,
    collections,
    col,
    $,
  }) => {
    return includes(tab)(["DB", "Crons", "Relayers", "Nodes"]) ? null : (
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          <Box>Collections</Box>
          <Box flex={1} />
          {!includes(tab, ["Data"]) ? null : (
            <Box
              onClick={() => {
                if (isNil($.temp_current)) {
                  alert("authenticate wallet")
                } else {
                  setAddCollection(true)
                }
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
          >
            {map(v => (
              <Flex
                onClick={async () => {
                  setDocPath([...base_path, v])
                  setDocdata(null)
                  setSubCollections([])
                  let _docs = await fn(read)({
                    db,
                    m: "cget",
                    q: [...base_path, v, per_page],
                  })
                  setDocuments(_docs)
                  setLoadMore(_docs.length === per_page ? last(_docs) : null)
                }}
                bg={col === v ? "#ddd" : ""}
                py={2}
                px={3}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                {v}
              </Flex>
            ))(collections)}
          </Box>
        </Box>
      </Flex>
    )
  }
)
