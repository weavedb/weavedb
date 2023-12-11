const { proving } = require("@iden3/js-jwz")
const {
  InMemoryDataSource,
  CredentialStorage,
  IdentityStorage,
  InMemoryMerkleTreeStorage,
  EthStateStorage,
  defaultEthConnectionConfig,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  IssuerResolver,
  RHSResolver,
  OnChainResolver,
  AgentResolver,
  CredentialWallet,
  InMemoryPrivateKeyStore,
  BjjProvider,
  KmsKeyType,
  KMS,
  IdentityWallet,
  FSCircuitStorage,
  ProofService,
  DataPrepareHandlerFunc,
  VerificationHandlerFunc,
  PackageManager,
  ZKPPacker,
  PlainPacker,
} = require("@0xpolygonid/js-sdk")

const contractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4"
const rpcUrl = "https://rpc.ankr.com/polygon_mumbai"
const circuitsFolder = "./circuits"
const path = require("path")

async function initCircuitStorage() {
  return new FSCircuitStorage({
    dirname: path.join(__dirname, circuitsFolder),
  })
}

async function initIdentityWallet(dataStorage, credentialWallet, keyStore) {
  const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore)
  const kms = new KMS()
  kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider)

  return new IdentityWallet(kms, dataStorage, credentialWallet)
}

async function initCredentialWallet(dataStorage) {
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

function initInMemoryDataStorage() {
  let conf = defaultEthConnectionConfig
  conf.contractAddress = contractAddress
  conf.url = rpcUrl

  // change here priority fees in case transaction is stuck or processing too long
  // conf.maxPriorityFeePerGas = '250000000000' - 250 gwei
  // conf.maxFeePerGas = '250000000000' - 250 gwei

  var dataStorage = {
    credential: new CredentialStorage(new InMemoryDataSource()),
    identity: new IdentityStorage(
      new InMemoryDataSource(),
      new InMemoryDataSource()
    ),
    mt: new InMemoryMerkleTreeStorage(40),

    states: new EthStateStorage(defaultEthConnectionConfig),
  }

  return dataStorage
}

async function initInMemoryDataStorageAndWallets() {
  const dataStorage = initInMemoryDataStorage()
  const credentialWallet = await initCredentialWallet(dataStorage)
  const memoryKeyStore = new InMemoryPrivateKeyStore()

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

async function initProofService(
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

async function initPackageManager(circuitData, prepareFn, stateVerificationFn) {
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

module.exports = {
  initInMemoryDataStorageAndWallets,
  initCircuitStorage,
  initProofService,
  initPackageManager,
}
