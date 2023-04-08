import { useState } from "react"
import { Box, Flex, Input } from "@chakra-ui/react"
import { isNil, map } from "ramda"
import { inject } from "roidjs"
import { read, _addOwner, _removeOwner } from "../../lib/weavedb"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "temp_current_all", "tx_logs"],
  ({ setState, setAddOwner, owners, contractTxId, db, fn, set, $ }) => {
    const [newOwner, setNewOwner] = useState("")
    return (
      <Modal title="Contract Owner" close={setAddOwner}>
        {map(v => {
          return (
            <Flex mb={3} px={2} align="center">
              <Flex flex={1}>{v}</Flex>
              <Flex>
                <Box
                  onClick={async () => {
                    if (owners.length === 1) {
                      if (
                        !confirm(
                          `Would you like to remove ${v}? Removing the last owner will make the DB unconfigurable.`
                        )
                      ) {
                        return
                      }
                    } else if (!confirm(`Would you like to remove ${v}?`)) {
                      return
                    }
                    try {
                      const res = await fn(_removeOwner)({
                        address: v,
                        contractTxId,
                      })
                      if (/^Error:/.test(res)) {
                        alert("Something went wrong")
                      } else {
                        setState(JSON.parse(res).results[0].result)
                      }
                    } catch (e) {
                      alert("Something went wrong")
                    }
                  }}
                  className="fas fa-trash"
                  sx={{
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                />
              </Flex>
            </Flex>
          )
        })(owners)}
        <Flex align="center">
          <Input
            flex={1}
            value={newOwner}
            onChange={e => {
              setNewOwner(e.target.value)
            }}
          />
          <Flex
            fontSize="12px"
            align="center"
            height="40px"
            bg="#333"
            color="white"
            justify="center"
            py={1}
            px={2}
            w="100px"
            onClick={async () => {
              if (isNil($.loading)) {
                set("add_owner", "loading")
                const res = await fn(_addOwner)({
                  address: newOwner,
                  contractTxId,
                })
                if (/^Error:/.test(res)) {
                  alert("Something went wrong")
                } else {
                  setNewOwner("")
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
              "Add Owner"
            )}
          </Flex>
        </Flex>
      </Modal>
    )
  }
)
