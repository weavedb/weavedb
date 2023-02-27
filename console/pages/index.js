import SDK from "weavedb-sdk"
import { useEffect, useState } from "react"
import { ChakraProvider, Box, Flex } from "@chakra-ui/react"
import {
  toLower,
  reject,
  propEq,
  take,
  values,
  keys,
  isNil,
  map,
  is,
  includes,
  append,
  indexBy,
  prop,
} from "ramda"
import lf from "localforage"
import { inject } from "roidjs"
import GlobalStyle from "../components/GlobalStyle"
import Footer from "../components/Footer"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Collections from "../components/Collections"
import Data from "../components/Data"
import Indexes from "../components/Indexes"
import Nodes from "../components/Nodes"
import DB from "../components/DB"
import Schemas from "../components/Schemas"
import Rules from "../components/Rules"
import Crons from "../components/Crons"
import Relayers from "../components/Relayers"
import Modals from "../components/Modals"
import Paths from "../components/Paths"
import Console from "../components/Console"

import { wallet_chains, default_nodes } from "../lib/const"
import {
  connectLocalhost,
  checkTempAddress,
  switchTempAddress,
  setupWeaveDB,
  read,
  checkNonce,
} from "../lib/weavedb"

let db

export default inject(
  ["temp_current_all", "temp_current", "loading_contract", "tx_logs"],
  ({ set, init, router, conf, fn, $ }) => {
    const [loadMore, setLoadMore] = useState(null)
    const [whitelist, setWhitelist] = useState([])
    const [editGRPC, setEditGRPC] = useState(null)
    const [addCollection, setAddCollection] = useState(false)
    const [addSchema, setAddSchema] = useState(false)
    const [schema, setSchema] = useState(null)
    const [rules, setRules] = useState(null)
    const [indexes, setIndexes] = useState([])
    const [crons, setCrons] = useState({})
    const [relayers, setRelayers] = useState([])
    const [addDoc, setAddDoc] = useState(false)
    const [addData, setAddData] = useState(false)
    const [addRules, setAddRules] = useState(false)
    const [addCron, setAddCron] = useState(false)
    const [addRelayer, setAddRelayer] = useState(false)
    const [addNode, setAddNode] = useState(false)
    const [addContract, setAddContract] = useState(false)
    const [contracts, setContracts] = useState([])
    const [addIndex, setAddIndex] = useState(false)
    const [addInstance, setAddInstance] = useState(false)
    const [addOwner, setAddOwner] = useState(false)
    const [addWhitelist, setAddWhitelist] = useState(false)
    const [addNodeOwner, setAddNodeOwner] = useState(false)
    const [addCanEvolve, setAddCanEvolve] = useState(false)
    const [addEvolve, setAddEvolve] = useState(false)
    const [addSecure, setAddSecure] = useState(false)
    const [addAlgorithms, setAddAlgorithms] = useState(false)
    const [addGRPC, setAddGRPC] = useState(false)
    const [newHttp, setNewHttp] = useState("https://")
    const [result, setResult] = useState("")
    const [state, setState] = useState(null)
    const [collections, setCollections] = useState([])
    const [subCollections, setSubCollections] = useState([])
    const [documents, setDocuments] = useState([])
    const [docdata, setDocdata] = useState(null)
    const [doc_path, setDocPath] = useState([])
    const [tab, setTab] = useState("DB")
    const [cron, setCron] = useState(null)
    const [relayer, setRelayer] = useState(null)
    const [method, setMethod] = useState("get")
    const [isWhitelisted, setIsWhitelisted] = useState(false)
    const [nodeUser, setNodeUser] = useState(false)
    const [query, setQuery] = useState("")
    const [port, setPort] = useState(null)
    const [network, setNetwork] = useState("Mainnet")
    const networks = ["Mainnet", "Localhost"]
    const [initDB, setInitDB] = useState(false)
    const [networkErr, setNetworkErr] = useState(false)
    const [contractTxId, setContractTxId] = useState(null)
    const [newRPCType, setNewRPCType] = useState("sdk")
    const [newRPC2, setNewRPC2] = useState("")
    const [newSchema, setNewSchema] = useState("")
    const [newIndex, setNewIndex] = useState("")
    const [newRules, setNewRules] = useState("")
    const [presetRPC, setPresetRPC] = useState("https://grpc.weavedb-node.xyz")
    const [dbs, setDBs] = useState([])
    const [node, setNode] = useState(null)
    const [nodes, setNodes] = useState([])
    const [currentDB, setCurrentDB] = useState(null)
    const [connect, setConnect] = useState(false)
    const [newPort, setNewPort] = useState(1820)
    const [allow, setAllow] = useState(true)
    const [limit, setLimit] = useState(true)
    const [numLimit, setNumLimit] = useState(5)
    const [newWhitelistUser, setNewWhitelistUser] = useState("")
    const [editWhitelist, setEditWhitelist] = useState(false)
    const [newNetwork, setNewNetwork] = useState("Mainnet")
    const [newAuths, setNewAuths] = useState(wallet_chains)

    const addGRPCNode = async _node => {
      const nodemap = indexBy(prop("rpc"), nodes)
      if (isNil(nodemap[_node.rpc])) {
        const _nodes = append(_node, nodes)
        setNodes(_nodes)
        await lf.setItem(`my_nodes`, _nodes)
        if (isNil(node)) setNode(_node)
      } else {
        await updateGRPCNode(_node)
      }
    }

    const updateGRPCNode = async _node => {
      const nodemap = indexBy(prop("rpc"), nodes)
      if (!isNil(nodemap[_node.rpc])) {
        nodemap[_node.rpc] = _node
        const _nodes = values(nodemap)
        setNodes(_nodes)
        await lf.setItem(`my_nodes`, _nodes)
      }
    }

    const removeGRPCNode = async _node => {
      const nodemap = indexBy(prop("rpc"), nodes)
      if (!isNil(nodemap[_node.rpc])) {
        const _nodes = reject(propEq("rpc", _node.rpc), nodes)
        setNodes(_nodes)
        await lf.setItem(`my_nodes`, _nodes)
        if (!isNil(node) && _node.rpc === node.rpc) setNode(null)
      }
    }

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
    let col = null
    let doc = null
    let base_path = []
    if (!isNil(state)) {
      if (doc_path.length !== 0) {
        col =
          doc_path[
            doc_path.length % 2 === 0
              ? doc_path.length - 2
              : doc_path.length - 1
          ]
        doc = doc_path.length % 2 === 0 ? doc_path[doc_path.length - 1] : null
      }
      if (doc_path.length > 2) {
        base_path = take(
          doc_path.length % 2 === 0 ? doc_path.length - 2 : doc_path.length - 1,
          doc_path
        )
      }
    }

    useEffect(() => {
      ;(async () => {
        if (!isNil(node)) {
        }
      })()
    }, [node])

    useEffect(() => {
      if (!isNil($.temp_current) && !isNil(currentDB)) {
        fn(checkNonce)({ db: currentDB, addr: $.temp_current })
      }
    }, [$.temp_current])

    useEffect(() => {
      ;(async () => {
        if (!isNil(currentDB) && !$.loading_contract) {
          setCollections(await fn(read)({ db, m: "listCollections", q: [] }))
        }
      })()
    }, [contractTxId, currentDB, $.loading_contract])

    useEffect(() => {
      ;(async () => {
        if (tab === "Schemas") {
          if (!isNil(col)) {
            setSchema(
              await fn(read)({
                db,
                m: "getSchema",
                q: [
                  ...(doc_path.length % 2 === 0
                    ? doc_path.slice(0, -1)
                    : doc_path),
                ],
              })
            )
          }
        } else if (tab === "Rules") {
          if (!isNil(col)) {
            setRules(
              await fn(read)({
                db,
                m: "getRules",
                q: [
                  ...(doc_path.length % 2 === 0
                    ? doc_path.slice(0, -1)
                    : doc_path),
                ],
              })
            )
          }
        } else if (tab === "Indexes") {
          if (!isNil(col)) {
            setIndexes(
              await fn(read)({
                db,
                m: "getIndexes",
                q: [
                  ...(doc_path.length % 2 === 0
                    ? doc_path.slice(0, -1)
                    : doc_path),
                ],
              })
            )
          }
        } else if (tab === "Crons") {
          setCrons(await fn(read)({ db, m: "getCrons", q: [] }))
        } else if (tab === "Relayers") {
          setRelayers(await fn(read)({ db, m: "listRelayerJobs", q: [] }))
        }
      })()
    }, [contractTxId, tab, doc_path])
    useEffect(() => {
      ;(async () => {
        if (addAlgorithms) setNewAuths(state.auth.algorithms)
      })()
    }, [addAlgorithms])

    useEffect(() => {
      ;(async () => {
        setDBs((await lf.getItem(`my_dbs`)) || [])
        let _nodes = (await lf.getItem(`my_nodes`)) || []
        if (_nodes.length === 0) {
          _nodes = default_nodes
        }
        setNodes(_nodes)
      })()
    }, [])

    const _setContractTxId = async (
      _contractTxId,
      network,
      rpc,
      _db,
      state
    ) => {
      setContractTxId(_contractTxId)
      if (!isNil(_contractTxId)) {
        set(_contractTxId, "loading_contract")
        db =
          _db ||
          (await fn(setupWeaveDB)({
            network,
            contractTxId: _contractTxId,
            port,
            rpc,
          }))
        let info = state || (await fn(read)({ db, m: "getInfo", q: [] }))
        setState(info)
        setDocuments([])
        setDocdata(null)
        setDocPath([])
        set(null, "loading_contract")
        fn(switchTempAddress)({ contractTxId: _contractTxId })
        if (isNil(info.version)) {
          info.version = await fn(read)({
            db,
            m: "getVersion",
            q: [true],
          })
          setState(info)
        }
      } else {
        db = _db || (await fn(setupWeaveDB)({ network: "Mainnet" }))
      }
      setInitDB(true)
    }

    useEffect(() => {
      ;(async () => {
        if (initDB) {
          fn(checkTempAddress)({ contractTxId })
        }
      })()
    }, [initDB, contractTxId])

    let _cron = null
    if (!isNil(crons) && !isNil(crons.crons)) {
      _cron = crons.crons[cron]
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
      ;(async () => {
        if (!isNil(node) && !isNil($.temp_current_all)) {
          let isNodeOwner = false
          if (!isNil($.temp_current_all) && !isNil(node)) {
            const addr = /^0x.+$/.test($.temp_current_all.addr)
              ? $.temp_current_all.addr.toLowerCase()
              : $.temp_current_all.addr
            isNodeOwner = includes(addr)(node.owners || [])
          }

          const db = await fn(setupWeaveDB)({
            contractTxId: node.contract,
            rpc: node.rpc,
            temp: true,
          })
          const addr = /^0x.+$/.test($.temp_current_all.addr)
            ? $.temp_current_all.addr.toLowerCase()
            : $.temp_current_all.addr
          let user = await fn(read)({ db, m: "get", q: ["users", addr, true] })
          let whitelisted = !isNil(user) && user.allow
          setIsWhitelisted(whitelisted)
          if (whitelisted) {
            setContracts(
              await fn(read)({
                db,
                m: "get",
                q: ["contracts", ["address", "=", addr], true],
              })
            )
            setNodeUser(user)
          } else {
            setContracts([])
            setNodeUser(null)
          }
          if (isNodeOwner) {
            setWhitelist(await fn(read)({ db, m: "get", q: ["users", true] }))
          } else {
            setWhitelist([])
          }
        } else {
          setNodeUser(null)
        }
      })()
    }, [node, $.temp_current_all])

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

    const owners = isNil(state)
      ? []
      : is(Array, state.owner)
      ? state.owner
      : [state.owner]
    const isOwner =
      isNil(state) || isNil($.temp_current)
        ? false
        : includes(
            ($.temp_current || "").toLowerCase(),
            map(toLower)(is(Array, state.owner) ? state.owner : [state.owner])
          )
    let isNodeOwner = false
    if (!isNil($.temp_current_all) && !isNil(node)) {
      const addr = /^0x.+$/.test($.temp_current_all.addr)
        ? $.temp_current_all.addr.toLowerCase()
        : $.temp_current_all.addr
      isNodeOwner = includes(addr)(node.owners || [])
    }
    const props = {
      Paths: {
        contractTxId,
        setDocPath,
        setCollections,
        doc_path,
        db,
      },
      Sidebar: { currentDB, setTab, tab },
      Header: {
        port,
        setPort,
        setConnect,
        tab,
        node,
        contractTxId,
        setAddInstance,
      },
      Collections: {
        tab,
        setAddCollection,
        setDocPath,
        setDocdata,
        setDocuments,
        setSubCollections,
        db,
        setLoadMore,
        base_path,
        collections,
        col,
      },
      Schemas: { col, schema, setAddSchema, setNewSchema, isOwner },
      Rules: { rules, setAddRules, col, setNewRules, isOwner },
      Crons: {
        cron,
        setAddCron,
        crons,
        setCron,
        setCrons,
        _cron,
        contractTxId,
        db,
        setState,
      },
      Relayers: {
        contractTxId,
        setRelayers,
        setAddRelayer,
        db,
        setRelayer,
        relayer,
        relayers,
      },
      Nodes: {
        updateGRPCNode,
        setContracts,
        setNewWhitelistUser,
        isNodeOwner,
        setNumLimit,
        setAllow,
        setLimit,
        nodes,
        whitelist,
        setAddWhitelist,
        setEditWhitelist,
        contracts,
        nodeUser,
        isWhitelisted,
        setAddNode,
        setNode,
        node,
        removeGRPCNode,
        setAddNodeOwner,
        setAddContract,
      },
      DB: {
        editGRPC,
        setEditGRPC,
        setPresetRPC,
        setNewRPCType,
        nodes,
        setNewHttp,
        setAddInstance,
        contractTxId,
        port,
        setState,
        setNetwork,
        setCurrentDB,
        setContractTxId,
        dbs,
        state,
        currentDB,
        setNewRPC2,
        setAddGRPC,
        network,
        owners,
        isOwner,
        setAddOwner,
        setAddSecure,
        setAddAlgorithms,
        setAddCanEvolve,
        setAddEvolve,
        _setContractTxId,
        removeDB,
      },
      Data: {
        col,
        documents,
        setAddData,
        loadMore,
        setCollections,
        subCollections,
        setLoadMore,
        setDocuments,
        db,
        docdata,
        base_path,
        setAddDoc,
        setDocPath,
        setDocdata,
        setSubCollections,
        contractTxId,
        doc_path,
        doc,
      },
      Modals: {
        newIndex,
        setNewIndex,
        newRules,
        setNewRules,
        newSchema,
        setNewSchema,
        editGRPC,
        setEditGRPC,
        newAuths,
        setNewAuths,
        newNetwork,
        setNewNetwork,
        nodes,
        presetRPC,
        setPresetRPC,
        newRPCType,
        setNewRPCType,
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
        networks,
        addSecure,
        setAddSecure,
        addIndex,
        setAddIndex,
        indexes,
        setIndexes,
        addInstance,
        port,
        setAddInstance,
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
        addContract,
        connect,
        setAddContract,
        setContracts,
        setRules,
        addOwner,
        setAddOwner,
        owners,
        setState,
        setAddAlgorithms,
        addAlgorithms,
        setAddRules,
        addRules,
        node,
        setAddNode,
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
        subCollections,
        docdata,
        addData,
        setAddData,
        setCollections,
        db,
        setAddDoc,
        addDoc,
        col,
        doc,
        setDocuments,
        documents,
        contractTxId,
        base_path,
        addCollection,
        setAddCollection,
      },
      Console: {
        result,
        method,
        contractTxId,
        setResult,
        setState,
        setMethod,
        db,
        setQuery,
        query,
      },
    }

    return (
      <ChakraProvider>
        <GlobalStyle />
        <Sidebar {...props.Sidebar} />
        <Header {...props.Header} />
        <Flex
          h="100%"
          fontSize="12px"
          sx={{
            backgroundImage:
              "radial-gradient(circle, #ffffff, #eeeeee, #dddddd, #cccccc, #bbbbbb)",
          }}
        >
          <Flex w="250px"></Flex>
          <Flex h="100%" flex={1} direction="column" pt="60px">
            <Flex flex={1}>
              <Box flex={1}>
                <Flex align="center" direction="column" h="100%">
                  <Flex
                    w="100%"
                    direction="column"
                    pt={4}
                    pb={10}
                    px={10}
                    h="100%"
                  >
                    <Paths {...props.Paths} />
                    <Flex flex={1} w="100%" bg="white">
                      <Collections {...props.Collections} />
                      {tab === "Schemas" ? (
                        <Schemas {...props.Schemas} />
                      ) : tab === "Rules" ? (
                        <Rules {...props.Rules} />
                      ) : tab === "Crons" ? (
                        <Crons {...props.Crons} />
                      ) : tab === "Relayers" ? (
                        <Relayers {...props.Relayers} />
                      ) : tab === "Nodes" ? (
                        <Nodes {...props.Nodes} />
                      ) : tab === "Indexes" ? (
                        <Indexes
                          {...{
                            isOwner,
                            setNewIndex,
                            indexes,
                            setAddIndex,
                            col,
                          }}
                        />
                      ) : tab === "DB" ? (
                        <DB {...props.DB} />
                      ) : (
                        <Data {...props.Data} />
                      )}
                    </Flex>
                  </Flex>
                </Flex>
                <Modals {...props.Modals} />
              </Box>
            </Flex>
            <Flex height="200px">
              <Console {...props.Console} />
            </Flex>
          </Flex>
        </Flex>
      </ChakraProvider>
    )
  }
)
