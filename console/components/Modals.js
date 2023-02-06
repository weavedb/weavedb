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
    nodes,
    presetRPC,
    setPresetRPC,
    newRPCType,
    setNewRPCType,
    newStart,
    addDB,
    newRPC,
    setEditNetwork,
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
    setNewRPC,
    setNetwork,
    setCurrentDB,
    _setContractTxId,
    secure,
    auths,
    canEvolve,
    setCanEvolve,
    newContractTxId,
    setNewContractTxId,
    setAuths,
    setSecure,
    networks,
    addSecure,
    setAddSecure,
    addIndex,
    setAddIndex,
    newIndex,
    indexes,
    setIndexes,
    addInstance,
    setDeployMode,
    newNetwork,
    setNewNetwork,
    port,
    deployMode,
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
    newSigners,
    setNewSigners,
    setNewJobSchema,
    newJobSchema,
    addNode,
    addGRPCNode,
    setAddNode,
    addContract,
    setAddContract,
    setNewContract,
    setContracts,
    setNewRules2,
    setRules,
    addOwner,
    setAddOwner,
    owners,
    setState,
    setAddAlgorithms,
    addAlgorithms,
    newAuths,
    setNewAuths,
    newOwner,
    setNewOwner,
    newRules2,
    setAddRules,
    addRules,
    node,
    newContract,
    newHttp,
    setNewHttp,
    setNewNode,
    newNode,
    newSigner,
    setNewSigner,
    newMultisig,
    setNewMultisig,
    newMultisigType,
    setNewMultisigType,
    newSpan,
    newCron,
    setCrons,
    addRelayer,
    setNewRelayers,
    newRelayer,
    setNewRelayer,
    setAddRelayer,
    newRelayers,
    newJobName,
    setNewJobName,
    setRelayers,
    setNewCron,
    setNewSpan,
    newTimes,
    setNewTimes,
    setDocdata,
    setAddSchemas,
    newSchemas,
    addSchemas,
    setSchema,
    setAddCron,
    newCronName,
    addCron,
    setNewStart,
    newDo,
    setNewDo,
    newEnd,
    setNewEnd,
    setNewCronName,
    setNewSchemas,
    doc_path,
    setSubCollections,
    newFieldType,
    newField,
    setNewField,
    newFieldVal,
    setNewFieldVal,
    docdata,
    newFieldBool,
    setNewFieldBool,
    setNewFieldType,
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
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddData(false)}
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
                value={newFieldType}
                onChange={e => setNewFieldType(e.target.value)}
              >
                {map(v => <option value={v}>{v}</option>)([
                  "string",
                  "bool",
                  "number",
                  "object",
                  "null",
                  "sub collection",
                ])}
              </Select>
              <Input
                value={newField}
                placeholder={
                  newFieldType === "sub collection"
                    ? "Collection ID"
                    : "Field Key"
                }
                onChange={e => setNewField(e.target.value)}
                sx={{
                  borderRadius: "3px",
                }}
              />
            </Flex>
            {newFieldType === "bool" ? (
              <Select
                mt={3}
                value={newFieldBool}
                onChange={e => setNewFieldBool(eval(e.target.value))}
              >
                {map(v => <option value={v}>{v ? "true" : "false"}</option>)([
                  true,
                  false,
                ])}
              </Select>
            ) : (
              <Textarea
                mt={3}
                value={newFieldType === "null" ? "null" : newFieldVal}
                placeholder={
                  newFieldType === "sub collection"
                    ? "Access Control Rules"
                    : "Field Value"
                }
                onChange={e => setNewFieldVal(e.target.value)}
                disabled={newFieldType === "null"}
                sx={{
                  borderRadius: "3px",
                }}
              />
            )}
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
                  const exID = !/^\s*$/.test(newField)
                  const exVal =
                    includes(newFieldType)(["bool", "null"]) ||
                    !/^\s*$/.test(newFieldVal)
                  if (!exVal) alert("Enter a value")
                  if (!exID) alert("Enter field key")
                  if (exID && !isNil(docdata.data[newField])) {
                    alert("Field exists")
                    return
                  }
                  let val = null
                  switch (newFieldType) {
                    case "number":
                      if (Number.isNaN(newFieldVal * 1)) {
                        alert("Enter a number")
                        return
                      }
                      val = newFieldVal * 1
                      break
                    case "string":
                      val = `"${newFieldVal}"`
                      break
                    case "bool":
                      val = eval(newFieldBool)
                      break
                    case "object":
                      try {
                        eval(`const obj = ${newFieldVal}`)
                        val = newFieldVal
                      } catch (e) {
                        alert("Wrong JSON format")
                        return
                      }
                      break
                    case "sub collection":
                      if (/^\s*$/.test(newField)) {
                        alert("Enter Collection ID")
                        return
                      } else if (!isNil(docdata.data[newField])) {
                        alert("Collection exists")
                        return
                      }
                      try {
                        JSON.parse(newFieldVal)
                        val = newFieldVal
                      } catch (e) {
                        alert("Wrong JSON format")
                        return
                      }
                      break
                  }
                  set("add_data", "loading")
                  let query = ""
                  let method = ""
                  if (newFieldType === "sub collection") {
                    method = "setRules"
                    query = `${val}, ${compose(
                      join(", "),
                      map(v => `"${v}"`),
                      append(newField)
                    )(doc_path)}`
                  } else {
                    method = "update"
                    let _doc_path = compose(
                      join(", "),
                      map(v => `"${v}"`),
                      concat(base_path)
                    )([col, doc])
                    query = `{ "${newField}": ${val}}, ${_doc_path}`
                  }
                  const res = JSON.parse(
                    await fn(queryDB)({
                      method,
                      query,
                      contractTxId,
                    })
                  )
                  if (!res.success) {
                    alert("Something went wrong")
                  } else {
                    setNewField("")
                    setNewFieldVal("")
                    setAddData(false)
                    setDocdata(await db.cget(...doc_path, true))
                    setSubCollections(
                      await db.listCollections(...doc_path, true)
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
      ) : addSchemas !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddSchemas(false)}
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
              value={newSchemas}
              placeholder="JSON Schema"
              onChange={e => setNewSchemas(e.target.value)}
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
              height="40px"
              bg="#333"
              onClick={async () => {
                if (isNil($.loading)) {
                  const exID = !/^\s*$/.test(newSchemas)
                  let val = null
                  try {
                    eval(`const obj = ${newSchemas}`)
                    val = newSchemas
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  set("add_schema", "loading")
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  let query = `${newSchemas}, ${col_path}`
                  const res = JSON.parse(
                    await fn(queryDB)({
                      method: "setSchema",
                      query,
                      contractTxId,
                    })
                  )
                  if (!res.success) {
                    alert("Something went wrong")
                  } else {
                    setNewSchemas("")
                    setAddSchemas(false)
                    setSchema(
                      await db.getSchema(
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
      ) : addCron !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddCron(false)}
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
              <Input
                value={newCronName}
                placeholder="Cron Name"
                onChange={e => setNewCronName(e.target.value)}
                sx={{
                  borderRadius: "3px",
                }}
              />
            </Flex>
            <Flex mt={4}>
              <Input
                mr={2}
                value={newStart}
                placeholder="Start"
                onChange={e => {
                  if (!Number.isNaN(e.target.value * 1)) {
                    setNewStart(e.target.value)
                  }
                }}
                sx={{
                  borderRadius: "3px",
                }}
              />
              <Input
                ml={2}
                value={newEnd}
                placeholder="End"
                onChange={e => {
                  if (!Number.isNaN(e.target.value * 1)) {
                    setNewEnd(e.target.value)
                  }
                }}
                sx={{
                  borderRadius: "3px",
                }}
              />
            </Flex>
            <Flex mt={4}>
              <Flex mx={2} align="center" flex={1}>
                <Checkbox
                  mr={2}
                  checked={newDo}
                  onClick={e => setNewDo(!newDo)}
                  sx={{
                    borderRadius: "3px",
                  }}
                />
                Do at Start
              </Flex>
              <Input
                flex={1}
                mr={2}
                value={newSpan}
                placeholder="Span"
                onChange={e => {
                  if (!Number.isNaN(e.target.value * 1)) {
                    setNewSpan(e.target.value)
                  }
                }}
                sx={{
                  borderRadius: "3px",
                }}
              />
              <Input
                flex={1}
                ml={2}
                value={newTimes}
                placeholder="Times"
                onChange={e => {
                  if (!Number.isNaN(e.target.value * 1)) {
                    setNewTimes(e.target.value)
                  }
                }}
                sx={{
                  borderRadius: "3px",
                }}
              />
            </Flex>
            <Textarea
              mt={3}
              value={newCron}
              placeholder="Cron Jobs"
              onChange={e => setNewCron(e.target.value)}
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
                  const exID = !/^\s*$/.test(newCronName)
                  if (!exID) {
                    alert("Enter Cron Name")
                    return
                  }
                  if (newSpan * 1 === 0) {
                    alert("Span must be greater than 0")
                  }
                  let val = null
                  try {
                    let obj = null
                    eval(`obj = ${newCron}`)
                    val = newCron
                    if (!is(Array)(obj)) {
                      alert("Jobs should be an array.")
                      return
                    }
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  set("add_cron", "loading")
                  try {
                    let query = `{times: ${newTimes || null}, start: ${
                      newStart || null
                    }, end: ${newEnd || null},do: ${
                      newDo ? "true" : "false"
                    }, span: ${
                      newSpan * 1
                    }, jobs: ${newCron}}, "${newCronName}"`
                    const res = JSON.parse(
                      await fn(queryDB)({
                        method: "addCron",
                        query,
                        contractTxId,
                      })
                    )
                    if (!res.success) {
                      alert("Something went wrong")
                    } else {
                      setNewCron("")
                      setNewStart("")
                      setNewCronName("")
                      setNewEnd("")
                      setNewTimes("")
                      setNewSpan("")
                      setAddCron(false)
                      setCrons(await db.getCrons(true))
                      setRelayers(await db.listRelayerJobs(true))
                    }
                  } catch (e) {
                    alert("Something went wrong")
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
      ) : addRelayer !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddRelayer(false)}
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
              <Input
                value={newJobName}
                placeholder="Job Name"
                onChange={e => setNewJobName(e.target.value)}
                sx={{
                  borderRadius: "3px",
                }}
              />
            </Flex>
            <Flex mt={3} mb={1} fontSize="10px">
              Relayers
            </Flex>
            {map(v => {
              return (
                <Flex mb={3} px={2} align="center" fontSize="12px">
                  <Flex flex={1}>{v}</Flex>
                  <Flex>
                    <Box
                      onClick={async () => {
                        setNewRelayers(without(v, newRelayers))
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
            })(newRelayers)}
            <Flex align="center">
              <Input
                flex={1}
                value={newRelayer}
                onChange={e => {
                  setNewRelayer(e.target.value)
                }}
                sx={{ borderRadius: "3px 0 0 3px" }}
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
                  if (!/^\s*.$/.test(newRelayer)) {
                    setNewRelayers(o(uniq, append(newRelayer))(newRelayers))
                    setNewRelayer("")
                  }
                }}
                sx={{
                  borderRadius: "0 3px 3px 0",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                {!isNil($.loading) ? (
                  <Box as="i" className="fas fa-spin fa-circle-notch" />
                ) : (
                  "Add Relayer"
                )}
              </Flex>
            </Flex>
            <Flex mt={4}>
              <Select
                value={newMultisigType}
                onChange={e => setNewMultisigType(e.target.value)}
              >
                {map(v => <option value={v}>{v}</option>)([
                  "none",
                  "number",
                  "percent",
                ])}
              </Select>
              <Input
                ml={2}
                value={newMultisig}
                placeholder="Multisig"
                onChange={e => {
                  if (!Number.isNaN(e.target.value * 1)) {
                    setNewMultisig(e.target.value)
                  }
                }}
                sx={{
                  borderRadius: "3px",
                }}
              />
            </Flex>
            <Flex mt={3} mb={1} fontSize="10px">
              Signers
            </Flex>
            {map(v => {
              return (
                <Flex mb={3} px={2} align="center" fontSize="12px">
                  <Flex flex={1}>{v}</Flex>
                  <Flex>
                    <Box
                      onClick={async () => {
                        setNewSigners(without(v, newSigners))
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
            })(newSigners)}
            <Flex align="center">
              <Input
                flex={1}
                value={newSigner}
                onChange={e => {
                  setNewSigner(e.target.value)
                }}
                sx={{ borderRadius: "3px 0 0 3px" }}
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
                  if (!/^\s*.$/.test(newSigner)) {
                    setNewSigners(o(uniq, append(newSigner))(newSigners))
                    setNewSigner("")
                  }
                }}
                sx={{
                  borderRadius: "0 3px 3px 0",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                {!isNil($.loading) ? (
                  <Box as="i" className="fas fa-spin fa-circle-notch" />
                ) : (
                  "Add Signer"
                )}
              </Flex>
            </Flex>
            <Textarea
              mt={3}
              value={newJobSchema}
              placeholder="Schema for Extra Data"
              onChange={e => setNewJobSchema(e.target.value)}
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
                  set("add_relayer", "loading")
                  try {
                    if (/^\s.*$/.test(newJobName)) {
                      alert("Enter job name")
                      return
                    }
                    let _schema = null
                    if (!/^\s.*$/.test(newJobSchema)) {
                      try {
                        _schema = JSON.parse(newJobSchema)
                      } catch (e) {
                        alert("schema is not a valid JSON format")
                        return
                      }
                    }
                    const res = JSON.parse(
                      await fn(addRelayerJob)({
                        relayers: newRelayers,
                        signers: newSigners,
                        name: newJobName,
                        multisig: newMultisig,
                        multisig_type: newMultisigType,
                        schema: _schema,
                        contractTxId,
                      })
                    )
                    if (!res.success) {
                      alert("Something went wrong")
                    } else {
                      setNewCron("")
                      setNewStart("")
                      setNewCronName("")
                      setNewEnd("")
                      setNewTimes("")
                      setNewSpan("")
                      setAddRelayer(false)
                      setRelayers(await db.listRelayerJobs(true))
                    }
                  } catch (e) {
                    alert("Something went wrong")
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
      ) : addNode !== false ? (
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
      ) : addContract !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddContract(false)}
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
                      await db.get("contracts", ["address", "=", addr], true)
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
          </Box>
        </Flex>
      ) : addRules !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddRules(false)}
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
              value={newRules2}
              placeholder="Access Control Rules"
              onChange={e => setNewRules2(e.target.value)}
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
                  const exRules = !/^\s*$/.test(newRules2)
                  if (!exRules) {
                    alert("Enter rules")
                  }
                  let val = null
                  try {
                    eval(`const obj = ${newRules2}`)
                    val = newRules2
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  set("add_rules", "loading")
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  try {
                    let query = `${newRules2}, ${col_path}`
                    const res = JSON.parse(
                      await fn(queryDB)({
                        method: "setRules",
                        query,
                        contractTxId,
                      })
                    )
                    if (!res.success) {
                      alert("Something went wrong")
                    } else {
                      setNewRules2(`{"allow write": true}`)
                      setAddRules(false)
                      setRules(
                        await db.getRules(
                          ...(doc_path.length % 2 === 0
                            ? doc_path.slice(0, -1)
                            : doc_path),
                          true
                        )
                      )
                    }
                  } catch (e) {
                    alert("Something went wrong")
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
      ) : addOwner !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddOwner(false)}
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
                        const res = await fn(_removeOwner)({
                          address: v,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        }
                        setState(await db.getInfo(true))
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
                  "Add Owner"
                )}
              </Flex>
            </Flex>
          </Box>
        </Flex>
      ) : addNodeOwner !== false ? (
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
      ) : addAlgorithms !== false ? (
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddAlgorithms(false)}
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
            <Flex>
              {map(v => (
                <Box mx={3}>
                  <Box
                    onClick={() => {
                      if (includes(v)(newAuths)) {
                        setNewAuths(without([v], newAuths))
                      } else {
                        setNewAuths(append(v, newAuths))
                      }
                    }}
                    className={
                      includes(v)(newAuths)
                        ? "fas fa-check-square"
                        : "far fa-square"
                    }
                    mr={2}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                  />
                  {v}
                </Box>
              ))(["secp256k1", "secp256k1-2", "ed25519", "rsa256"])}
            </Flex>
            <Flex
              mt={3}
              fontSize="12px"
              align="center"
              height="40px"
              bg="#333"
              color="white"
              justify="center"
              py={1}
              px={2}
              w="100%"
              onClick={async () => {
                if (isNil($.loading)) {
                  set("set_algorithms", "loading")
                  const res = await fn(_setAlgorithms)({
                    algorithms: newAuths,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  }
                  set(null, "loading")
                  setState(await db.getInfo(true))
                }
              }}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                "Save Changes"
              )}
            </Flex>
          </Box>
        </Flex>
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
        <Flex
          w="100%"
          h="100%"
          position="fixed"
          sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
          bg="rgba(0,0,0,0.5)"
          onClick={() => setAddInstance(false)}
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
                    disabled={true}
                    value={$.temp_current_all.addr || ""}
                    sx={{ borderRadius: 0 }}
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
                      {map(v => <option value={v}>{v}</option>)([
                        "True",
                        "False",
                      ])}
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
                      {map(v => <option value={v}>{v}</option>)([
                        "True",
                        "False",
                      ])}
                    </Select>
                  </Box>
                </Flex>
                <Flex fontSize="10px" mx={1} my={1}>
                  Authentication
                </Flex>
                <Flex>
                  {map(v => (
                    <Box mx={3}>
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
                      {v}
                    </Box>
                  ))(["Arweave", "EVM", "DFINITY", "Intmax"])}
                </Flex>
              </>
            ) : (
              <>
                <Flex fontSize="10px" m={1}>
                  ContractTxId
                </Flex>
                <Input
                  flex={1}
                  value={newContractTxId}
                  onChange={e => setNewContractTxId(trim(e.target.value))}
                  sx={{ borderRadius: 0 }}
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
                    {map(v => <option value={v.key}>{v.name}</option>)(
                      rpc_types
                    )}
                  </Select>
                  {newRPCType === "sdk" ? (
                    <Input
                      flex={1}
                      value="Browser Local Cache"
                      disabled={true}
                    />
                  ) : newRPCType === "preset" ? (
                    <>
                      <Select
                        flex={1}
                        value={presetRPC}
                        onChange={e => setPresetRPC(e.target.value)}
                        sx={{ borderRadius: 0 }}
                      >
                        {map(v => <option>{v}</option>)(
                          compose(
                            uniq,
                            concat(preset_rpcs),
                            pluck("rpc")
                          )(nodes)
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
                        {map(v => <option>{v}</option>)([
                          "https://",
                          "http://",
                        ])}
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
                          let state = await db.getInfo(true)
                          if (!isNil(state.version)) {
                            if (
                              !/^[0-9]+\.[0-9]+\.[0-9]+$/.test(state.version)
                            ) {
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
          </Box>
        </Flex>
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
              <>
                <Flex
                  justify="center"
                  align="center"
                  direction="column"
                  boxSize="150px"
                  p={4}
                  m={4}
                  bg="#333"
                  color="white"
                  sx={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    set(true, "signing_in")
                    if ($.owner_signing_in_modal) {
                      await fn(connectAddress)({ network: newNetwork })
                    } else {
                      await fn(createTempAddress)({
                        contractTxId,
                        network,
                        node: tab === "Nodes",
                      })
                    }
                    set(false, "signing_in")
                    set(false, "signing_in_modal")
                    set(false, "owner_signing_in_modal")
                  }}
                >
                  <Image height="100px" src="/static/images/metamask.png" />
                  <Box textAlign="center">MetaMask</Box>
                </Flex>
                <Flex
                  p={4}
                  m={4}
                  boxSize="150px"
                  bg="#333"
                  color="white"
                  justify="center"
                  align="center"
                  direction="column"
                  sx={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    set(true, "signing_in")
                    if ($.owner_signing_in_modal) {
                      await fn(connectAddressWithII)({
                        network: newNetwork,
                      })
                    } else {
                      await fn(createTempAddressWithII)({
                        contractTxId,
                        network,
                        node: tab === "Nodes",
                      })
                    }
                    set(false, "signing_in")
                    set(false, "signing_in_modal")
                    set(false, "owner_signing_in_modal")
                  }}
                >
                  <Image height="100px" src="/static/images/dfinity.png" />
                  <Box textAlign="center">Internet Identity</Box>
                </Flex>
                <Flex
                  p={4}
                  m={4}
                  boxSize="150px"
                  bg="#333"
                  color="white"
                  justify="center"
                  align="center"
                  direction="column"
                  sx={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    set(true, "signing_in")
                    if ($.owner_signing_in_modal) {
                      await fn(connectAddressWithAR)({
                        network: newNetwork,
                      })
                    } else {
                      await fn(createTempAddressWithAR)({
                        contractTxId,
                        network,
                        node: tab === "Nodes",
                      })
                    }
                    set(false, "signing_in")
                    set(false, "signing_in_modal")
                    set(false, "owner_signing_in_modal")
                  }}
                >
                  <Image height="100px" src="/static/images/arconnect.png" />
                  <Box textAlign="center">ArConnect</Box>
                </Flex>
              </>
            )}
          </Flex>
        </Flex>
      ) : null}
    </>
  )
)
