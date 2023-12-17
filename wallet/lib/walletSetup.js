import { InMemoryDB, Merkletree, str2Bytes } from "@iden3/js-merkletree"
import { proving } from "@iden3/js-jwz"
import * as uuid from "uuid"
import lf from "localforage"
import {
  StorageErrors,
  BjjProvider,
  CredentialStorage,
  CredentialWallet,
  defaultEthConnectionConfig,
  EthStateStorage,
  ICredentialWallet,
  IDataStorage,
  Identity,
  IdentityStorage,
  IdentityWallet,
  IIdentityWallet,
  InMemoryPrivateKeyStore,
  LocalStoragePrivateKeyStore,
  IndexedDBPrivateKeyStore,
  BrowserDataSource,
  IndexedDBDataSource,
  MerkleTreeLocalStorage,
  MerkleTreeIndexedDBStorage,
  KMS,
  KmsKeyType,
  Profile,
  W3CCredential,
  EthConnectionConfig,
  CircuitData,
  IStateStorage,
  ProofService,
  ICircuitStorage,
  CredentialStatusType,
  CredentialStatusResolverRegistry,
  IssuerResolver,
  RHSResolver,
  OnChainResolver,
  AuthDataPrepareFunc,
  StateVerificationFunc,
  DataPrepareHandlerFunc,
  VerificationHandlerFunc,
  IPackageManager,
  VerificationParams,
  ProvingParams,
  ZKPPacker,
  PlainPacker,
  PackageManager,
  AgentResolver,
  CircuitStorage,
  AbstractPrivateKeyStore,
} from "@0xpolygonid/js-sdk"
import path from "path"
const rpcUrl = "https://rpc.ankr.com/polygon_mumbai"
const contractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4"
const circuitsFolder = "./circuits"

export function initInMemoryDataStorage() {
  let conf = defaultEthConnectionConfig
  conf.contractAddress = contractAddress
  conf.url = rpcUrl

  // change here priority fees in case transaction is stuck or processing too long
  // conf.maxPriorityFeePerGas = '250000000000' - 250 gwei
  // conf.maxFeePerGas = '250000000000' - 250 gwei
  var dataStorage = {
    //credential: new CredentialStorage(new BrowserDataSource("credential")),
    credential: new CredentialStorage(new IndexedDBDataSource("credential")),
    proof: new CredentialStorage(new IndexedDBDataSource("proof")),
    identity: new IdentityStorage(
      new IndexedDBDataSource("identity-1"),
      new IndexedDBDataSource("identity-2")
    ),
    mt: new MerkleTreeIndexedDBStorage(40),
    states: new EthStateStorage(defaultEthConnectionConfig),
  }

  return dataStorage
}

export async function initIdentityWallet(
  dataStorage,
  credentialWallet,
  keyStore
) {
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore)
  const kms = new KMS()
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

  return new IdentityWallet(kms, dataStorage, credentialWallet)
}

export async function initInMemoryDataStorageAndWallets() {
  const dataStorage = initInMemoryDataStorage()
  const credentialWallet = await initCredentialWallet(dataStorage)
  const memoryKeyStore = new IndexedDBPrivateKeyStore()

  const identityWallet = await initIdentityWallet(
    dataStorage,
    credentialWallet,
    memoryKeyStore
  )

  return {
    dataStorage,
    credentialWallet,
    identityWallet,
  }
}

export async function initCredentialWallet(dataStorage) {
  const resolvers = new CredentialStatusResolverRegistry()
  resolvers.register(
    CredentialStatusType.SparseMerkleTreeProof,
    new IssuerResolver()
  )
  resolvers.register(
    CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
    new RHSResolver(dataStorage.states)
  )
  resolvers.register(
    CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
    new OnChainResolver([defaultEthConnectionConfig])
  )
  resolvers.register(
    CredentialStatusType.Iden3commRevocationStatusV1,
    new AgentResolver()
  )

  return new CredentialWallet(dataStorage, resolvers)
}

export async function initCircuitStorage() {
  const circuit_storage = new CStorage()
  return new CircuitStorage(circuit_storage)
}
export async function initProofService(
  identityWallet,
  credentialWallet,
  stateStorage,
  circuitStorage
) {
  return new ProofService(
    identityWallet,
    credentialWallet,
    circuitStorage,
    stateStorage,
    {
      ipfsGatewayURL: "https://ipfs.io",
    }
  )
}

export async function initPackageManager(
  circuitData,
  prepareFn,
  stateVerificationFn
) {
  const authInputsHandler = new DataPrepareHandlerFunc(prepareFn)

  const verificationFn = new VerificationHandlerFunc(stateVerificationFn)
  const mapKey = proving.provingMethodGroth16AuthV2Instance.methodAlg.toString()
  const verificationParamMap = new Map([
    [
      mapKey,
      {
        key: circuitData.verificationKey,
        verificationFn,
      },
    ],
  ])

  const provingParamMap = new Map()
  provingParamMap.set(mapKey, {
    dataPreparer: authInputsHandler,
    provingKey: circuitData.provingKey,
    wasm: circuitData.wasm,
  })

  const mgr = new PackageManager()
  const packer = new ZKPPacker(provingParamMap, verificationParamMap)
  const plainPacker = new PlainPacker()
  mgr.registerPackers([packer, plainPacker])

  return mgr
}

class CStorage {
  async get(circuitId) {
    const verificationKey = await fetch(
      "/circuits/credentialAtomicQuerySigV2/verification_key.json"
    ).then(r => r.arrayBuffer())
    const wasm = await fetch(
      "/circuits/credentialAtomicQuerySigV2/circuit.wasm"
    ).then(r => r.arrayBuffer())
    const provingKey = await fetch(
      "/circuits/credentialAtomicQuerySigV2/circuit_final.zkey"
    ).then(r => r.arrayBuffer())
    const data = {
      circuitId,
      wasm: new Uint8Array(wasm),
      provingKey: new Uint8Array(provingKey),
      verificationKey: new Uint8Array(verificationKey),
    }
    return data
  }
  async save(circuitId, circuitData) {}
}

class InMemoryDataSource {
  constructor(name) {
    this.name = name
    this.isInit = false
    this.list = []
    this._data = []
    this.init()
  }
  async init() {
    if (this.isInit === false) {
      this.isInit = true
      this._data = []
      this.list = (await lf.getItem(`list-${this.name}`)) ?? {}
      for (const v in this.list) {
        this._data.push(await lf.getItem(`${this.name}-${v}`))
      }
      console.log(this.name, this._data)
    }
  }
  async waitForInit() {
    return new Promise((res, rej) => {
      let st = setTimeout(() => {
        if (this.isInit) {
          try {
            st()
          } catch (e) {}
          res(this._data)
        }
      }, 100)
    })
  }
  /** saves in the memory */
  async save(key, value, keyName = "id") {
    console.log("save...", this.name, key, value)
    await lf.setItem(`${this.name}-${key}`, value)
    this.list[key] = true
    await lf.setItem(`list-${this.name}`, this.list)
    const itemIndex = this._data.findIndex(i => i[keyName] === key)
    if (itemIndex === -1) {
      this._data.push(value)
    } else {
      this._data[itemIndex] = value
    }
  }

  /** gets value from from the memory */
  async get(key, keyName = "id") {
    return this._data.find(t => t[keyName] === key)
  }

  /** loads from value from the memory */
  async load() {
    return this._data
  }

  /** deletes from value from the memory */
  async delete(key, keyName = "id") {
    const newData = this._data.filter(i => i[keyName] !== key)
    if (newData.length === this._data.length) {
      throw new Error(`${StorageErrors.ItemNotFound} to delete: ${key}`)
    }
    this._data = newData
  }
}
