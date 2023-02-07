import { useState } from "react"
import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { _evolve, _migrate } from "../../lib/weavedb"
import { latest } from "../../lib/const"

export default inject(
  ["loading", "temp_current"],
  ({ setAddEvolve, state, contractTxId, db, setState, fn, set, $ }) => {
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddEvolve(false)}
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
          <Flex align="center" mb={3} justify="center">
            contract version is{" "}
            <Box
              as="span"
              ml={2}
              fontSize="20px"
              fontWeight="bold"
              color={state.canEvolve ? "#6441AF" : ""}
            >
              {state.version}
            </Box>
          </Flex>
          <Flex align="center">
            <Flex
              fontSize="12px"
              align="center"
              height="40px"
              bg={
                state.version === latest
                  ? "#999"
                  : state.isEvolving
                  ? "#6441AF"
                  : "#333"
              }
              color="white"
              justify="center"
              py={2}
              px={2}
              w="100%"
              onClick={async () => {
                if (state.version !== latest && isNil($.loading)) {
                  set("set_evolve", "loading")
                  let res
                  if (state.isEvolving) {
                    res = await fn(_migrate)({
                      version: latest,
                      contractTxId,
                    })
                  } else {
                    res = await fn(_evolve)({
                      value: !state.canEvolve,
                      contractTxId,
                    })
                  }
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  }
                  setState(await db.getInfo(true))
                  set(null, "loading")
                }
              }}
              sx={{
                cursor: state.version === latest ? "default" : "pointer",
                ":hover": {
                  opacity: state.version === latest ? 1 : 0.75,
                },
              }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : state.version === latest ? (
                "The current version is up to date"
              ) : state.isEvolving ? (
                "Migrate"
              ) : (
                `Upgrade to ${latest}`
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    )
  }
)
