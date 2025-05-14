import { useState } from "react"
import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { read, _setCanEvolve } from "../../lib/weavedb"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({ state, contractTxId, db, setState, setAddCanEvolve, fn, set, $ }) => {
    return (
      <Modal title="Upgradability" close={setAddCanEvolve}>
        <Flex align="center" mb={3} justify="center">
          canEvolve is{" "}
          <Box
            as="span"
            ml={2}
            fontSize="20px"
            fontWeight="bold"
            color={state.canEvolve ? "#6441AF" : ""}
          >
            {state.canEvolve ? "ON" : "OFF"}
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
                set("set_canevolve", "loading")
                try {
                  const res = await fn(_setCanEvolve)({
                    value: !state.canEvolve,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setState(JSON.parse(res).results[0].result)
                  }
                } catch (e) {
                  console.log(e)
                }
                set(null, "loading")
              }
            }}
            sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
          >
            {!isNil($.loading) ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              "Switch canEvolve"
            )}
          </Flex>
        </Flex>
      </Modal>
    )
  }
)
