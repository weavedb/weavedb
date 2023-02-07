import { useState } from "react"
import {
  Image,
  Checkbox,
  Select,
  Box,
  Flex,
  Input,
  Textarea,
} from "@chakra-ui/react"
import {
  assoc,
  pluck,
  includes,
  uniq,
  without,
  o,
  sortBy,
  join,
  compose,
  append,
  indexBy,
  prop,
  map,
  isNil,
  concat,
  trim,
} from "ramda"
import { inject } from "roidjs"
import {
  _admin,
  _removeOwner,
  _addOwner,
  _setAlgorithms,
  _removeNodeOwner,
  _addNodeOwner,
  _setCanEvolve,
  _migrate,
  _evolve,
  _setSecure,
  deployDB,
  _whitelist,
  connectLocalhost,
  connectAddress,
  createTempAddress,
  connectAddressWithII,
  createTempAddressWithII,
  connectAddressWithAR,
  createTempAddressWithAR,
  queryDB,
  addRelayerJob,
  setupWeaveDB,
} from "../lib/weavedb"
import { latest, preset_rpcs, rpc_types } from "../lib/const"

import AddCollection from "./Modals/AddCollection"
import AddDoc from "./Modals/AddDoc"
import AddData from "./Modals/AddData"
import AddSchema from "./Modals/AddSchema"
import AddCron from "./Modals/AddCron"
import AddRelayer from "./Modals/AddRelayer"
import AddNode from "./Modals/AddNode"
import AddContract from "./Modals/AddContract"
import AddInstance from "./Modals/AddInstance"
import Connect from "./Modals/Connect"
import AddRules from "./Modals/AddRules"

import AddOwner from "./Modals/AddOwner"
import AddNodeOwner from "./Modals/AddNodeOwner"
import AddAlgorithms from "./Modals/AddAlgorithms"
import AddCanEvolve from "./Modals/AddCanEvolve"
import AddEvolve from "./Modals/AddEvolve"
import AddSecure from "./Modals/AddSecure"
import AddWhitelist from "./Modals/AddWhitelist"
import AddGRPC from "./Modals/AddGRPC"

export default inject(
  [
    "temp_current",
    "signing_in",
    "signing_in_modal",
    "owner_signing_in_modal",
    "loading",
    "temp_current_all",
  ],
  ({
    setNewNetwork,
    newNetwork,
    doc,
    nodes,
    presetRPC,
    setPresetRPC,
    newRPCType,
    setNewRPCType,
    newStart,
    addDB,
    addWhitelist,
    editWhitelist,
    numLimit,
    setNumLimit,
    setWhitelist,
    addGRPC,
    currentDB,
    newRPC2,
    updateDB,
    newPort,
    setPort,
    network,
    tab,
    setNewPort,
    setConnect,
    setNewRPC2,
    setAddGRPC,
    allow,
    limit,
    setLimit,
    setAllow,
    newWhitelistUser,
    setNewWhitelistUser,
    setAddWhitelist,
    setEditWhitelist,
    setNetwork,
    setCurrentDB,
    _setContractTxId,
    newContractTxId,
    setNewContractTxId,
    networks,
    addSecure,
    setAddSecure,
    addIndex,
    setAddIndex,
    newIndex,
    indexes,
    setIndexes,
    addInstance,
    port,
    setAddInstance,
    setNewIndex,
    state,
    setAddEvolve,
    addEvolve,
    addCanEvolve,
    setAddCanEvolve,
    updateGRPCNode,
    setNode,
    addNodeOwner,
    setAddNodeOwner,
    addNode,
    addGRPCNode,
    setAddNode,
    addContract,
    setAddContract,
    setContracts,
    setRules,
    addOwner,
    setAddOwner,
    owners,
    setState,
    setAddAlgorithms,
    addAlgorithms,
    newAuths,
    setNewAuths,
    setAddRules,
    addRules,
    node,
    newHttp,
    setNewHttp,
    setCrons,
    addRelayer,
    setAddRelayer,
    setRelayers,
    setDocdata,
    setAddSchema,
    addSchema,
    setSchema,
    setAddCron,
    addCron,
    doc_path,
    setSubCollections,
    docdata,
    addData,
    setAddData,
    setCollections,
    db,
    setAddDoc,
    addDoc,
    col,
    setDocuments,
    documents,
    contractTxId,
    connect,
    base_path,
    addCollection,
    setAddCollection,
    fn,
    $,
    set,
  }) => (
    <>
      {addCollection !== false ? (
        <AddCollection
          {...{
            setAddCollection,
            documents,
            base_path,
            contractTxId,
            setCollections,
            db,
          }}
        />
      ) : addDoc !== false ? (
        <AddDoc
          {...{
            setDocuments,
            db,
            contractTxId,
            documents,
            setAddDoc,
            col,
            base_path,
          }}
        />
      ) : addData !== false ? (
        <AddData
          {...{
            col,
            doc,
            contractTxId,
            base_path,
            doc_path,
            docdata,
            db,
            setSubCollections,
            setDocdata,
            setAddData,
            fn,
            set,
            $,
          }}
        />
      ) : addSchema !== false ? (
        <AddSchema
          {...{
            db,
            doc_path,
            setSchema,
            setAddSchema,
            contractTxId,
            col,
            base_path,
          }}
        />
      ) : addCron !== false ? (
        <AddCron {...{ db, contractTxId, setCrons, setAddCron }} />
      ) : addRelayer !== false ? (
        <AddRelayer {...{ setRelayers, contractTxId, db, setAddRelayer }} />
      ) : addNode !== false ? (
        <AddNode {...{ addGRPCNode, setAddNode }} />
      ) : addContract !== false ? (
        <AddContract {...{ setAddContract, node, setContracts }} />
      ) : addRules !== false ? (
        <AddRules
          {...{
            db,
            doc_path,
            setRules,
            setAddRules,
            col,
            base_path,
            contractTxId,
          }}
        />
      ) : addOwner !== false ? (
        <AddOwner {...{ setState, setAddOwner, owners, contractTxId, db }} />
      ) : addNodeOwner !== false ? (
        <AddNodeOwner
          {...{
            owners,
            updateGRPCNode,
            node,
            setNode,
            setAddNodeOwner,
          }}
        />
      ) : addAlgorithms !== false ? (
        <AddAlgorithms
          {...{
            db,
            contractTxId,
            setState,
            setNewAuths,
            newAuths,
            setAddAlgorithms,
            fn,
            set,
            $,
          }}
        />
      ) : addCanEvolve !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddCanEvolve(false)}
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
                    const res = await fn(_setCanEvolve)({
                      value: !state.canEvolve,
                      contractTxId,
                    })
                    if (/^Error:/.test(res)) {
                      alert("Something went wrong")
                    }
                    setState(await db.getInfo(true))
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
          </Box>
        </Flex>
      ) : addEvolve !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddEvolve(false)}
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
                    }
                    setState(await db.getInfo(true))
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
          </Box>
        </Flex>
      ) : addSecure !== false ? (
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
                    }
                    setState(await db.getInfo(true))
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
      ) : addIndex !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddIndex(false)}
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
            <Textarea
              mt={3}
              value={newIndex}
              placeholder="Compound Index"
              onChange={e => setNewIndex(e.target.value)}
              sx={{
                borderRadius: "3px",
              }}
            />
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
                  const exIndex = !/^\s*$/.test(newIndex)
                  if (!exIndex) {
                    alert("Enter rules")
                    return
                  }
                  let val = null
                  let obj
                  try {
                    eval(`obj = ${newIndex}`)
                    if (!is(Array, obj)) {
                      alert("Index must be an array")
                      return
                    }
                    if (obj.length < 2) {
                      alert("Compound Index must have at least 2 fields")
                      return
                    }
                    val = newIndex
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  const serialize = v =>
                    map(v2 => {
                      let v3 = clone(v2)
                      if (v3.length < 2) v3.push("asc")
                      return join(":")(v2)
                    })(v).join(",")
                  if (
                    compose(includes(serialize(obj)), map(serialize))(indexes)
                  ) {
                    alert("Index exists")
                    return
                  }
                  set("add_index", "loading")
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  let query = `${newIndex}, ${col_path}`
                  const res = JSON.parse(
                    await fn(queryDB)({
                      method: "addIndex",
                      query,
                      contractTxId,
                    })
                  )
                  if (!res.success) {
                    alert("Something went wrong")
                  } else {
                    setNewIndex("[]")
                    setAddIndex(false)
                    setIndexes(
                      await db.getIndexes(
                        ...(doc_path.length % 2 === 0
                          ? doc_path.slice(0, -1)
                          : doc_path),
                        true
                      )
                    )
                  }
                  set(null, "loading")
                }
              }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                "Add"
              )}
            </Flex>
          </Box>
        </Flex>
      ) : addInstance !== false ? (
        <AddInstance
          {...{
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
          }}
        />
      ) : addWhitelist !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => {
            setAddWhitelist(false)
            setEditWhitelist(false)
          }}
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
            <>
              <Flex fontSize="10px" m={1}>
                <Box>Contract Owner</Box>
              </Flex>
              <Input
                flex={1}
                disabled={editWhitelist}
                value={newWhitelistUser || ""}
                sx={{ borderRadius: "5px" }}
                onChange={e => setNewWhitelistUser(e.target.value)}
              />
              <Flex mt={3}>
                <Box flex={1}>
                  <Flex fontSize="10px" mx={1} my={1}>
                    Allow
                  </Flex>
                  <Select
                    w="100%"
                    value={allow ? "True" : "False"}
                    onChange={e => setAllow(e.target.value === "True")}
                    sx={{ borderRadius: "5px" }}
                    mb={3}
                  >
                    {map(v => <option value={v}>{v}</option>)([
                      "True",
                      "False",
                    ])}
                  </Select>
                </Box>
                <Box flex={1} ml={1}>
                  <Flex fontSize="10px" mx={1} my={1}>
                    Limit
                  </Flex>
                  <Select
                    disabled={!allow}
                    w="100%"
                    value={limit ? "True" : "False"}
                    onChange={e => setLimit(e.target.value === "True")}
                    sx={{ borderRadius: "5px" }}
                    mb={3}
                  >
                    {map(v => <option value={v}>{v}</option>)([
                      "True",
                      "False",
                    ])}
                  </Select>
                </Box>
                <Box flex={1} ml={1}>
                  <Flex fontSize="10px" mx={1} my={1}>
                    How many Contracts?
                  </Flex>
                  <Input
                    w="100%"
                    value={numLimit}
                    disabled={!limit || !allow}
                    onChange={e => {
                      if (!Number.isNaN(+e.target.value * 1)) {
                        setNumLimit(e.target.value)
                      }
                    }}
                    sx={{ borderRadius: "5px" }}
                    mb={3}
                  />
                </Box>
              </Flex>
            </>
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
                  set("whitelist", "loading")
                  if (/^\s*$/.test(newWhitelistUser)) {
                    alert("enter address")
                    return
                  }

                  try {
                    const res = await fn(_whitelist)({
                      contractTxId: node.contract,
                      rpc: node.rpc,
                      address: newWhitelistUser,
                      allow,
                      limit: limit ? +numLimit : null,
                    })
                    if (/^Error:/.test(res)) {
                      alert("Something went wrong")
                      return
                    }
                    const db = await fn(setupWeaveDB)({
                      contractTxId: node.contract,
                      rpc: node.rpc,
                    })
                    setWhitelist(await db.get("users", true))
                    setNewWhitelistUser("")
                    setAddWhitelist(false)
                    setEditWhitelist(false)
                  } catch (e) {
                    alert("something went wrong")
                    console.log(e)
                  }
                  set(null, "loading")
                }
              }}
            >
              {$.loading === "whitelist" ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : editWhitelist ? (
                "Update Address"
              ) : (
                "Add to Whitelist"
              )}
            </Flex>
          </Box>
        </Flex>
      ) : addGRPC !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddGRPC(false)}
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
            <Flex fontSize="10px" m={1}>
              Network
            </Flex>
            <Select
              w="100%"
              disabled={true}
              value={currentDB.network}
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
                flex={1}
                value={currentDB.contractTxId}
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
                    set("connect_to_db", "loading")
                    const rpc =
                      newRPCType === "sdk"
                        ? null
                        : newRPCType === "preset"
                        ? presetRPC
                        : newHttp + newRPC2
                    const db = await fn(setupWeaveDB)({
                      network: newHttp === "https://" ? "Mainnet" : "Localhost",
                      contractTxId: currentDB.contractTxId,
                      rpc,
                    })
                    let state = await db.getInfo(true)
                    if (!isNil(state.version)) {
                      setState(null)
                      const newDB = assoc("rpc", rpc, currentDB)
                      updateDB(newDB)
                      setCurrentDB(newDB)
                      setAddGRPC(false)
                      setNewRPC2("")
                      await _setContractTxId(
                        currentDB.contractTxId,
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
          </Box>
        </Flex>
      ) : connect !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setConnect(false)}
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
            <>
              <Flex fontSize="10px" m={1}>
                Port
              </Flex>
              <Input
                flex={1}
                value={newPort}
                sx={{ borderRadius: 0 }}
                onChange={e => {
                  if (!Number.isNaN(e.target.value * 1)) {
                    setNewPort(e.target.value * 1)
                  }
                }}
              />
            </>
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
              onClick={async () => {
                const _port = await fn(connectLocalhost)({
                  port: newPort,
                })
                if (isNil(_port)) {
                  alert("couldn't connect with the port")
                } else {
                  setPort(_port)
                  setConnect(false)
                }
              }}
            >
              Connect
            </Flex>
          </Box>
        </Flex>
      ) : null}
      {$.signing_in_modal || $.owner_signing_in_modal ? (
        <Flex
          align="center"
          justify="center"
          sx={{
            bg: "rgba(0,0,0,.5)",
            position: "fixed",
            w: "100%",
            h: "100%",
            zIndex: 100,
            top: 0,
            left: 0,
            cursor: "pointer",
          }}
          onClick={() => {
            set(false, "signing_in_modal")
            set(false, "owner_signing_in_modal")
          }}
        >
          <Flex
            width="580px"
            wrap="wrap"
            p={4}
            justify="center"
            bg="white"
            sx={{ borderRadius: "10px", cursor: "default" }}
            onClick={e => e.stopPropagation()}
          >
            {$.signing_in ? (
              <Flex
                justify="center"
                align="center"
                direction="column"
                boxSize="150px"
                p={4}
                m={4}
                color="#333"
                bg="white"
                sx={{
                  borderRadius: "10px",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                onClick={async () => set(false, "signing_in")}
              >
                <Box
                  fontSize="50px"
                  mb={3}
                  as="i"
                  className="fas fa-spin fa-circle-notch"
                />
                <Box textAlign="center">cancel sign-in</Box>
              </Flex>
            ) : (
              <Connect {...{ newNetwork, contractTxId, network, tab }} />
            )}
          </Flex>
        </Flex>
      ) : null}
    </>
  )
)
