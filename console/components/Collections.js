import { Box, Flex } from "@chakra-ui/react"
import { map, includes, last } from "ramda"
import { per_page } from "../lib/const"

export default ({
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
}) => {
  return includes(tab)(["DB", "Crons", "Relayers", "Nodes"]) ? null : (
    <Box flex={1} sx={{ border: "1px solid #555" }} direction="column">
      <Flex py={2} px={3} color="white" bg="#333" h="35px">
        <Box>Collections</Box>
        <Box flex={1} />
        {!includes(tab, ["Data"]) ? null : (
          <Box
            onClick={() => setAddCollection(true)}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-plus" />
          </Box>
        )}
      </Flex>
      {map(v => (
        <Flex
          onClick={async () => {
            setDocPath([...base_path, v])
            setDocdata(null)
            setSubCollections([])
            let _docs = await db.cget(...[...base_path, v, per_page, true])
            setDocuments(_docs)
            if (_docs.length === per_page) setLoadMore(last(_docs))
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
  )
}
