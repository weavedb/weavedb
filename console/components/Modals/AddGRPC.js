import { useState } from "react"
import { Box, Flex, Input, Select } from "@chakra-ui/react"
import { isNil, map, compose, concat, uniq, pluck, trim, assoc } from "ramda"
import { inject } from "roidjs"
import { setupWeaveDB, read } from "../../lib/weavedb"
import { preset_rpcs, rpc_types } from "../../lib/const"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    setEditGRPC,
    editGRPC,
    setAddGRPC,
    setNewNetwork,
    port,
    networks,
    currentDB,
    setNewRPCType,
    newRPCType,
    presetRPC,
    setPresetRPC,
    setState,
    updateDB,
    setCurrentDB,
    _setContractTxId,
    nodes,
    newHttp,
    setNewHttp,
    newRPC2,
    setNewRPC2,
    fn,
    set,
    $,
  }) => {
    const cdb = editGRPC || currentDB
    return (
      <Modal title="Connect with Node" close={setAddGRPC}>
        <Flex fontSize="10px" m={1}>
          Network
        </Flex>
        <Select
          w="100%"
          disabled={true}
          value={cdb.network}
          onChange={e => setNewNetwork(e.target.value)}
          sx={{ borderRadius: "5px 0 0 5px" }}
          mb={3}
        >
          {map(v => <option value={v}>{v}</option>)(
            isNil(port) ? ["Mainnet"] : networks
          )}
        </Select>
        <>
          <Flex fontSize="10px" m={1}>
            ContractTxId
          </Flex>
          <Input
            p={2}
            flex={1}
            value={cdb.contractTxId}
            disabled={true}
            sx={{ borderRadius: 0 }}
          />
        </>

        <>
          <Flex fontSize="10px" mx={1} mb={1} mt={3}>
            RPC URL
          </Flex>
          <Flex>
            <Select
              mr={2}
              w="130px"
              value={newRPCType}
              onChange={e => setNewRPCType(e.target.value)}
              sx={{ borderRadius: 0 }}
            >
              {map(v => <option value={v.key}>{v.name}</option>)(rpc_types)}
            </Select>
            {newRPCType === "sdk" ? (
              <Input flex={1} value="Browser Local Cache" disabled={true} />
            ) : newRPCType === "preset" ? (
              <>
                <Select
                  flex={1}
                  value={presetRPC}
                  onChange={e => setPresetRPC(e.target.value)}
                  sx={{ borderRadius: 0 }}
                >
                  {map(v => <option>{v}</option>)(
                    compose(uniq, concat(preset_rpcs), pluck("rpc"))(nodes)
                  )}
                </Select>
              </>
            ) : (
              <>
                <Select
                  w="100px"
                  value={newHttp}
                  onChange={e => setNewHttp(e.target.value)}
                  sx={{ borderRadius: 0 }}
                >
                  {map(v => <option>{v}</option>)(["https://", "http://"])}
                </Select>
                <Input
                  placeholder="grpc.example.com"
                  flex={1}
                  value={newRPC2}
                  onChange={e => setNewRPC2(trim(e.target.value))}
                  sx={{ borderRadius: 0 }}
                />
              </>
            )}
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
                try {
                  set("connect_to_db", "loading")
                  const rpc =
                    newRPCType === "sdk"
                      ? null
                      : newRPCType === "preset"
                      ? presetRPC
                      : newHttp + newRPC2
                  const db = await fn(setupWeaveDB)({
                    network: newHttp === "https://" ? "Mainnet" : "Localhost",
                    contractTxId: cdb.contractTxId,
                    rpc,
                  })
                  let state = await fn(read)({ db, m: "getInfo", q: [true] })
                  if (!isNil(state.version)) {
                    setState(null)
                    const newDB = assoc("rpc", rpc, cdb)
                    updateDB(newDB)
                    setCurrentDB(newDB)
                    setAddGRPC(false)
                    setEditGRPC(null)
                    setNewRPC2("")
                    await _setContractTxId(
                      cdb.contractTxId,
                      newHttp === "https://" ? "Mainnet" : "Localhost",
                      rpc,
                      db,
                      state
                    )
                  } else {
                    alert(
                      "couldn't connect to the contract. Web Console is only compatible with v0.18 and above."
                    )
                  }
                } catch (e) {
                  console.log(e)
                  alert(
                    "couldn't connect to the contract. Web Console is only compatible with v0.18 and above."
                  )
                }
                set(null, "loading")
              }
            }}
          >
            {$.loading === "connect_to_db" ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              "Connect to DB"
            )}
          </Flex>
        </>
      </Modal>
    )
  }
)
