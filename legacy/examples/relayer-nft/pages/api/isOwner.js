const { Contract, providers } = require("ethers")
const provider = new providers.JsonRpcProvider(process.env.EVM_RPC)
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const aclContractAddr = process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDR
const SDK = require("weavedb-node-client")
const abi = require("../../lib/ACL.json")

export default async (req, res) => {
  const { lit, params } = JSON.parse(req.body)
  const tokenIDs = JSON.parse(lit.evmContractConditions[0].functionParams[1])
  let isOwner = false
  try {
    isOwner = await new Contract(aclContractAddr, abi, provider).isOwner(
      params.caller,
      tokenIDs
    )
  } catch (e) {
    res.status(200).json({
      success: false,
    })
    return
  }

  const sdk = new SDK({
    contractTxId,
    rpc: process.env.WEAVEDB_RPC_NODE,
  })
  const tx = await sdk.relay(
    params.jobID,
    params,
    { isOwner, lit, tokenIDs },
    {
      jobID: params.jobID,
      privateKey: process.env.RELAYER_PRIVATEKEY,
    }
  )

  res.status(200).json(tx)
}
