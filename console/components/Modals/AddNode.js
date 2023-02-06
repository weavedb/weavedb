import { useState } from "react"
import { Box, Flex, Input, Textarea, Select } from "@chakra-ui/react"
import { map, isNil } from "ramda"
import { inject } from "roidjs"
import { setupWeaveDB } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current"],
  ({ addGRPCNode, setAddNode, fn, set, $ }) => {
    const [newHttp, setNewHttp] = useState("https://")
    const [newNode, setNewNode] = useState("")
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddNode(false)}
        justify="center"
        align="center"
      >
        <Box
          bg="white"
          width="500px"
          p={3}
          sx={{ borderRadius: "5px", cursor: "default" }}
          onClick={e => e.stopPropagation()}
        >
          <Flex>
            <Select
              w="150px"
              value={newHttp}
              onChange={e => setNewHttp(e.target.value)}
            >
              {map(v => <option>{v}</option>)(["https://", "http://"])}
            </Select>
            <Input
              value={newNode}
              placeholder="Node RPC URL"
              onChange={e => setNewNode(e.target.value)}
              sx={{
                borderRadius: "3px",
              }}
            />
          </Flex>
          <Flex
            mt={4}
            sx={{
              borderRadius: "3px",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
            p={2}
            justify="center"
            align="center"
            color="white"
            bg="#333"
            height="40px"
            onClick={async () => {
              if (isNil($.loading)) {
                set("add_node", "loading")
                if (/^\s*$/.test(newNode)) {
                  alert("enter URL")
                  set(null, "loading")
                  return
                }
                try {
                  const db = await fn(setupWeaveDB)({
                    contractTxId: "node",
                    rpc: newHttp + newNode,
                  })
                  const stats = await db.node({ op: "stats" })
                  if (isNil(stats.contractTxId)) throw new Error()
                  await addGRPCNode({
                    contract: stats.contractTxId,
                    rpc: newHttp + newNode,
                    owners: stats.owners,
                  })
                  setNewNode("")
                  setAddNode(false)
                } catch (e) {
                  alert("couldn't connect with the node")
                }
                set(null, "loading")
              }
            }}
          >
            {!isNil($.loading) ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              "Add Node"
            )}
          </Flex>
        </Box>
      </Flex>
    )
  }
)
