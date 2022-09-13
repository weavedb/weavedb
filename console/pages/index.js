import { useEffect, Fragment, useState } from "react"
import JSONPretty from "react-json-pretty"
import {
  Checkbox,
  Image,
  Select,
  ChakraProvider,
  Box,
  Flex,
  Input,
  Textarea,
} from "@chakra-ui/react"
import {
  concat,
  last,
  init as _init,
  take,
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
  append,
  addIndex as _addIndex,
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
      "createTempAddressWithII",
      "createTempAddressWithAR",
      "logoutTemp",
      "queryDB",
    ])
    const [result, setResult] = useState("")
    const [admin_address, setAdminAddress] = useState("")
    const [state, setState] = useState(null)
    const [doc_path, setDocPath] = useState([])
    const [tab, setTab] = useState("Data")
    const [cron, setCron] = useState(null)
    const [method, setMethod] = useState("get")
    const [query, setQuery] = useState("")
    const tabs = ["Data", "Schemas", "Rules", "Indexes", "Crons", "Auth"]
    const [network, setNetwork] = useState("Localhost")
    const [newNetwork, setNewNetwork] = useState("Localhost")
    const [newRules, setNewRules] = useState(`{"allow write": true}`)
    const [newRules2, setNewRules2] = useState(`{"allow write": true}`)
    const [newData, setNewData] = useState(`{}`)
    const [newIndex, setNewIndex] = useState(`[]`)
    const [newSchemas, setNewSchemas] = useState("")
    const [newCron, setNewCron] = useState("")
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
    const [newDo, setNewDo] = useState("")
    const [newSpan, setNewSpan] = useState("")
    const [newCronName, setNewCronName] = useState("")
    const [newStart, setNewStart] = useState("")
    const [newEnd, setNewEnd] = useState("")
    const [newTimes, setNewTimes] = useState("")
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
    const [addCron, setAddCron] = useState(false)
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

    const getCol = (data, path) => {
      const [col, id] = path
      data[col] ||= { __docs: {} }
      if (isNil(id)) {
        return data[col]
      } else {
        data[col].__docs[id] ||= { __data: null, subs: {} }
        return getCol(data[col].__docs[id].subs, slice(2, path.length, path))
      }
    }

    let cols = []
    let docs = []
    let data = null
    let subs = {}
    let base = {}
    let col = null
    let doc = null
    let base_path = []
    if (!isNil(state)) {
      base = state.data
      if (doc_path.length > 2) {
        base_path = take(
          doc_path.length % 2 === 0 ? doc_path.length - 2 : doc_path.length - 1,
          doc_path
        )
        const len =
          doc_path.length % 2 === 0 ? doc_path.length - 3 : doc_path.length - 2
        const last_key =
          doc_path.length % 2 === 0
            ? doc_path[doc_path.length - 3]
            : doc_path[doc_path.length - 2]
        const _col = getCol(state.data, take(len)(doc_path))
        base = _col.__docs[last_key].subs
        if (doc_path.length % 2 === 0) {
          doc = doc_path[doc_path.length - 1]
          col = doc_path[doc_path.length - 2]
        } else {
          col = doc_path[doc_path.length - 1]
        }
      } else {
        col = doc_path[0]
        doc = doc_path[1]
      }
      cols = keys(base)
      if (!isNil(col) && !isNil(base[col])) {
        docs = keys(base[col].__docs)
        if (!isNil(doc) && !isNil(base[col].__docs[doc])) {
          data = base[col].__docs[doc].__data
          subs = base[col].__docs[doc].subs
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
      "addCron",
      "getCrons",
      "removeCron",
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
            set(true, "signing_in_modal")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn.logoutTemp()
            }
          }
        }}
      >
        {isNil($.temp_current) ? (
          "Sign In"
        ) : (
          <Flex align="center">
            <Image
              boxSize="25px"
              src={
                $.temp_current.length < 88
                  ? "/static/images/metamask.png"
                  : "/static/images/dfinity.png"
              }
              mr={3}
            />
            {`${$.temp_current.slice(0, 6)}...${$.temp_current.slice(-4)}`}
          </Flex>
        )}
      </Flex>
    )

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
    let crons = {}
    let _cron = null
    if (!isNil(state) && !isNil(state.crons)) {
      crons = state.crons.crons
      _cron = crons[cron]
    }
    if (!isNil(col)) {
      indexes = scanIndexes(getIndex(state, append(col, base_path)))
      ;({ rules, schema } = getCol(state.data, append(col, base_path)))
    }
    useEffect(() => {
      ;(async () => {
        if (isNil(col)) {
          setNewSchemas(null)
        } else {
          ;({ rules, schema } = getCol(state.data, append(col, base_path)))
          setNewSchemas(JSON.stringify(schema))
          setNewRules2(JSON.stringify(rules))
        }
      })()
    }, [doc_path])
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
                  <Box ml={2} color="#F50057">
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
            <Flex mb={3} align="center">
              WeaveDB
              {_addIndex(map)((v, i) => (
                <>
                  <Box mx={2} as="i" className="fas fa-angle-right" />
                  <Box
                    onClick={() => setDocPath(take(i + 1, doc_path))}
                    sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                    as="span"
                    color={i === doc_path.length - 1 ? "#F50057" : ""}
                  >
                    {v}
                  </Box>
                </>
              ))(doc_path)}
            </Flex>
            <Flex
              height="535px"
              maxW="960px"
              w="100%"
              sx={{ border: "1px solid #333" }}
            >
              <Flex h="535px" w="100%">
                {includes(tab)(["Auth", "Crons"]) ? null : (
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
                        onClick={() => {
                          setDocPath([...base_path, v])
                        }}
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
                ) : tab === "Crons" ? (
                  <>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Crons
                        <Box flex={1} />
                        <Box
                          onClick={() => setAddCron(true)}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          <Box as="i" className="fas fa-plus" />
                        </Box>
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {compose(
                          map(v => (
                            <Flex
                              onClick={() => {
                                setCron(v)
                              }}
                              bg={cron === v ? "#ddd" : ""}
                              py={2}
                              px={3}
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                              }}
                            >
                              <Box mr={3} flex={1}>
                                {v}
                              </Box>
                              <Box
                                color="#999"
                                sx={{
                                  cursor: "pointer",
                                  ":hover": { opacity: 0.75, color: "#F50057" },
                                }}
                                onClick={async e => {
                                  e.stopPropagation()
                                  let query = `"${v}"`
                                  if (
                                    confirm(
                                      "Would you like to remove the cron?"
                                    )
                                  ) {
                                    const res = await fn.queryDB({
                                      method: "removeCron",
                                      query,
                                      contractTxId,
                                    })
                                    if (/^Error:/.test(res)) {
                                      alert("Something went wrong")
                                    }
                                  }
                                }}
                              >
                                <Box as="i" className="fas fa-trash" />
                              </Box>
                            </Flex>
                          )),
                          keys
                        )(crons)}
                      </Box>
                    </Flex>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Settings
                        <Box flex={1} />
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {isNil(_cron) ? null : (
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
                              <Box flex={1}>{cron}</Box>
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Start
                              </Box>
                              <Box flex={1}>{_cron.start}</Box>
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                End
                              </Box>
                              <Box flex={1}>{_cron.end || "-"}</Box>
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Do
                              </Box>
                              <Box flex={1}>{_cron.do ? "true" : "false"}</Box>
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Span
                              </Box>
                              <Box flex={1}>{_cron.span}</Box>
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Times
                              </Box>
                              <Box flex={1}>{_cron.times || "-"}</Box>
                            </Flex>
                          </>
                        )}
                      </Box>
                    </Flex>
                    <Flex
                      flex={1}
                      sx={{ border: "1px solid #555" }}
                      direction="column"
                    >
                      <Flex py={2} px={3} color="white" bg="#333" h="35px">
                        Jobs
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }} p={3}>
                        {isNil(_cron) ? null : (
                          <JSONPretty
                            id="json-pretty"
                            data={_cron.jobs}
                          ></JSONPretty>
                        )}
                      </Box>
                    </Flex>
                  </>
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
                      </Flex>
                      <Box height="500px" sx={{ overflowY: "auto" }}>
                        {isNil(state) || isNil(state.auth) ? null : (
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
                              {state.owner !== admin_address ? (
                                <Box as="span" ml={2} color="#F50057">
                                  (not the owner)
                                </Box>
                              ) : (
                                ""
                              )}
                            </Flex>
                            <Flex align="center" p={2} px={3}>
                              <Box
                                mr={2}
                                px={3}
                                bg="#ddd"
                                sx={{ borderRadius: "3px" }}
                              >
                                Logged In{" "}
                                {isNil($.temp_current) ||
                                $.temp_current.length < 88
                                  ? "ETH Address"
                                  : "Internet Identity"}
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
                            onClick={() =>
                              setDocPath(concat(base_path, [col, v]))
                            }
                            bg={doc === v ? "#ddd" : ""}
                            p={2}
                            px={3}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box mr={3} flex={1}>
                              {v}
                            </Box>
                            <Box
                              color="#999"
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75, color: "#F50057" },
                              }}
                              onClick={async e => {
                                e.stopPropagation()
                                if (!hasPath([col, "__docs", v])(base)) {
                                  alert("Doc doesn't exist")
                                  return
                                }
                                let col_path = compose(
                                  join(", "),
                                  map(v2 => `"${v2}"`),
                                  append(col)
                                )(base_path)
                                let query = `${col_path}, "${v}"`
                                if (
                                  confirm("Would you like to delete the doc?")
                                ) {
                                  const res = await fn.queryDB({
                                    method: "delete",
                                    query,
                                    contractTxId,
                                  })
                                  if (/^Error:/.test(res)) {
                                    alert("Something went wrong")
                                  }
                                }
                              }}
                            >
                              <Box as="i" className="fas fa-trash" />
                            </Box>
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
                        !hasPath(["data", doc_path[0], "__docs", doc_path[1]])(
                          state
                        ) ? null : (
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
                            <Flex
                              align="center"
                              p={2}
                              px={3}
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                              }}
                              onClick={() => {
                                setDocPath(append(k)(doc_path))
                              }}
                            >
                              <Box
                                mr={2}
                                px={3}
                                bg="#333"
                                color="white"
                                sx={{ borderRadius: "3px" }}
                              >
                                Sub Collection
                              </Box>
                              {k}
                            </Flex>
                          )
                        })
                      )(subs)}
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
                              <Box flex={1}>
                                {is(Object)(v)
                                  ? JSON.stringify(v)
                                  : is(Boolean)(v)
                                  ? v
                                    ? "true"
                                    : "false"
                                  : v}
                              </Box>
                              <Box
                                color="#999"
                                sx={{
                                  cursor: "pointer",
                                  ":hover": { opacity: 0.75, color: "#F50057" },
                                }}
                                onClick={async e => {
                                  e.stopPropagation()
                                  if (
                                    !hasPath([col, "__docs", doc, "__data", k])(
                                      base
                                    )
                                  ) {
                                    alert("Field doesn't exist")
                                    return
                                  }
                                  let query = ""
                                  method = "update"
                                  let _doc_path = compose(
                                    join(", "),
                                    map(v => `"${v}"`),
                                    concat(base_path)
                                  )([col, doc])
                                  query = `{ "${k}": ${JSON.stringify(
                                    db.del()
                                  )}}, ${_doc_path}`
                                  if (
                                    confirm(
                                      "Would you like to delete the field?"
                                    )
                                  ) {
                                    const res = await fn.queryDB({
                                      method,
                                      query,
                                      contractTxId,
                                    })
                                    if (/^Error:/.test(res)) {
                                      alert("Something went wrong")
                                    }
                                  }
                                }}
                              >
                                <Box as="i" className="fas fa-trash" />
                              </Box>
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
                color={/^Error:/.test(result) ? "#F50057" : "#333"}
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
                  } else if (hasPath([newCollection])(base)) {
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
                    query: `${newRules}, ${compose(
                      join(", "),
                      map(v => `"${v}"`),
                      append(newCollection)
                    )(base_path)}`,
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
                placeholder="JSON Data"
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
                  if (exID && hasPath([col, "__docs", newDoc])(base)) {
                    alert("Doc exists")
                    return
                  }
                  try {
                    JSON.parse(newData)
                  } catch (e) {
                    alert("Wrong JSON format")
                    return
                  }
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  let query = `${newData}, ${col_path}`
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
                onClick={async () => {
                  const exID = !/^\s*$/.test(newField)
                  const exVal =
                    includes(newFieldType)(["bool", "null"]) ||
                    !/^\s*$/.test(newFieldVal)
                  if (!exVal) alert("Enter a value")
                  if (!exID) alert("Enter field key")
                  if (
                    exID &&
                    hasPath([col, "__docs", doc, "__data", newField])(base)
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
                    case "sub collection":
                      if (/^\s*$/.test(newField)) {
                        alert("Enter Collection ID")
                        return
                      } else if (
                        hasPath([col, "__docs", doc, "subs", newField])(base)
                      ) {
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
                  const res = await fn.queryDB({
                    method,
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
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  let query = `${newSchemas}, ${col_path}`
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
                onClick={async () => {
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
                  let query = `{times: ${newTimes || null}, start: ${
                    newStart || null
                  }, end: ${newEnd || null},do: ${
                    newDo ? "true" : "false"
                  }, span: ${newSpan * 1}, jobs: ${newCron}}, "${newCronName}"`
                  const res = await fn.queryDB({
                    method: "addCron",
                    query,
                    contractTxId,
                  })
                  if (/^Error:/.test(res)) {
                    alert("Something went wrong")
                  } else {
                    setAddCron(false)
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
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  let query = `${newRules2}, ${col_path}`
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
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(col)
                  )(base_path)
                  let query = `${newIndex}, ${col_path}`
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
        {$.signing_in_modal ? (
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
            onClick={() => set(false, "signing_in_modal")}
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
                  await fn.createTempAddress({ contractTxId })
                  set(false, "signing_in")
                  set(false, "signing_in_modal")
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
                  await fn.createTempAddressWithII({ contractTxId })
                  set(false, "signing_in")
                  set(false, "signing_in_modal")
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
                  await fn.createTempAddressWithAR({ contractTxId })
                  set(false, "signing_in")
                  set(false, "signing_in_modal")
                }}
              >
                <Image height="100px" src="/static/images/arconnect.png" />
                <Box textAlign="center">ArConnect</Box>
              </Flex>
            </Flex>
          </Flex>
        ) : null}
      </ChakraProvider>
    )
  },
  ["temp_current", "initWDB", "signing_in", "signing_in_modal"]
)
