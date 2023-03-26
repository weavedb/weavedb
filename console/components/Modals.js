import { inject } from "roidjs"

import AddCollection from "./Modals/AddCollection"
import AddCollectionSchema from "./Modals/AddCollectionSchema"
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
import AddIndex from "./Modals/AddIndex"
import AddOwner from "./Modals/AddOwner"
import AddNodeOwner from "./Modals/AddNodeOwner"
import AddAlgorithms from "./Modals/AddAlgorithms"
import AddCanEvolve from "./Modals/AddCanEvolve"
import AddEvolve from "./Modals/AddEvolve"
import AddSecure from "./Modals/AddSecure"
import AddWhitelist from "./Modals/AddWhitelist"
import AddGRPC from "./Modals/AddGRPC"
import ConnectLocal from "./Modals/ConnectLocal"

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
    deployMode,
    setDeployMode,
    newIndex,
    setNewIndex,
    newRules,
    setNewRules,
    newSchema,
    setNewSchema,
    setEditGRPC,
    editGRPC,
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
    subCollections,
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
    addCollectionSchema,
    setAddCollectionSchema,
    $,
    set,
  }) => (
    <>
      {addCollectionSchema !== false ? (
        <AddCollectionSchema
          {...{
            setAddCollectionSchema,
            documents,
            base_path,
            contractTxId,
            setCollections,
            db,
          }}
        />
      ) : addCollection !== false ? (
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
            subCollections,
            setSubCollections,
            subCollections,
            setDocdata,
            setAddData,
          }}
        />
      ) : addSchema !== false ? (
        <AddSchema
          {...{
            newSchema,
            setNewSchema,
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
            newRules,
            setNewRules,
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
          }}
        />
      ) : addCanEvolve !== false ? (
        <AddCanEvolve
          {...{ state, contractTxId, db, setState, setAddCanEvolve }}
        />
      ) : addEvolve !== false ? (
        <AddEvolve {...{ setAddEvolve, state, contractTxId, db, setState }} />
      ) : addSecure !== false ? (
        <AddSecure {...{ setAddSecure, state, contractTxId, db, setState }} />
      ) : addIndex !== false ? (
        <AddIndex
          {...{
            newIndex,
            setNewIndex,
            setAddIndex,
            indexes,
            setIndexes,
            contractTxId,
            col,
            base_path,
            doc_path,
            db,
          }}
        />
      ) : addInstance !== false ? (
        <AddInstance
          {...{
            deployMode,
            setDeployMode,
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
        <AddWhitelist
          {...{
            node,
            setWhitelist,
            numLimit,
            setNumLimit,
            setNewWhitelistUser,
            newWhitelistUser,
            setEditWhitelist,
            editWhitelist,
            setAddWhitelist,
            setAllow,
            setLimit,
            allow,
            limit,
          }}
        />
      ) : addGRPC !== false ? (
        <AddGRPC
          {...{
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
          }}
        />
      ) : connect !== false ? (
        <ConnectLocal {...{ newPort, setNewPort, setConnect, setPort }} />
      ) : null}
      {$.signing_in_modal || $.owner_signing_in_modal ? (
        <Connect {...{ newNetwork, contractTxId, network, tab, state }} />
      ) : null}
    </>
  )
)
