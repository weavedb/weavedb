import { Box, Flex } from "@chakra-ui/react"
import { isNil, map, includes, addIndex as _addIndex } from "ramda"
import { tabmap, tabs } from "../lib/const"

export default ({
  currentDB,
  setTab,
  tab,
  showSidebar,
  port,
  setConnect,
  setPort,
  state,
}) => {
  return (
    <Box
      display={[showSidebar ? "flex" : "none", null, null, null, "flex"]}
      h="100%"
      w="250px"
      bg="#eee"
      sx={{
        zIndex: 2,
        position: "fixed",
        top: 0,
        left: 0,
        flexDirection: "column",
      }}
      pt="56px"
    >
      {_addIndex(map)((v, i) => {
        const isOn =
          (!isNil(currentDB) || includes(v)(["DB", "Nodes"])) &&
          (v !== "Triggers" ||
            (!isNil(state) &&
              (state.version === "0.26.4" ||
                state.version.split(".")[1] === "27")))
        return (
          <Flex
            onClick={() => {
              if (isOn) setTab(v)
            }}
            bg={v === tab ? "#6441AF" : "#eee"}
            color={v === tab ? "white" : isOn ? "#333" : "#999"}
            py={3}
            px={4}
            sx={{
              cursor: isOn ? "pointer" : "not-allowed",
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
        sx={{ textDecoration: "underline", borderRadius: "5px" }}
      >
        {isNil(port) ? (
          <Flex onClick={() => setConnect(true)} sx={{ cursor: "pointer" }}>
            Connect with Localhost
          </Flex>
        ) : (
          <Flex
            sx={{ cursor: "pointer" }}
            onClick={() => {
              if (confirm("Would you like to disconnect?")) {
                setPort(null)
              }
            }}
          >
            Connected with local port{" "}
            <Box ml={2} color="#6441AF">
              {port}
            </Box>
          </Flex>
        )}
      </Flex>
      <Flex
        fontSize="12px"
        p={4}
        bg="#6441AF"
        color="white"
        mx={4}
        mb={4}
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
    </Box>
  )
}
