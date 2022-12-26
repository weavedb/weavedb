const { Contract, providers } = require("ethers")
const provider = new providers.JsonRpcProvider(process.env.EVM_RPC)
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR
const SDK = require("weavedb-node-client")
const abi = require("../../lib/NFT.json").abi

export default async (req, res) => {
  const params = JSON.parse(req.body)
  const tokenID = params.query[0].tokenID
  let owner = "0x"

  try {
    owner = await new Contract(nftContractAddr, abi, provider).ownerOf(tokenID)
  } catch (e) {
    res.status(200).json({
      success: false,
    })
    return
  }

  const sdk = new SDK({
    contractTxId,
    network: process.env.NEXT_PUBLIC_WEAVEDB_NETWORK,
    rpc: process.env.WEAVEDB_RPC,
  })

  const tx = await sdk.relay(params.jobID, params, owner, {
    jobID: params.jobID,
    privateKey: process.env.RELAYER_PRIVATEKEY,
    wallet: process.env.RELAYER_ADDRESS,
  })

  res.status(200).json({
    success: true,
    tx,
  })
}
