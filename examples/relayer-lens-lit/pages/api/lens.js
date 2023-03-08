const { utils, providers, Contract } = require("ethers")
const { pluck, compose, map, filter } = require("ramda")
const SDK = require("weavedb-node-client")
const LitJsSdk = require("lit-js-sdk/build/index.node.js")
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID

export default async (req, res) => {
  const params = JSON.parse(req.body)
  const tokenID = params.tokenID
  const abi = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ]

  const provider = new providers.JsonRpcProvider(
    "https://polygon-mainnet.infura.io/v3/" + process.env.INFURA_KEY
  )
  const owner = await new Contract(
    "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
    abi,
    provider
  ).ownerOf(tokenID)
  res.status(200).json({
    success: true,
    tokenID,
    owner,
  })

  return
  try {
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" })
    await litNodeClient.connect()
    const authSig = {
      sig: process.env.AUTHSIG_SIG,
      derivedVia: process.env.AUTHSIG_DERIVEDVIA,
      signedMessage: process.env.AUTHSIG_SIGNEDMESSAGE,
      address: process.env.AUTHSIG_ADDRESS,
    }
    const _res = await litNodeClient.executeJs({
      ipfsId: process.env.LIT_IPFSID,
      authSig,
      jsParams: {
        infura_key: process.env.INFURA_KEY,
        params,
        publicKey: process.env.LIT_PUBLICKEY1,
      },
    })
    const _sig = _res.signatures.sig1
    const sig = utils.joinSignature({
      r: "0x" + _sig.r,
      s: "0x" + _sig.s,
      v: _sig.recid,
    })
    let multisigs = []
    const prs = map(v =>
      fetch(v, {
        method: "POST",
        body: JSON.stringify(params),
      }).then(v => v.json())
    )(process.env.VALIDATORS.split(","))
    multisigs = compose(
      pluck("signature"),
      filter(v => v.success)
    )(await Promise.all(prs))
    const sdk = new SDK({
      contractTxId,
      rpc: process.env.WEAVEDB_RPC_NODE,
    })
    const tx = await sdk.relay(
      params.jobID,
      params,
      _res.response.message.extra,
      {
        multisigs,
        jobID: params.jobID,
        privateKey: process.env.RELAYER_PRIVATEKEY,
      }
    )
    res.status(200).json({ success: true, tx })
  } catch (e) {
    res.status(200).json({
      success: false,
    })
    return
  }
}
