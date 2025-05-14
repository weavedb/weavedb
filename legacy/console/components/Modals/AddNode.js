import { useState } from "react"
import { Box, Flex, Input, Textarea, Select } from "@chakra-ui/react"
import { map, isNil } from "ramda"
import { inject } from "roidjs"
import { read, setupWeaveDB } from "../../lib/weavedb"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({ addGRPCNode, setAddNode, fn, set, $ }) => {
    const [newHttp, setNewHttp] = useState("https://")
    const [newNode, setNewNode] = useState("")
    return (
      <Modal title="gRPC Nodes" close={setAddNode}>
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
                const start = Date.now()
                const stats = await fn(read)({
                  db,
                  m: "node",
                  q: { op: "stats" },
                  arr: false,
                })
                const queryTime = Date.now() - start
                if (isNil(stats.contractTxId)) throw new Error()
                await addGRPCNode({
                  queryTime,
                  contract: stats.contractTxId,
                  rpc: newHttp + newNode,
                  owners: stats.owners,
                })
                setNewNode("")
                setAddNode(false)
              } catch (e) {
                console.log(e)
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
      </Modal>
    )
  }
)
