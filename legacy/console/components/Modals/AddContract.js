import { useState } from "react"
import { Box, Flex, Input } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { read, setupWeaveDB, _admin } from "../../lib/weavedb"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current_all", "temp_current", "tx_logs"],
  ({ setAddContract, node, setContracts, fn, set, $ }) => {
    const [newContract, setNewContract] = useState("")
    return (
      <Modal title="Add Contract" close={setAddContract}>
        <Flex>
          <Input
            value={newContract}
            placeholder="contractTxId"
            onChange={e => setNewContract(e.target.value)}
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
              set("add_contract", "loading")
              if (/^\s*$/.test(newContract)) {
                alert("enter contractTxId")
                set(null, "loading")
                return
              }
              const res = await fn(_admin)({
                contractTxId: node.contract,
                txid: newContract,
                rpc: node.rpc,
              })
              if (/^Error:/.test(res)) {
                alert("Something went wrong")
              } else {
                setNewContract("")
                setAddContract(false)

                const db = await fn(setupWeaveDB)({
                  contractTxId: node.contract,
                  rpc: node.rpc,
                })
                const addr = /^0x.+$/.test($.temp_current_all.addr)
                  ? $.temp_current_all.addr.toLowerCase()
                  : $.temp_current_all.addr
                setContracts(
                  await fn(read)({
                    db,
                    m: "get",
                    q: ["contracts", ["address", "=", addr], true],
                  })
                )
              }
              set(null, "loading")
            }
          }}
        >
          {!isNil($.loading) ? (
            <Box as="i" className="fas fa-spin fa-circle-notch" />
          ) : (
            "Add Contract"
          )}
        </Flex>
      </Modal>
    )
  }
)
