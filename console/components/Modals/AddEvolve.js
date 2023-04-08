import { useState } from "react"
import { Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { read, _evolve, _migrate } from "../../lib/weavedb"
import { latest } from "../../lib/const"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({ setAddEvolve, state, contractTxId, db, setState, fn, set, $ }) => {
    return (
      <Modal title="Evolve/Migrate" close={setAddEvolve}>
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
                try {
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
                  } else {
                    setState(JSON.parse(res).results[0].result)
                  }
                } catch (e) {
                  alert("Something went wrong")
                }
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
      </Modal>
    )
  }
)
