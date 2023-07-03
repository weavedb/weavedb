import { useState } from "react"
import { Box, Flex, Input, Textarea, Select } from "@chakra-ui/react"
import {
  pluck,
  concat,
  uniq,
  compose,
  map,
  isNil,
  includes,
  without,
  append,
  trim,
} from "ramda"
import { inject } from "roidjs"
import { read, deployDB, setupWeaveDB } from "../../lib/weavedb"
import { wallet_chains, latest, preset_rpcs, rpc_types } from "../../lib/const"
import Modal from "../Modal"

export default inject(
  [
    "owner_signing_in_modal",
    "loading",
    "temp_current",
    "temp_current_all",
    "tx_logs",
  ],
  ({
    newNetwork,
    setNewNetwork,
    newRPC2,
    _setContractTxId,
    setNetwork,
    addDB,
    contractTxId,
    setState,
    setCurrentDB,
    setNewRPCType,
    presetRPC,
    newRPCType,
    setPresetRPC,
    nodes,
    setNewHttp,
    newHttp,
    networks,
    port,
    setAddInstance,
    fn,
    set,
    $,
    deployMode,
    setDeployMode,
  }) => {
    const [secure, setSecure] = useState(true)
    const [version, setVersion] = useState("0.26.4")
    const [canEvolve, setCanEvolve] = useState(true)
    const [auths, setAuths] = useState(wallet_chains)
    const [newAuths, setNewAuths] = useState(wallet_chains)
    const [newContractTxId, setNewContractTxId] = useState("")
    const [editNetwork, setEditNetwork] = useState(false)
    const [newRPC, setNewRPC] = useState("")

    return (
      <Modal title="WeaveDB Instance" close={setAddInstance}>
        <Flex>
          {map(v => {
            return (
              <Flex
                justify="center"
                align="center"
                onClick={() => setDeployMode(v)}
                mb={3}
                mr={2}
                px={3}
                py={1}
                bg={deployMode === v ? "#333" : "#ddd"}
                sx={{
                  borderRadius: "3px",
                  fontSize: "12px",
                  ":hover": { opacity: 0.75 },
                  cursor: "pointer",
                  color: deployMode === v ? "#ddd" : "#333",
                }}
              >
                {v}
              </Flex>
            )
          })(["Connect", "Deploy"])}
        </Flex>
        {deployMode === "Deploy" && newNetwork === "Mainnet" ? (
          <>
            <Flex fontSize="10px" m={1}>
              Version
            </Flex>
            <Select
              w="100%"
              value={version}
              onChange={e => setVersion(e.target.value)}
              sx={{ borderRadius: "5px 0 0 5px" }}
              mb={3}
            >
              {map(v => <option value={v}>{v}</option>)([
                "0.26.4",
                "0.26.3",
                "0.26.2",
                "0.26.1",
                //"0.27.0-alpha",
              ])}
            </Select>
          </>
        ) : null}
        <Flex fontSize="10px" m={1}>
          Network
        </Flex>
        <Select
          w="100%"
          value={newNetwork}
          onChange={e => setNewNetwork(e.target.value)}
          sx={{ borderRadius: "5px 0 0 5px" }}
          mb={3}
        >
          {map(v => <option value={v}>{v}</option>)(
            isNil(port) ? ["Mainnet"] : networks
          )}
        </Select>
        {deployMode === "Deploy" ? (
          <>
            <Flex fontSize="10px" m={1}>
              <Box>Contract Owner</Box>
              <Box flex={1} />
              {isNil($.temp_current_all) ? null : (
                <Box
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  mr={2}
                  onClick={() => {
                    set(true, "owner_signing_in_modal")
                  }}
                  color="#6441AF"
                >
                  change
                </Box>
              )}
            </Flex>
            {isNil($.temp_current_all) ? (
              <Flex
                sx={{
                  borderRadius: "3px",
                  border: "1px solid #333",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                p={2}
                justify="center"
                align="center"
                color="#333"
                onClick={async () => {
                  set(true, "owner_signing_in_modal")
                }}
              >
                Connect Owner Wallet
              </Flex>
            ) : (
              <Input
                flex={1}
                py={2}
                px={4}
                disabled={true}
                value={$.temp_current_all.addr || ""}
                sx={{ borderRadius: "3px" }}
              />
            )}
            <Flex mt={3}>
              <Box flex={1}>
                <Flex fontSize="10px" mx={1} my={1}>
                  Secure
                </Flex>
                <Select
                  w="100%"
                  value={secure ? "True" : "False"}
                  onChange={e => setSecure(e.target.value === "True")}
                  sx={{ borderRadius: "5px 0 0 5px" }}
                  mb={3}
                >
                  {map(v => <option value={v}>{v}</option>)(["True", "False"])}
                </Select>
              </Box>
              <Box flex={1} ml={1}>
                <Flex fontSize="10px" mx={1} my={1}>
                  canEvolve
                </Flex>
                <Select
                  w="100%"
                  value={canEvolve ? "True" : "False"}
                  onChange={e => setCanEvolve(e.target.value === "True")}
                  sx={{ borderRadius: "5px 0 0 5px" }}
                  mb={3}
                >
                  {map(v => <option value={v}>{v}</option>)(["True", "False"])}
                </Select>
              </Box>
            </Flex>
            <Flex fontSize="10px" mx={1} my={1}>
              Authentication
            </Flex>
            <Flex wrap="wrap">
              {map(v => (
                <Flex mx={2} align="center">
                  <Box
                    onClick={() => {
                      if (includes(v)(auths)) {
                        setAuths(without([v], auths))
                      } else {
                        setAuths(append(v, auths))
                      }
                    }}
                    className={
                      includes(v)(auths)
                        ? "fas fa-check-square"
                        : "far fa-square"
                    }
                    mr={2}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                  />
                  <Box>{v}</Box>
                </Flex>
              ))([
                "Arweave",
                "EVM",
                "DFINITY",
                "Intmax",
                "Lens" /*, "WebAuthn"*/,
              ])}
            </Flex>
          </>
        ) : (
          <>
            <Flex fontSize="10px" m={1}>
              ContractTxId
            </Flex>
            <Input
              p={2}
              flex={1}
              value={newContractTxId}
              onChange={e => setNewContractTxId(trim(e.target.value))}
            />
          </>
        )}

        {deployMode === "Deploy" ? (
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
            height="40px"
            color="white"
            bg="#333"
            onClick={async () => {
              if ($.loading === null) {
                set("deploy", "loading")
                try {
                  const res = await fn(deployDB)({
                    version: version.split("-")[0],
                    port: port,
                    owner: $.temp_current_all.addr,
                    network: newNetwork,
                    secure,
                    canEvolve,
                    auths,
                  })
                  if (!isNil(res.contractTxId)) {
                    addDB(res)
                    setAddInstance(false)
                    if (isNil(contractTxId)) {
                      setState(null)
                      setNetwork(res.network)
                      setCurrentDB(res)
                      await _setContractTxId(
                        res.contractTxId,
                        res.network,
                        res.rpc
                      )
                    }
                  }
                } catch (e) {
                  alert("something went wrong")
                  console.log(e)
                }
                set(null, "loading")
              }
            }}
          >
            {$.loading === "deploy" ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              "Deploy DB Instance"
            )}
          </Flex>
        ) : (
          <>
            <Flex fontSize="10px" mx={1} mb={1} mt={3}>
              RPC URL (Optional)
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
                    value={newRPC}
                    onChange={e => setNewRPC(trim(e.target.value))}
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
                  if (!/^\s*$/.test(newContractTxId)) {
                    set("connect_to_db", "loading")
                    let db
                    const rpc =
                      newRPCType === "sdk"
                        ? null
                        : newRPCType === "preset"
                        ? presetRPC
                        : newHttp + newRPC2
                    try {
                      db = await fn(setupWeaveDB)({
                        network: newNetwork,
                        contractTxId: newContractTxId,
                        port: port || 1820,
                        rpc,
                      })
                      let state = await fn(read)({
                        db,
                        m: "getInfo",
                        q: [true],
                      })
                      if (!isNil(state.version)) {
                        if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(state.version)) {
                          alert("version not compatible")
                        } else if (+state.version.split(".")[1] < 18) {
                          alert(
                            "Web Console is only compatible with v0.18 and above."
                          )
                        } else {
                          setNetwork(newNetwork)
                          let newdb = {
                            network: newNetwork,
                            port: newNetwork === "Localhost" ? port : 443,
                            contractTxId: newContractTxId,
                            rpc,
                          }
                          setCurrentDB(newdb)
                          await _setContractTxId(
                            newContractTxId,
                            newNetwork,
                            rpc
                          )
                          setEditNetwork(false)
                          addDB(newdb)
                          setAddInstance(false)
                          setNewContractTxId("")
                          setNewRPC("")
                        }
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
        )}
      </Modal>
    )
  }
)
