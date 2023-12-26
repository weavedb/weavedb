import { set, get, del, values, createStore } from "idb-keyval"
import {
  InMemoryDB,
  Merkletree,
  str2Bytes,
  IndexedDBStorage,
} from "@iden3/js-merkletree"
import { proving } from "@iden3/js-jwz"
import * as uuid from "uuid"
import lf from "localforage"
import { map } from "ramda"
import {
  MerkleTreeType,
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
} from "@0xpolygonid/js-sdk"

const rpcUrl = "https://rpc.ankr.com/polygon_mumbai"
const contractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4"
const circuitsFolder = "./circuits"

export function initIndexedDBDataStorage(aid, aes) {
  let conf = defaultEthConnectionConfig
  conf.contractAddress = contractAddress
  conf.url = rpcUrl
  var dataStorage = {
    credential: new CredentialStorage(
      new IndexedDBDataSource("credential", aid, aes)
    ),
    proof: new CredentialStorage(new IndexedDBDataSource("proof", aid, aes)),
    identity: new IdentityStorage(
      new IndexedDBDataSource("identity-1", aid, aes),
      new IndexedDBDataSource("identity-2", aid, aes)
    ),
    mt: new MerkleTreeIndexedDBStorage(40, aid, aes),
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

export async function initDataStorageAndWallets(aid, aes) {
  const dataStorage = initIndexedDBDataStorage(aid, aes)
  const credentialWallet = await initCredentialWallet(dataStorage)
  const memoryKeyStore = new IndexedDBPrivateKeyStore(aid, aes)
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
const enc = new TextEncoder()
const dec = new TextDecoder()

const MERKLE_TREE_TYPES = [
  MerkleTreeType.Claims,
  MerkleTreeType.Revocations,
  MerkleTreeType.Roots,
]

const createMerkleTreeMetaInfo = identifier => {
  const treesMeta = []
  for (let index = 0; index < MERKLE_TREE_TYPES.length; index++) {
    const mType = MERKLE_TREE_TYPES[index]
    const treeId = `${identifier}+${mType}`
    treesMeta.push({ treeId, identifier, type: mType })
  }
  return treesMeta
}

const decrypt = async (key, mkey) => {
  if (!mkey) return mkey
  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: mkey.iv },
    key,
    mkey.val
  )
  return JSON.parse(dec.decode(raw))
}
const encrypt = async (key, value) => {
  const msg = enc.encode(JSON.stringify(value))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const val = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, msg)
  return { iv, val }
}
class IndexedDBDataSource {
  constructor(_storageKey, aid, key) {
    this.key = key
    this.id = aid
    this._store = createStore(`${_storageKey}-db`, _storageKey)
  }

  async save(key, value, keyName = "id") {
    return this._set(key, value)
  }
  async _get(key) {
    return await decrypt(this.key, await get(key, this._store))
  }
  async _set(key, val) {
    return await set(key, await encrypt(this.key, val), this._store)
  }

  async get(key, keyName = "id") {
    return await this._get(key)
  }

  async load() {
    let vals = []
    for (const mkey of await values(this._store)) {
      vals.push(await decrypt(this.key, mkey))
    }
    return vals
  }
  async delete(key, keyName = "id") {
    return del(key, this._store)
  }
}

class MerkleTreeIndexedDBStorage {
  static storageKeyMeta = "merkle-tree-meta"
  static storageBindingKeyMeta = "binding-did"
  constructor(_mtDepth, aid, key) {
    this._mtDepth = _mtDepth
    this.key = key
    this.id = aid
    this._merkleTreeMetaStore = createStore(
      `${MerkleTreeIndexedDBStorage.storageKeyMeta}-db`,
      MerkleTreeIndexedDBStorage.storageKeyMeta
    )
    this._bindingStore = createStore(
      `${MerkleTreeIndexedDBStorage.storageBindingKeyMeta}-db`,
      MerkleTreeIndexedDBStorage.storageBindingKeyMeta
    )
  }
  async get(key, store) {
    return await decrypt(this.key, await get(key, store))
  }
  async set(key, val, store) {
    return await set(key, await encrypt(this.key, val), store)
  }

  async createIdentityMerkleTrees(identifier) {
    if (!identifier) {
      identifier = `${uuid.v4()}`
    }
    const existingBinging = await this.get(identifier, this._bindingStore)
    if (existingBinging) {
      throw new Error(
        `Present merkle tree meta information in the store for current identifier ${identifier}`
      )
    }
    const treesMeta = createMerkleTreeMetaInfo(identifier)
    await this.set(identifier, treesMeta, this._merkleTreeMetaStore)
    return treesMeta
  }
  async getIdentityMerkleTreesInfo(identifier) {
    const meta = await this.get(identifier, this._merkleTreeMetaStore)
    if (meta) {
      return meta
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`)
  }

  async getMerkleTreeByIdentifierAndType(identifier, mtType) {
    const meta = await this.get(identifier, this._merkleTreeMetaStore)
    const err = new Error(
      `Merkle tree not found for identifier ${identifier} and type ${mtType}`
    )
    if (!meta) {
      throw err
    }

    const resultMeta = meta.find(
      m => m.identifier === identifier && m.type === mtType
    )
    if (!resultMeta) {
      throw err
    }
    return new Merkletree(
      new IndexedDBStorage(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth
    )
  }
  async addToMerkleTree(identifier, mtType, hindex, hvalue) {
    const meta = await this.get(identifier, this._merkleTreeMetaStore)
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`)
    }
    const resultMeta = meta.find(
      m => m.identifier === identifier && m.type === mtType
    )
    if (!resultMeta) {
      throw new Error(
        `Merkle tree not found for identifier ${identifier} and type ${mtType}`
      )
    }

    const tree = new Merkletree(
      new IndexedDBStorage(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth
    )

    await tree.add(hindex, hvalue)
  }
  async bindMerkleTreeToNewIdentifier(oldIdentifier, newIdentifier) {
    const meta = await this.get(oldIdentifier, this._merkleTreeMetaStore)
    if (!meta || !meta?.length) {
      throw new Error(
        `Merkle tree meta not found for identifier ${oldIdentifier}`
      )
    }

    const treesMeta = meta.map(m => ({
      ...m,
      identifier: newIdentifier,
    }))

    await del(oldIdentifier, this._merkleTreeMetaStore)
    await this.set(newIdentifier, treesMeta, this._merkleTreeMetaStore)
    await this.set(oldIdentifier, newIdentifier, this._bindingStore)
  }
}

class IndexedDBPrivateKeyStore {
  static storageKey = "keystore"
  constructor(aid, key) {
    this.key = key
    this.id = aid
    this._store = createStore(
      `${IndexedDBPrivateKeyStore.storageKey}-db`,
      IndexedDBPrivateKeyStore.storageKey
    )
  }
  async _get(key) {
    return await decrypt(this.key, await get(key, this._store))
  }
  async _set(key, val) {
    return await set(key, await encrypt(this.key, val), this._store)
  }
  async get(args) {
    const key = await this._get(args.alias)
    if (!key) {
      throw new Error("no key under given alias")
    }
    return key.value
  }
  async importKey(args) {
    await this._set(args.alias, { value: args.key })
  }
}
