import { useEffect, Fragment, useState } from "react"
import JSONPretty from "react-json-pretty"
import {
  Image,
  Select,
  ChakraProvider,
  Box,
  Flex,
  Input,
  Textarea,
} from "@chakra-ui/react"
import {
  join,
  clone,
  filter,
  compose,
  values,
  keys,
  isNil,
  map,
  mapObjIndexed,
  is,
  slice,
  hasPath,
  includes,
} from "ramda"
import { bind } from "nd"
import weavedb from "lib/weavedb.json"
let db
export default bind(
  ({ set, init, router, conf, $ }) => {
    const fn = init([
      "checkTempAddress",
      "setupWeaveDB",
      "createTempAddress",
      "logoutTemp",
      "queryDB",
    ])
    const [result, setResult] = useState("")
    const [admin_address, setAdminAddress] = useState("")
    const [state, setState] = useState(null)
    const [col, setCol] = useState(null)
    const [doc, setDoc] = useState(null)
    const [tab, setTab] = useState("Data")
    const [method, setMethod] = useState("get")
    const [query, setQuery] = useState("")
    const tabs = ["Data", "Schemas", "Rules", "Indexes", "Auth"]
    const [network, setNetwork] = useState("Localhost")
    const [newNetwork, setNewNetwork] = useState("Localhost")
    const [newRules, setNewRules] = useState(`{"allow write": true}`)
    const [newRules2, setNewRules2] = useState(`{"allow write": true}`)
    const [newData, setNewData] = useState(`{}`)
    const [newIndex, setNewIndex] = useState(`[]`)
    const [newSchemas, setNewSchemas] = useState("")
    const [newField, setNewField] = useState("")
    const [newFieldType, setNewFieldType] = useState(`string`)
    const [newFieldVal, setNewFieldVal] = useState("")
    const [newFieldBool, setNewFieldBool] = useState(true)
    const [editNetwork, setEditNetwork] = useState(false)
    const networks = ["Mainnet", "Testnet", "Localhost"]
    const [initDB, setInitDB] = useState(false)
    const [networkErr, setNetworkErr] = useState(false)
    const [newCollection, setNewCollection] = useState("")
    const [newDoc, setNewDoc] = useState("")
    const [contractTxId, setContractTxId] = useState(
      weavedb.weavedb.contractTxId
    )
    const [newContractTxId, setNewContractTxId] = useState(
      weavedb.weavedb.contractTxId
    )
    const [addCollection, setAddCollection] = useState(false)
    const [addSchemas, setAddSchemas] = useState(false)
    const [addDoc, setAddDoc] = useState(false)
    const [addData, setAddData] = useState(false)
    const [addRules, setAddRules] = useState(false)
    const [addIndex, setAddIndex] = useState(false)

    useEffect(() => {
      ;(async () => {
        db = await fn.setupWeaveDB({ network, contractTxId })
        setAdminAddress(await db.arweave.wallets.jwkToAddress(weavedb.arweave))
        setInitDB(true)
      })()
    }, [contractTxId, network])
    useEffect(() => {
      ;(async () => {
        if (initDB) {
          fn.checkTempAddress({ contractTxId })
          setInterval(async () => {
            try {
              setState(await db.db.currentState())
              setNetworkErr(false)
            } catch (e) {
              setNetworkErr(true)
            }
          }, 1000)
        }
      })()
    }, [initDB])
    let cols = []
    let docs = []
    let data = null
    if (!isNil(state)) {
      cols = keys(state.data)
      if (!isNil(state.data[col])) {
        docs = keys(state.data[col].__docs)
        if (!isNil(doc) && !isNil(state.data[col].__docs[doc])) {
          data = state.data[col].__docs[doc].__data
        }
      }
    }
    const methods = [
      "get",
      "cget",
      "add",
      "set",
      "update",
      "upsert",
      "delete",
      "batch",
      "addIndex",
      "getIndex",
      "removeIndex",
      "setRules",
      "getRules",
      "setSchema",
      "getSchema",
      "nonce",
      "ids",
      "evolve",
    ]
    const ConnectWallet = () => (
      <Flex
        py={2}
        px={6}
        bg="#333"
        color="white"
        sx={{
          borderRadius: "25px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        justifyContent="center"
        onClick={async () => {
          if (isNil($.temp_current)) {
            set(true, "signing_in")
            await fn.createTempAddress({ contractTxId })
            set(false, "signing_in")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn.logoutTemp()
            }
          }
        }}
      >
        {isNil($.temp_current)
          ? "Sign In"
          : `${$.temp_current.slice(0, 6)}...${$.temp_current.slice(-4)}`}
      </Flex>
    )
    const getCol = (data, path, _signer) => {
      const [col, id] = path
      data[col] ||= { __docs: {} }
      if (isNil(id)) {
        return data[col]
      } else {
        data[col].__docs[id] ||= { __data: null, subs: {} }
        if (!isNil(_signer) && isNil(data[col].__docs[id].setter)) {
          data[col].__docs[id].setter = _signer
        }
        return getCol(
          data[col].__docs[id].subs,
          slice(2, path.length, path),
          _signer
        )
      }
    }

    const getIndex = (state, path) => {
      if (isNil(state.indexes[path.join(".")]))
        state.indexes[path.join(".")] = {}
      return state.indexes[path.join(".")]
    }
    const scanIndexes = ind => {
      let indexes = []
      for (let k in ind) {
        for (let k2 in ind[k]) {
          const _ind = [[k, k2]]
          if (!isNil(ind[k][k2]._)) indexes.push(_ind)
          if (!isNil(ind[k][k2].subs)) {
            const sub_indexes = scanIndexes(ind[k][k2].subs)
            for (let v of sub_indexes) {
              indexes.push([..._ind, ...v])
            }
          }
        }
      }
      return indexes
    }
    let indexes = []
    let rules = {}
    let schema = {}
    if (!isNil(col)) {
      indexes = scanIndexes(getIndex(state, [col]))
      ;({ rules, schema } = getCol(state.data, [col]))
    }
    useEffect(() => {
      ;(async () => {
        if (isNil(col)) {
          setNewSchemas(null)
        } else {
          ;({ rules, schema } = getCol(state.data, [col]))
          setNewSchemas(JSON.stringify(schema))
          setNewRules2(JSON.stringify(rules))
        }
      })()
    }, [col])
    return (
      <ChakraProvider>
        <style global jsx>{`
          html,
          #__next,
          body {
            height: 100%;
          }
        `}</style>
        <Flex
          bg="white"
          width="100%"
          height="56px"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            borderBottom: "1px solid #ddd",
          }}
          align="center"
        >
          <Flex px={5} justify="center" align="center" w="160px">
            <Image
              boxSize="40px"
              src="/static/images/logo.svg"
              sx={{ borderRadius: "50%" }}
              mr={2}
            />
            WeaveDB
          </Flex>
          {editNetwork ? (
            <Flex flex={1} justify="center" fontSize="10px">
              <Flex maxW="750px" width="100%">
                <Select
                  w="150px"
                  value={newNetwork}
                  onChange={e => setNewNetwork(e.target.value)}
                  sx={{ borderRadius: "5px 0 0 5px" }}
                >
                  {map(v => <option value={v}>{v}</option>)(networks)}
                </Select>
                <Input
                  flex={1}
                  value={newContractTxId}
                  onChange={e => setNewContractTxId(e.target.value)}
                  sx={{ borderRadius: 0 }}
                />
                <Flex
                  py={2}
                  px={6}
                  bg="#333"
                  color="white"
                  sx={{
                    borderRadius: "0 5px 5px 0",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  justifyContent="center"
                  align="center"
                  fontSize="16px"
                  onClick={async () => {
                    if (!/^\s*$/.test(newContractTxId)) {
                      setNetwork(newNetwork)
                      setContractTxId(newContractTxId)
                      setEditNetwork(false)
                    }
                  }}
                >
                  Change
                </Flex>
              </Flex>
            </Flex>
          ) : (
            <Flex
              flex={1}
              justify="center"
              fontSize="10px"
              onClick={() => setEditNetwork(true)}
              sx={{ cursor: "pointer" }}
            >
              <Box px={2}>{network}</Box>
              <Flex px={2}>
                contractTxId:{" "}
                {networkErr ? (
                  <Box ml={2} color="red">
                    Network Error
                  </Box>
                ) : (
                  contractTxId
                )}
              </Flex>
            </Flex>
          )}
          <Flex justify="center" align="center" justifySelf="flex-end" px={5}>
            <ConnectWallet />
          </Flex>
        </Flex>
        <Flex justify="center" height="100%" fontSize="12px" pt="50px">
          <Flex maxW="960px" w="100%" h="100%" direction="column" p={3}>
            <Flex w="100%" justify="center" mb={4} mt={2}>
              {map(v => {
                return (
                  <Box
                    onClick={() => setTab(v)}
                    bg={v === tab ? "#333" : "#ddd"}
                    color={v === tab ? "white" : "#333"}
                    px={4}
                    py={1}
                    sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                  >
                    {v}
                  </Box>
                )
              })(tabs)}
            </Flex>
            <Flex
              height="535px"
              maxW="960px"
              w="100%"
              sx={{ border: "1px solid #333" }}
            >
              <Flex h="535px" w="100%">
                {tab === "Auth" ? null : (
                  <Box
                    flex={1}
                    sx={{ border: "1px solid #555" }}
                    direction="column"
                  >
                    <Flex py={2} px={3} color="white" bg="#333" h="35px">
                      <Box>Collections</Box>
                      <Box flex={1} />
                      <Box
                        onClick={() => setAddCollection(true)}
                        sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                      >
                        <Box as="i" className="fas fa-plus" />
                      </Box>
                    </Flex>
                    {map(v => (
                      <Flex
                        onClick={() => setCol(v)}
                        bg={col === v ? "#ddd" : ""}
                        py={2}
                        px={3}
                        sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                      >
                        {v}
                      </Flex>
                    ))(cols)}
                  </Box>
                )}
                {tab === "Schemas" ? (
                  <Flex
                    flex={1}
                    sx={{ border: "1px solid #555" }}
                    direction="column"
                  >
                    <Flex py={2} px={3} color="white" bg="#333" h="35px">
                      <Box>Schamas</Box>
                      <Box flex={1} />
                      {isNil(col) ? null : (
                        <Box
                          onClick={() => setAddSchemas(true)}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          <Box as="i" className="fas fa-plus" />
                        </Box>
                      )}
                    </Flex>
                    <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
                      <JSONPretty id="json-pretty" data={schema}></JSONPretty>
                    </Box>
                  </Flex>
                ) : tab === "Rules" ? (
                  <Flex
                    flex={1}
                    sx={{ border: "1px solid #555" }}
                    direction="column"
                  >
                    <Flex py={2} px={3} color="white" bg="#333" h="35px">
                      <Box>Rules</Box>
                      <Box flex={1} />
                      {isNil(col) ? null : (
                        <Box
                          onClick={() => setAddRules(true)}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          <Box as="i" className="fas fa-plus" />
                        </Box>
                      )}
                    </Flex>
                    <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
                      <JSONPretty id="json-pretty" data={rules}></JSONPretty>
                    </Box>
                  </Flex>
                ) : tab === "Indexes" ? (
                  <>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Compound Indexes
                        <Box flex={1} />
                        {isNil(col) ? null : (
                          <Box
                            onClick={() => setAddIndex(true)}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box as="i" className="fas fa-plus" />
                          </Box>
                        )}
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {compose(
                          map(v => (
                            <Flex p={2} px={3}>
                              {map(v2 => {
                                let ind = v2
                                if (v2.length === 1) {
                                  ind.push("asc")
                                }
                                return (
                                  <Box
                                    px={3}
                                    mr={2}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    {v2.join(" : ")}
                                  </Box>
                                )
                              })(v)}
                            </Flex>
                          )),
                          filter(v => v.length > 1)
                        )(indexes)}
                      </Box>
                    </Flex>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Single Indexes
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {compose(
                          map(v => (
                            <Flex p={2} px={3}>
                              {map(v2 => {
                                let ind = v2
                                if (v2.length === 1) {
                                  ind.push("asc")
                                }
                                return (
                                  <Box
                                    px={3}
                                    mr={2}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    {v2.join(" : ")}
                                  </Box>
                                )
                              })(v)}
                            </Flex>
                          )),
                          filter(v => v.length === 1)
                        )(indexes)}
                      </Box>
                    </Flex>
                  </>
                ) : tab === "Auth" ? (
                  <>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Authentication
                        <Box flex={1} />
                        {isNil(col) ? null : (
                          <Box
                            onClick={() => setAddIndex(true)}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box as="i" className="fas fa-plus" />
                          </Box>
                        )}
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {isNil(state.auth) ? null : (
                          <>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Name
                              </Box>
                              {state.auth.name}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Version
                              </Box>
                              {state.auth.version}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Owner
                              </Box>
                              {state.owner}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Network
                              </Box>
                              {network}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                contractTxId
                              </Box>
                              {contractTxId}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Admin Arweave Address
                              </Box>
                              {admin_address}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Logged In ETH Address
                              </Box>
                              {$.temp_current || "Not Logged In"}
                            </Flex>
                          </>
                        )}
                      </Box>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        <Box>Docs</Box>
                        <Box flex={1} />
                        {isNil(col) ? null : (
                          <Box
                            onClick={() => setAddDoc(true)}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box as="i" className="fas fa-plus" />
                          </Box>
                        )}
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {map(v => (
                          <Flex
                            onClick={() => setDoc(v)}
                            bg={doc === v ? "#ddd" : ""}
                            p={2}
                            px={3}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            {v}
                          </Flex>
                        ))(docs)}
                      </Box>
                    </Flex>
                    <Box
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        <Box>Data</Box>
                        <Box flex={1} />
                        {isNil(col) ||
                        isNil(doc) ||
                        !hasPath(["data", col, "__docs", doc])(state) ? null : (
                          <Box
                            onClick={() => setAddData(true)}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box as="i" className="fas fa-plus" />
                          </Box>
                        )}
                      </Flex>
                      {compose(
                        values,
                        mapObjIndexed((v, k) => {
                          return (
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                {k}
                              </Box>
                              {is(Object)(v)
                                ? JSON.stringify(v)
                                : is(Boolean)(v)
                                ? v
                                  ? "true"
                                  : "false"
                                : v}
                            </Flex>
                          )
                        })
                      )(data)}
                    </Box>
                  </>
                )}
              </Flex>
            </Flex>
            <Flex w="100%" justify="center" mb={3} mt={1} pt={2}>
              <Select
                w="200px"
                value={method}
                onChange={e => setMethod(e.target.value)}
                sx={{
                  borderRadius: "3px 0 0 3px",
                }}
              >
                {map(v => <option value={v}>{v}</option>)(methods)}
              </Select>
              <Input
                flex={1}
                sx={{ borderRadius: "0px" }}
                placeholder="query"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <Flex
                sx={{
                  borderRadius: "0 3px 3px 0",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                w="150px"
                justify="center"
                align="center"
                color="white"
                bg="#333"
                onClick={async () => {
                  try {
                    const res = await fn.queryDB({
                      query,
                      method,
                      contractTxId,
                    })
                    setResult(res)
                  } catch (e) {
                    console.log(e)
                    setResult("Error: The wrong query")
                  }
                }}
              >
                Execute
              </Flex>
            </Flex>
            <Flex
              w="100%"
              justify="center"
              mb={4}
              sx={{ border: "1px solid #111", borderRadius: "3px" }}
            >
              <Flex
                width="200px"
                justify="center"
                p={2}
                sx={{ borderRight: "1px solid #111" }}
              >
                {method}({query})
              </Flex>
              <Flex
                flex={1}
                px={2}
                color={/^Error:/.test(result) ? "red" : "#333"}
                p={2}
              >
                {result}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        {addCollection !== false ? (
          <Flex
            w="100%"
            h="100%"
            position="fixed"
            sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
            bg="rgba(0,0,0,0.5)"
            onClick={() => setAddCollection(false)}
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
              <Input
                value={newCollection}
                placeholder="Collection ID"
                onChange={e => setNewCollection(e.target.value)}
                sx={{
                  borderRadius: "3px",
                }}
              />
              <Textarea
                mt={3}
                value={newRules}
                placeholder="Access Control Rules"
                onChange={e => setNewRules(e.target.value)}
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
                onClick={async () => {
                  if (/^\s*$/.test(newCollection)) {
                    alert("Enter Collection ID")
                    return
                  } else if (hasPath(["data", newCollection])(state)) {
                    alert("Collection exists")
                    return
                  }
                  try {
                    JSON.parse(newRules)
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  const res = await fn.queryDB({
                    method: "setRules",
                    query: `${newRules}, "${newCollection}"`,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddCollection(false)
                  }
                }}
              >
                Add
              </Flex>
            </Box>
          </Flex>
        ) : addDoc !== false ? (
          <Flex
            w="100%"
            h="100%"
            position="fixed"
            sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
            bg="rgba(0,0,0,0.5)"
            onClick={() => setAddDoc(false)}
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
              <Input
                value={newDoc}
                placeholder="Doc ID - leave it empty for random generation"
                onChange={e => setNewDoc(e.target.value)}
                sx={{
                  borderRadius: "3px",
                }}
              />
              <Textarea
                mt={3}
                value={newData}
                placeholder="Access Control Rules"
                onChange={e => setNewData(e.target.value)}
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
                onClick={async () => {
                  const exID = !/^\s*$/.test(newDoc)
                  if (exID && hasPath(["data", col, "__docs", newDoc])(state)) {
                    alert("Doc exists")
                    return
                  }
                  try {
                    JSON.parse(newData)
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  let query = `${newData}, "${col}"`
                  if (exID) query += `, "${newDoc}"`
                  const res = await fn.queryDB({
                    method: exID ? "set" : "add",
                    query,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddDoc(false)
                  }
                }}
              >
                Add
              </Flex>
            </Box>
          </Flex>
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
                  ])}
                </Select>
                <Input
                  value={newField}
                  placeholder="Field Key"
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
                  placeholder="Field Value"
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
                onClick={async () => {
                  const exID = !/^\s*$/.test(newField)
                  const exVal =
                    includes(newFieldType)(["bool", "null"]) ||
                    !/^\s*$/.test(newFieldVal)
                  if (!exVal) alert("Enter a value")
                  if (!exID) alert("Enter field key")
                  if (
                    exID &&
                    hasPath(["data", col, "__docs", doc, "__data", newField])(
                      state
                    )
                  ) {
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
                  }
                  let query = `{ "${newField}": ${val}}, "${col}", "${doc}"`
                  const res = await fn.queryDB({
                    method: "update",
                    query,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddData(false)
                  }
                }}
              >
                Add
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
                placeholder="Access Control Rules"
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
                bg="#333"
                onClick={async () => {
                  const exID = !/^\s*$/.test(newSchemas)
                  let val = null
                  try {
                    eval(`const obj = ${newSchemas}`)
                    val = newSchemas
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  let query = `${newSchemas}, "${col}"`
                  const res = await fn.queryDB({
                    method: "setSchema",
                    query,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddSchemas(false)
                  }
                }}
              >
                Add
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
                onClick={async () => {
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
                  let query = `${newRules2}, "${col}"`
                  const res = await fn.queryDB({
                    method: "setRules",
                    query,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddRules(false)
                  }
                }}
              >
                Add
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
                onClick={async () => {
                  const exIndex = !/^\s*$/.test(newIndex)
                  if (!exIndex) {
                    alert("Enter rules")
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

                  let query = `${newIndex}, "${col}"`
                  const res = await fn.queryDB({
                    method: "addIndex",
                    query,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddIndex(false)
                  }
                }}
              >
                Add
              </Flex>
            </Box>
          </Flex>
        ) : null}
      </ChakraProvider>
    )
  },
  ["temp_current", "initWDB"]
)
