import { useState } from "react"
import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { read, _setSecure } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({ setAddSecure, state, contractTxId, db, setState, fn, set, $ }) => {
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddSecure(false)}
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
            Secure is{" "}
            <Box
              as="span"
              ml={2}
              fontSize="20px"
              fontWeight="bold"
              color={state.secure ? "#6441AF" : ""}
            >
              {state.secure ? "ON" : "OFF"}
            </Box>
          </Flex>
          <Flex align="center">
            <Flex
              fontSize="12px"
              align="center"
              height="40px"
              bg="#333"
              color="white"
              justify="center"
              py={2}
              px={2}
              w="100%"
              onClick={async () => {
                if (isNil($.loading)) {
                  set("set_secure", "loading")
                  const res = await fn(_setSecure)({
                    value: !state.secure,
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
              sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                "Switch Secure Mode"
              )}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    )
  }
)
