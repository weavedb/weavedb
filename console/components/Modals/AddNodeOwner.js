import { useState } from "react"
import { Box, Flex, Input } from "@chakra-ui/react"
import { map, without, assoc, isNil, append } from "ramda"
import { inject } from "roidjs"
import { _addNodeOwner, _removeNodeOwner } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current", "temp_current_all"],
  ({ owners, updateGRPCNode, node, setNode, setAddNodeOwner, fn, set, $ }) => {
    const [newOwner, setNewOwner] = useState("")
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddNodeOwner(false)}
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
                      const res = await fn(_removeNodeOwner)({
                        address: v,
                        contractTxId: node.contract,
                        rpc: node.rpc,
                      })
                      if (/^Error:/.test(res)) {
                        alert("Something went wrong")
                      }

                      const _node = assoc(
                        "owners",
                        without([v], node.owners),
                        node
                      )
                      await updateGRPCNode(_node)
                      setNode(_node)
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
          })(node.owners)}
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
                  const res = await fn(_addNodeOwner)({
                    address: newOwner,
                    contractTxId: node.contract,
                    rpc: node.rpc,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                    return
                  }
                  const _node = assoc(
                    "owners",
                    append(newOwner, node.owners),
                    node
                  )
                  await updateGRPCNode(_node)
                  setNode(_node)
                  set(null, "loading")
                  setNewOwner("")
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
        </Box>
      </Flex>
    )
  }
)
