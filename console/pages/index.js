import SDK from "weavedb-sdk"
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
  assoc,
  uniq,
  without,
  trim,
  reject,
  propEq,
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
  indexBy,
  prop,
  addIndex as _addIndex,
} from "ramda"
import lf from "localforage"
import { inject } from "roidjs"
import {
  connectAddress,
  connectAddressWithII,
  connectAddressWithAR,
  connectLocalhost,
  deployDB,
  checkTempAddress,
  switchTempAddress,
  setupWeaveDB,
  createTempAddress,
  createTempAddressWithII,
  createTempAddressWithAR,
  logoutTemp,
  queryDB,
  _addOwner,
  _removeOwner,
  _setCanEvolve,
  _setAlgorithms,
} from "../lib/weavedb.js"

const tabmap = {
  DB: { name: "DB Instances" },
  Data: { name: "Data Collections" },
  Schemas: { name: "Schemas" },
  Rules: { name: "Access Control Rules" },
  Indexes: { name: "Indexes" },
  Crons: { name: "Crons" },
}
let db, iv
export default inject(
  [
    "temp_current_all",
    "temp_current",
    "initWDB",
    "signing_in",
    "signing_in_modal",
    "owner_signing_in_modal",
    "loading",
    "loading_contract",
  ],
  ({ set, init, router, conf, fn, $ }) => {
    const [addCollection, setAddCollection] = useState(false)
    const [addSchemas, setAddSchemas] = useState(false)
    const [addDoc, setAddDoc] = useState(false)
    const [addData, setAddData] = useState(false)
    const [addRules, setAddRules] = useState(false)
    const [addCron, setAddCron] = useState(false)
    const [addIndex, setAddIndex] = useState(false)
    const [addInstance, setAddInstance] = useState(false)
    const [addOwner, setAddOwner] = useState(false)
    const [addCanEvolve, setAddCanEvolve] = useState(false)
    const [addAlgorithms, setAddAlgorithms] = useState(false)
    const [addGRPC, setAddGRPC] = useState(false)

    const [newOwner, setNewOwner] = useState("")
    const [result, setResult] = useState("")
    const [state, setState] = useState(null)
    const [doc_path, setDocPath] = useState([])
    const [tab, setTab] = useState("DB")
    const [cron, setCron] = useState(null)
    const [method, setMethod] = useState("get")
    const [query, setQuery] = useState("")
    const tabs = ["DB", "Data", "Schemas", "Rules", "Indexes", "Crons"]
    const [port, setPort] = useState(null)
    const [network, setNetwork] = useState("Mainnet")
    const [newNetwork, setNewNetwork] = useState("Mainnet")
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
    const networks = ["Mainnet", "Localhost"]
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
    const [contractTxId, setContractTxId] = useState(null)
    const [newContractTxId, setNewContractTxId] = useState("")
    const [newRPC, setNewRPC] = useState("")
    const [newRPC2, setNewRPC2] = useState("")
    const [deployMode, setDeployMode] = useState("Connect")
    const [dbs, setDBs] = useState([])
    const [currentDB, setCurrentDB] = useState(null)
    const [connect, setConnect] = useState(false)
    const [newPort, setNewPort] = useState(1820)
    const [auths, setAuths] = useState(["Arweave", "EVM", "DFINITY", "Intmax"])
    const [newAuths, setNewAuths] = useState([
      "Arweave",
      "EVM",
      "DFINITY",
      "Intmax",
    ])
    const [secure, setSecure] = useState(true)
    const [canEvolve, setCanEvolve] = useState(true)

    const addDB = async _db => {
      const dbmap = indexBy(prop("contractTxId"), dbs)
      if (isNil(dbmap[_db.contractTxId])) {
        const _dbs = append(_db, dbs)
        setDBs(_dbs)
        await lf.setItem(`my_dbs`, _dbs)
      }
    }

    const updateDB = async _db => {
      const dbmap = indexBy(prop("contractTxId"), dbs)
      if (!isNil(dbmap[_db.contractTxId])) {
        dbmap[_db.contractTxId] = _db
        const _dbs = values(dbmap)
        setDBs(_dbs)
        await lf.setItem(`my_dbs`, _dbs)
      }
    }
    const removeDB = async _db => {
      const dbmap = indexBy(prop("contractTxId"), dbs)
      if (!isNil(dbmap[_db.contractTxId])) {
        const _dbs = reject(propEq("contractTxId", _db.contractTxId), dbs)
        setDBs(_dbs)
        await lf.setItem(`my_dbs`, _dbs)
      }
    }

    useEffect(() => {
      ;(async () => {
        if (addAlgorithms) setNewAuths(state.auth.algorithms)
      })()
    }, [addAlgorithms])

    useEffect(() => {
      ;(async () => {
        const db = new SDK({
          contractTxId: "4H85bexFaqZH6Eq1p3Q92eNocsV2PAfLu3JYIKHJOhk",
        })
        await db.initializeWithoutWallet()
      })()
    }, [])

    useEffect(() => {
      ;(async () => {
        let _dbs = (await lf.getItem(`my_dbs`)) || []
        const dbmap = indexBy(prop("contractTxId"), _dbs)
        setDBs(_dbs)
      })()
    }, [])

    const _setContractTxId = async (_contractTxId, network, rpc) => {
      setContractTxId(_contractTxId)
      if (!isNil(_contractTxId)) {
        set(_contractTxId, "loading_contract")
        db = await fn(setupWeaveDB)({
          network,
          contractTxId: _contractTxId,
          port,
          rpc,
        })
        setState((await db.db.readState()).cachedValue.state)
        set(null, "loading_contract")
        fn(switchTempAddress)({ contractTxId: _contractTxId })
      } else {
        db = await fn(setupWeaveDB)({ network: "Mainnet" })
      }
      setInitDB(true)
    }

    useEffect(() => {
      ;(async () => {
        if (initDB) {
          fn(checkTempAddress)({ contractTxId })
          clearInterval(iv)
        }
      })()
    }, [initDB, contractTxId])

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
      "getLinkedContract",
      "getAddressLink",
      "getEvolve",
      "getAlgorithms",
      "getOwner",
      "getVersion",
    ]
    const ConnectWallet = () => (
      <Flex
        py={2}
        px={6}
        bg={isNil(contractTxId) ? "#6441AF" : "#333"}
        color="white"
        sx={{
          borderRadius: "25px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        justifyContent="center"
        onClick={async () => {
          if (isNil(contractTxId)) {
            setAddInstance(true)
          } else if (isNil($.temp_current)) {
            set(true, "signing_in_modal")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn(logoutTemp)()
            }
          }
        }}
      >
        {isNil(contractTxId) ? (
          "Connect with DB"
        ) : isNil($.temp_current) ? (
          "Sign Into DB"
        ) : (
          <Flex align="center">
            <Image
              boxSize="25px"
              src={
                $.temp_wallet === "intmax"
                  ? "/static/images/intmax.png"
                  : $.temp_current.length < 88
                  ? /^0x/.test($.temp_current)
                    ? "/static/images/metamask.png"
                    : "/static/images/arconnect.png"
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
        const _port = await fn(connectLocalhost)({ port: newPort })
        if (!isNil(_port)) {
          setPort(_port)
          setConnect(false)
        }
      })()
    }, [])

    useEffect(() => {
      if (isNil(port)) setNewNetwork("Mainnet")
    }, [port])

    useEffect(() => {
      if (
        addInstance &&
        !isNil($.temp_current_all) &&
        $.temp_current_all.type === "ii" &&
        $.temp_current_all.network !== newNetwork
      ) {
        set(null, "temp_current_all")
      }
    }, [newNetwork, addInstance])

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
    const linkStyle = {
      fontSize: "16px",
      display: "block",
      py: 1,
      as: "a",
      target: "_blank",
      sx: { ":hover": { opacity: 0.75 } },
    }
    const Footer = () => (
      <Flex
        bg="#333"
        color="white"
        p={4}
        justify="center"
        align="center"
        flex={1}
        direction="column"
        fontSize="12px"
      >
        <Flex maxW="900px" w="100%" justify="center">
          <Flex maxW="900px" w="100%">
            <Box flex={1} py={2} px={6}>
              <Flex align="center" fontSize="18px" fontWeight="bold" mb={3}>
                WeaveDB
              </Flex>
              <Box {...linkStyle} href="https://weavedb.dev">
                About
              </Box>
              <Box {...linkStyle} href="https://weavedb.mirror.xyz">
                Mirror Blog
              </Box>
              <Box
                {...linkStyle}
                href="https://docs.weavedb.dev/docs/category/example-dapps"
              >
                Demo Dapps
              </Box>
            </Box>
            <Box flex={1} py={2} px={6}>
              <Flex align="center" fontSize="18px" fontWeight="bold" mb={3}>
                Developer
              </Flex>
              <Box href="https://docs.weavedb.dev" {...linkStyle}>
                Documentation
              </Box>
              <Box {...linkStyle} href="https://fpjson.weavedb.dev">
                FPJSON
              </Box>
              <Box {...linkStyle} href="https://github.com/weavedb/weavedb">
                <Box as="i" className="fab fa-github" mr={2} />
                Github
              </Box>
            </Box>
            <Box flex={1} py={2} px={6}>
              <Flex align="center" fontSize="18px" fontWeight="bold" mb={3}>
                Community
              </Flex>
              <Box {...linkStyle} href="https://twitter.com/weave_db">
                <Box as="i" className="fab fa-twitter" mr={2} />
                Twitter
              </Box>
              <Box {...linkStyle} href="https://discord.com/invite/YMe3eqf69M">
                <Box as="i" className="fab fa-discord" mr={2} />
                Discord
              </Box>
              <Box
                {...linkStyle}
                href="https://gitcoin.co/grants/7716/weavedb-decentralized-nosql-database"
              >
                Gitcoin Grant
              </Box>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    )
    const owners = isNil(state)
      ? []
      : is(Array, state.owner)
      ? state.owner
      : [state.owner]
    const isOwner = isNil(state)
      ? false
      : includes(($.temp_current || "").toLowerCase(), state.owner)
    return (
      <ChakraProvider>
        <style global jsx>{`
          html,
          #__next,
          body {
            height: 100%;
            background: #333;
          }
        `}</style>
        <Flex
          h="100%"
          w="250px"
          bg="#eee"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
          }}
          pt="56px"
          direction="column"
        >
          {_addIndex(map)((v, i) => {
            return (
              <Flex
                onClick={() => setTab(v)}
                bg={v === tab ? "#6441AF" : "#eee"}
                color={v === tab ? "white" : "#333"}
                py={3}
                px={4}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                {tabmap[v].name}
              </Flex>
            )
          })(tabs)}
          <Flex flex={1} />
          <Flex
            fontSize="12px"
            p={4}
            bg="#6441AF"
            color="white"
            m={4}
            sx={{ borderRadius: "5px" }}
          >
            WeaveDB is still in alpha. Please use it with discretion.
          </Flex>
        </Flex>
        <Flex
          bg="white"
          width="100%"
          height="56px"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            borderBottom: "1px solid #ddd",
            boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.75)",
          }}
          align="center"
        >
          <Flex
            px={5}
            justify="flex-start"
            align="center"
            fontSize="16px"
            w="500px"
          >
            <Image
              boxSize="30px"
              src="/static/images/logo.png"
              sx={{ borderRadius: "50%" }}
              mr={3}
            />
            WeaveDB
          </Flex>
          <Flex flex={1} justify="center" fontSize="12px">
            {isNil(port) ? (
              <Flex onClick={() => setConnect(true)} sx={{ cursor: "pointer" }}>
                Connect with Localhost
              </Flex>
            ) : (
              <Flex
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  if (confirm("Would you like to disconnect?")) {
                    setPort(null)
                  }
                }}
              >
                Connected with local port{" "}
                <Box ml={2} color="#6441AF">
                  {port}
                </Box>
              </Flex>
            )}
          </Flex>
          <Flex
            w="250px"
            justify="flex-end"
            align="center"
            justifySelf="flex-end"
            px={5}
          >
            <ConnectWallet />
          </Flex>
        </Flex>

        <Flex
          sx={{
            backgroundImage:
              "radial-gradient(circle, #ffffff, #eeeeee, #dddddd, #cccccc, #bbbbbb)",
          }}
        >
          <Flex w="250px"></Flex>
          <Box flex={1}>
            <Flex align="center" direction="column" fontSize="12px" pt="60px">
              <Flex maxW="1200px" w="100%" direction="column" py={4} px={10}>
                <Flex mb={3} align="center" fontSize="14px">
                  WeaveDB (
                  {isNil(contractTxId) ? "-" : contractTxId.slice(0, 7)})
                  {_addIndex(map)((v, i) => (
                    <>
                      <Box mx={2} as="i" className="fas fa-angle-right" />
                      <Box
                        onClick={() => setDocPath(take(i + 1, doc_path))}
                        sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                        as="span"
                        color={i === doc_path.length - 1 ? "#6441AF" : ""}
                      >
                        {v}
                      </Box>
                    </>
                  ))(doc_path)}
                </Flex>
                <Flex height="550px" maxW="1200px" w="100%">
                  <Flex h="550px" w="100%" bg="white">
                    {includes(tab)(["DB", "Crons"]) ? null : (
                      <Box
                        flex={1}
                        sx={{ border: "1px solid #555" }}
                        direction="column"
                      >
                        <Flex py={2} px={3} color="white" bg="#333" h="35px">
                          <Box>Collections</Box>
                          <Box flex={1} />
                          {!includes(tab, ["Data"]) ? null : (
                            <Box
                              onClick={() => setAddCollection(true)}
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                              }}
                            >
                              <Box as="i" className="fas fa-plus" />
                            </Box>
                          )}
                        </Flex>
                        {map(v => (
                          <Flex
                            onClick={() => {
                              setDocPath([...base_path, v])
                            }}
                            bg={col === v ? "#ddd" : ""}
                            py={2}
                            px={3}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
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
                          <Box>Schemas</Box>
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
                          <JSONPretty
                            id="json-pretty"
                            data={schema}
                          ></JSONPretty>
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
                          <JSONPretty
                            id="json-pretty"
                            data={rules}
                          ></JSONPretty>
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
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      let query = `"${v}"`
                                      if (
                                        confirm(
                                          "Would you like to remove the cron?"
                                        )
                                      ) {
                                        const res = await fn(queryDB)({
                                          method: "removeCron",
                                          query,
                                          contractTxId,
                                        })
                                        if (/^Error:/.test(res)) {
                                          alert("Something went wrong")
                                        }
                                        setState(
                                          (await db.db.readState()).cachedValue
                                            .state
                                        )
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
                                  <Box flex={1}>
                                    {_cron.do ? "true" : "false"}
                                  </Box>
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
                    ) : tab === "DB" ? (
                      <>
                        <Flex
                          flex={1}
                          sx={{ border: "1px solid #555" }}
                          direction="column"
                        >
                          <Flex py={2} px={3} color="white" bg="#333" h="35px">
                            WeaveDB Instances
                            <Box flex={1} />
                            <Box
                              onClick={() => setAddInstance(true)}
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
                                  onClick={async () => {
                                    if (contractTxId !== v.contractTxId) {
                                      if (
                                        v.network === "Localhost" &&
                                        isNil(port)
                                      ) {
                                        alert("not connected with localhost")
                                        return
                                      }
                                      try {
                                        const db = await fn(setupWeaveDB)({
                                          network: v.network,
                                          contractTxId: v.contractTxId,
                                          port: port || 1820,
                                          rpc: v.rpc,
                                        })
                                        let state = await db.db.readState()
                                        if (!isNil(state.cachedValue)) {
                                          setState(null)
                                          setNetwork(v.network)
                                          setCurrentDB(v)
                                          await _setContractTxId(
                                            v.contractTxId,
                                            v.network,
                                            v.rpc
                                          )
                                        } else {
                                          alert(
                                            "couldn't connect to the contract"
                                          )
                                        }
                                      } catch (e) {
                                        alert(
                                          "couldn't connect to the contract"
                                        )
                                      }
                                    }
                                  }}
                                  p={2}
                                  px={3}
                                  bg={
                                    contractTxId === v.contractTxId
                                      ? "#ddd"
                                      : ""
                                  }
                                  sx={{
                                    cursor: "pointer",
                                    ":hover": { opacity: 0.75 },
                                  }}
                                >
                                  <Box
                                    mr={2}
                                    px={3}
                                    w="80px"
                                    textAlign="center"
                                    bg={
                                      v.network === "Mainnet"
                                        ? "#6441AF"
                                        : "#333"
                                    }
                                    color="white"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    {v.network}
                                  </Box>
                                  <Box flex={1}>{v.contractTxId}</Box>
                                  <Box
                                    color="#999"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      if (
                                        confirm(
                                          "Would you like to remove the link to this instance?"
                                        )
                                      ) {
                                        removeDB(v)
                                        if (contractTxId === v.contractTxId) {
                                          setState(null)
                                          setNetwork("Mainnet")
                                          setContractTxId(null)
                                        }
                                      }
                                    }}
                                  >
                                    <Box as="i" className="fas fa-trash" />
                                  </Box>
                                </Flex>
                              ))
                            )(dbs)}
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
                            {isNil(contractTxId) || isNil(currentDB) ? (
                              <Flex
                                justify="center"
                                align="center"
                                height="100%"
                              >
                                Please connect with a DB instance.
                              </Flex>
                            ) : contractTxId === $.loading_contract ? (
                              <Flex
                                justify="center"
                                align="center"
                                height="100%"
                              >
                                <Box
                                  color="#6441AF"
                                  as="i"
                                  className="fas fa-spin fa-circle-notch"
                                  fontSize="50px"
                                />
                              </Flex>
                            ) : isNil(state) || isNil(state.auth) ? null : (
                              <>
                                <Flex align="center" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    gRPC Node
                                  </Box>
                                  <Box flex={1}>
                                    {(currentDB.rpc || "") === ""
                                      ? "None (Browser SDK)"
                                      : currentDB.rpc}
                                  </Box>
                                  <Box
                                    color="#999"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      setNewRPC2(currentDB.rpc || "")
                                      setAddGRPC(true)
                                    }}
                                  >
                                    <Box as="i" className="fas fa-edit" />
                                  </Box>
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
                                  <Box
                                    as="a"
                                    target="_blank"
                                    color={
                                      network === "Mainnet" ? "#6441AF" : "#333"
                                    }
                                    sx={{
                                      textDecoration:
                                        network === "Mainnet"
                                          ? "underline"
                                          : "none",
                                    }}
                                    href={
                                      network === "Mainnet"
                                        ? `https://sonar.warp.cc/?#/app/contract/${contractTxId}`
                                        : null
                                    }
                                  >
                                    {contractTxId}
                                  </Box>
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
                                    DB Version
                                  </Box>
                                  {state.version || "less than 0.7.0"}
                                </Flex>
                                <Flex align="center" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    EIP712 Name
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
                                    EIP712 Version
                                  </Box>
                                  {state.auth.version}
                                </Flex>
                                <Flex align="flex-start" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg={isOwner ? "#6441AF" : "#ddd"}
                                    color={isOwner ? "white" : "#333"}
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    Owner
                                  </Box>
                                  <Box flex={1}>
                                    {map(v => <Box>{v}</Box>)(owners)}
                                  </Box>
                                  <Box
                                    color="#999"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      if (!isOwner) {
                                        alert(`Sign in with the owner account.`)
                                        return
                                      }
                                      setAddOwner(true)
                                    }}
                                  >
                                    <Box as="i" className="fas fa-edit" />
                                  </Box>
                                </Flex>
                                <Flex align="center" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    canEvolve
                                  </Box>
                                  <Flex flex={1}>
                                    {state.canEvolve ? "true" : "false"}
                                  </Flex>
                                  <Box
                                    color="#999"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      if (!isOwner) {
                                        alert(`Sign in with the owner account.`)
                                        return
                                      }
                                      setAddCanEvolve(true)
                                    }}
                                  >
                                    <Box as="i" className="fas fa-edit" />
                                  </Box>
                                </Flex>
                                <Flex align="center" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    evolve
                                  </Box>
                                  {isNil(state.evolve) ? "null" : state.evolve}
                                </Flex>
                                <Flex align="center" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    secure
                                  </Box>
                                  {state.secure ? "true" : "false"}
                                </Flex>
                                <Flex align="center" p={2} px={3}>
                                  <Box
                                    mr={2}
                                    px={3}
                                    bg="#ddd"
                                    sx={{ borderRadius: "3px" }}
                                  >
                                    Authentication
                                  </Box>
                                  <Flex flex={1}>
                                    {map(v => <Box mr={2}>{v}</Box>)(
                                      state.auth.algorithms || []
                                    )}
                                  </Flex>
                                  <Box
                                    color="#999"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      if (!isOwner) {
                                        alert(`Sign in with the owner account.`)
                                        return
                                      }
                                      setAddAlgorithms(true)
                                    }}
                                  >
                                    <Box as="i" className="fas fa-edit" />
                                  </Box>
                                </Flex>
                                <Flex align="center" p={2} px={3}>
                                  <Flex
                                    sx={{ borderBottom: "1px solid #333" }}
                                    w="100%"
                                  >
                                    <Box sx={{ borderRadius: "3px" }}>
                                      Plugin Contracts
                                    </Box>
                                  </Flex>
                                </Flex>
                                <Flex direction="column" align="center">
                                  {compose(
                                    values,
                                    mapObjIndexed((v, k, i) => (
                                      <Flex w="100%" px={3} py={2}>
                                        <Flex
                                          mr={2}
                                          px={3}
                                          bg="#ddd"
                                          sx={{ borderRadius: "3px" }}
                                        >
                                          {k}
                                        </Flex>
                                        <Box flex={1} mr={2}>
                                          {v}
                                        </Box>
                                      </Flex>
                                    ))
                                  )(state.contracts || [])}
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
                          sx={{ border: "1px solid #555", overflowX: "hidden" }}
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
                                <Box
                                  mr={3}
                                  flex={1}
                                  sx={{ overflowX: "hidden" }}
                                >
                                  {v}
                                </Box>
                                <Box
                                  color="#999"
                                  sx={{
                                    cursor: "pointer",
                                    ":hover": {
                                      opacity: 0.75,
                                      color: "#6441AF",
                                    },
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
                                      confirm(
                                        "Would you like to delete the doc?"
                                      )
                                    ) {
                                      const res = await fn(queryDB)({
                                        method: "delete",
                                        query,
                                        contractTxId,
                                      })
                                      if (/^Error:/.test(res)) {
                                        alert("Something went wrong")
                                      }
                                      setState(
                                        (await db.db.readState()).cachedValue
                                          .state
                                      )
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
                          sx={{ border: "1px solid #555", overflowX: "hidden" }}
                          direction="column"
                        >
                          <Flex py={2} px={3} color="white" bg="#333" h="35px">
                            <Box>Data</Box>
                            <Box flex={1} />
                            {isNil(col) ||
                            isNil(doc) ||
                            !hasPath([
                              "data",
                              doc_path[0],
                              "__docs",
                              doc_path[1],
                            ])(state) ? null : (
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
                                  <Box
                                    flex={1}
                                    sx={{ overflowX: "hidden" }}
                                    mr={2}
                                  >
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
                                      ":hover": {
                                        opacity: 0.75,
                                        color: "#6441AF",
                                      },
                                    }}
                                    onClick={async e => {
                                      e.stopPropagation()
                                      if (
                                        !hasPath([
                                          col,
                                          "__docs",
                                          doc,
                                          "__data",
                                          k,
                                        ])(base)
                                      ) {
                                        alert("Field doesn't exist")
                                        return
                                      }
                                      let query = ""
                                      const method = "update"
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
                                        const res = await fn(queryDB)({
                                          method,
                                          query,
                                          contractTxId,
                                        })
                                        if (/^Error:/.test(res)) {
                                          alert("Something went wrong")
                                        }
                                        setState(
                                          (await db.db.readState()).cachedValue
                                            .state
                                        )
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
                <Flex
                  w="100%"
                  justify="center"
                  mb={3}
                  mt={3}
                  bg="white"
                  sx={{
                    border: "1px solid #333",
                    borderRadius: "5px",
                  }}
                >
                  <Select
                    w="200px"
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    sx={{
                      borderRadius: "5px 0 0 5px",
                    }}
                  >
                    {map(v => <option value={v}>{v}</option>)(methods)}
                  </Select>
                  <Input
                    flex={1}
                    sx={{
                      border: "",
                      borderLeft: "1px solid #333",
                      borderRadius: "0px",
                    }}
                    placeholder="query"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                  <Flex
                    sx={{
                      borderRadius: "0 5px 5px 0",
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
                        const res = await fn(queryDB)({
                          query,
                          method,
                          contractTxId,
                        })
                        setResult(res)
                        setState((await db.db.readState()).cachedValue.state)
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
                  bg="white"
                  w="100%"
                  justify="center"
                  mb={3}
                  sx={{ border: "1px solid #111", borderRadius: "5px" }}
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
                    color={/^Error:/.test(result) ? "#6441AF" : "#333"}
                    p={2}
                  >
                    {result}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Footer />
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
                    height="40px"
                    onClick={async () => {
                      if (isNil($.loading)) {
                        if (/^\s*$/.test(newCollection)) {
                          alert("Enter Collection ID")
                          return
                        } else if (hasPath([newCollection])(base)) {
                          alert("Collection exists")
                          return
                        }
                        set("add_collection", "loading")
                        try {
                          JSON.parse(newRules)
                        } catch (e) {
                          alert("Wrong JSON format")
                          return
                        }

                        const res = await fn(queryDB)({
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
                          setNewCollection("")
                          setNewRules(`{"allow write": true}`)
                          setAddCollection(false)
                        }
                        set(null, "loading")
                        setState((await db.db.readState()).cachedValue.state)
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
                    height="40px"
                    onClick={async () => {
                      if (isNil($.loading)) {
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
                        set("add_doc", "loading")
                        let col_path = compose(
                          join(", "),
                          map(v => `"${v}"`),
                          append(col)
                        )(base_path)
                        let query = `${newData}, ${col_path}`
                        if (exID) query += `, "${newDoc}"`
                        const res = await fn(queryDB)({
                          method: exID ? "set" : "add",
                          query,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        } else {
                          setNewDoc("")
                          setNewData(`{}`)
                          setAddDoc(false)
                        }
                        setState((await db.db.readState()).cachedValue.state)
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
                      {map(v => (
                        <option value={v}>{v ? "true" : "false"}</option>
                      ))([true, false])}
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
                        if (
                          exID &&
                          hasPath([col, "__docs", doc, "__data", newField])(
                            base
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
                          case "sub collection":
                            if (/^\s*$/.test(newField)) {
                              alert("Enter Collection ID")
                              return
                            } else if (
                              hasPath([col, "__docs", doc, "subs", newField])(
                                base
                              )
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
                        const res = await fn(queryDB)({
                          method,
                          query,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        } else {
                          setNewField("")
                          setNewFieldVal("")
                          setAddData(false)
                        }
                        setState((await db.db.readState()).cachedValue.state)
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
                        const res = await fn(queryDB)({
                          method: "setSchema",
                          query,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        } else {
                          setNewSchemas("")
                          setAddSchemas(false)
                        }
                        setState((await db.db.readState()).cachedValue.state)
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
                        let query = `{times: ${newTimes || null}, start: ${
                          newStart || null
                        }, end: ${newEnd || null},do: ${
                          newDo ? "true" : "false"
                        }, span: ${
                          newSpan * 1
                        }, jobs: ${newCron}}, "${newCronName}"`
                        const res = await fn(queryDB)({
                          method: "addCron",
                          query,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        } else {
                          setNewCron("")
                          setNewStart("")
                          setNewCronName("")
                          setNewEnd("")
                          setNewTimes("")
                          setNewSpan("")
                          setAddCron(false)
                        }
                        setState((await db.db.readState()).cachedValue.state)
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
                        let query = `${newRules2}, ${col_path}`
                        const res = await fn(queryDB)({
                          method: "setRules",
                          query,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        } else {
                          setNewRules2(`{"allow write": true}`)
                          setAddRules(false)
                        }
                        setState((await db.db.readState()).cachedValue.state)
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
                              } else if (
                                !confirm(`Would you like to remove ${v}?`)
                              ) {
                                return
                              }
                              const res = await fn(_removeOwner)({
                                address: v,
                                contractTxId,
                              })
                              if (/^Error:/.test(res)) {
                                alert("Something went wrong")
                              }
                              setState(
                                (await db.db.readState()).cachedValue.state
                              )
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
                          setState((await db.db.readState()).cachedValue.state)
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
                        setState((await db.db.readState()).cachedValue.state)
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
                          setState((await db.db.readState()).cachedValue.state)
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
                          compose(
                            includes(serialize(obj)),
                            map(serialize)
                          )(indexes)
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
                        const res = await fn(queryDB)({
                          method: "addIndex",
                          query,
                          contractTxId,
                        })
                        if (/^Error:/.test(res)) {
                          alert("Something went wrong")
                        } else {
                          setNewIndex("[]")
                          setAddIndex(false)
                        }
                        setState((await db.db.readState()).cachedValue.state)
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
                            onChange={e =>
                              setCanEvolve(e.target.value === "True")
                            }
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
                      <Input
                        placeholder="https://grpc.example.com"
                        flex={1}
                        value={newRPC}
                        onChange={e => setNewRPC(trim(e.target.value))}
                        sx={{ borderRadius: 0 }}
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
                            if (!/^\s*$/.test(newContractTxId)) {
                              set("connect_to_db", "loading")
                              try {
                                const db = await fn(setupWeaveDB)({
                                  network: newNetwork,
                                  contractTxId: newContractTxId,
                                  port: port || 1820,
                                  rpc: newRPC,
                                })
                                let state = await db.db.readState()
                                if (!isNil(state.cachedValue)) {
                                  setNetwork(newNetwork)
                                  await _setContractTxId(
                                    newContractTxId,
                                    newNetwork,
                                    newRPC
                                  )
                                  setEditNetwork(false)
                                  addDB({
                                    network: newNetwork,
                                    port:
                                      newNetwork === "Localhost" ? port : 443,
                                    contractTxId: newContractTxId,
                                    rpc: newRPC,
                                  })
                                  setAddInstance(false)
                                  setNewContractTxId("")
                                  setNewRPC("")
                                } else {
                                  alert("couldn't connect to the contract")
                                }
                              } catch (e) {
                                alert("couldn't connect to the contract")
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
                      RPC URL (Optional)
                    </Flex>
                    <Input
                      placeholder="https://grpc.example.com"
                      flex={1}
                      value={newRPC2}
                      onChange={e => setNewRPC2(trim(e.target.value))}
                      sx={{ borderRadius: 0 }}
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
                          set("connect_to_db", "loading")
                          const db = await fn(setupWeaveDB)({
                            network: currentDB.network,
                            contractTxId: currentDB.contractTxId,
                            port: currentDB.port,
                            rpc: newRPC,
                          })
                          const newDB = assoc("rpc", newRPC2, currentDB)
                          updateDB(newDB)
                          setCurrentDB(newDB)
                          setAddGRPC(false)
                          setNewRPC2("")
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
                            })
                          }
                          set(false, "signing_in")
                          set(false, "signing_in_modal")
                          set(false, "owner_signing_in_modal")
                        }}
                      >
                        <Image
                          height="100px"
                          src="/static/images/metamask.png"
                        />
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
                            })
                          }
                          set(false, "signing_in")
                          set(false, "signing_in_modal")
                          set(false, "owner_signing_in_modal")
                        }}
                      >
                        <Image
                          height="100px"
                          src="/static/images/dfinity.png"
                        />
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
                            })
                          }
                          set(false, "signing_in")
                          set(false, "signing_in_modal")
                          set(false, "owner_signing_in_modal")
                        }}
                      >
                        <Image
                          height="100px"
                          src="/static/images/arconnect.png"
                        />
                        <Box textAlign="center">ArConnect</Box>
                      </Flex>
                    </>
                  )}
                </Flex>
              </Flex>
            ) : null}
          </Box>
        </Flex>
      </ChakraProvider>
    )
  }
)
