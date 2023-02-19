import { useState } from "react"
import { Box, Flex } from "@chakra-ui/react"
import { map, includes, without, append, isNil } from "ramda"
import { inject } from "roidjs"
import { _setAlgorithms, read } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    db,
    contractTxId,
    setState,
    setNewAuths,
    newAuths,
    setAddAlgorithms,
    fn,
    set,
    $,
  }) => {
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddAlgorithms(false)}
        justify="center"
        align="center"
      >
        <Box
          bg="white"
          width="500px"
          p={3}
          fontSize="12px"
          sx={{ borderRadius: "5px", cursor: "default" }}
          onClick={e => e.stopPropagation()}
        >
          <Flex>
            {map(v => (
              <Box mx={3}>
                <Box
                  onClick={() => {
                    if (includes(v)(newAuths)) {
                      setNewAuths(without([v], newAuths))
                    } else {
                      setNewAuths(append(v, newAuths))
                    }
                  }}
                  className={
                    includes(v)(newAuths)
                      ? "fas fa-check-square"
                      : "far fa-square"
                  }
                  mr={2}
                  sx={{
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                />
                {v}
              </Box>
            ))(["secp256k1", "secp256k1-2", "ed25519", "rsa256"])}
          </Flex>
          <Flex
            mt={3}
            fontSize="12px"
            align="center"
            height="40px"
            bg="#333"
            color="white"
            justify="center"
            py={1}
            px={2}
            w="100%"
            onClick={async () => {
              if (isNil($.loading)) {
                set("set_algorithms", "loading")
                const res = await fn(_setAlgorithms)({
                  algorithms: newAuths,
                  contractTxId,
                })
                if (/^Error:/.test(res)) {
                  alert("Something went wrong")
                } else {
                  setState(JSON.parse(res).results[0].result)
                }
                set(null, "loading")
              }
            }}
            sx={{
              borderRadius: "5px",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            {!isNil($.loading) ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              "Save Changes"
            )}
          </Flex>
        </Box>
      </Flex>
    )
  }
)
