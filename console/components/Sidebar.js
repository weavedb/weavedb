import { Box, Flex } from "@chakra-ui/react"
import { isNil, map, includes, addIndex as _addIndex } from "ramda"
import { tabmap, tabs } from "../lib/const"

export default ({ currentDB, setTab, tab }) => {
  return (
    <Flex
      h="100%"
      w="250px"
      bg="#eee"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
      }}
      pt="56px"
      direction="column"
    >
      {_addIndex(map)((v, i) => {
        return (
          <Flex
            onClick={() => {
              if (includes(v, ["DB", "Nodes"]) || !isNil(currentDB)) setTab(v)
            }}
            bg={v === tab ? "#6441AF" : "#eee"}
            color={
              v === tab
                ? "white"
                : !isNil(currentDB) || includes(v)(["DB", "Nodes"])
                ? "#333"
                : "#999"
            }
            py={3}
            px={4}
            sx={{
              cursor:
                !isNil(currentDB) || includes(v)(["DB", "Nodes"])
                  ? "pointer"
                  : "not-allowed",
              ":hover": { opacity: 0.75 },
            }}
          >
            {tabmap[v].name}
          </Flex>
        )
      })(tabs)}
      <Flex flex={1} />
      <Flex
        fontSize="12px"
        p={4}
        bg="#6441AF"
        color="white"
        m={4}
        sx={{ borderRadius: "5px" }}
      >
        WeaveDB is still in alpha. Please use it with discretion.
      </Flex>
      <Box
        fontSize="12px"
        p={4}
        bg="#6441AF"
        color="white"
        mx={4}
        mb={4}
        sx={{ borderRadius: "5px" }}
      >
        For old contracts before v0.18, please use
        <Box
          sx={{ textDecoration: "underline" }}
          ml={1}
          as="a"
          target="_blank"
          href="https://old-console.weavedb.dev"
        >
          Old Console
        </Box>
        .
      </Box>
    </Flex>
  )
}
