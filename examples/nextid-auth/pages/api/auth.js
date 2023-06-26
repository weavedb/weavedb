const { Signature } = require("ethers")
const LitJsSdk = require("@lit-protocol/lit-node-client-nodejs")

const pkp_address = process.env.NEXT_PUBLIC_PKP_ADDRESS
const publicKey = process.env.NEXT_PUBLIC_PKP_PUBLIC_KEY
const ipfsId = process.env.NEXT_PUBLIC_IPFS_ID
const verifyingContract = process.env.NEXT_PUBLIC_CONTRACT_TX_ID
const authSig = JSON.parse(process.env.AUTH_SIG)
const bearer = process.env.TWITTER_BEARER_TOKEN

export default async (req, res) => {
  const handle = req.body.params.query.linkTo
  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    litNetwork: "serrano",
  })
  await litNodeClient.connect()

  const _res = await litNodeClient.executeJs({
    ipfsId,
    authSig,
    jsParams: {
      platform: "twitter",
      handle,
      params: req.body.params,
      publicKey,
      verifyingContract,
    },
  })
  const _sig = _res.signatures.sig1
  const sig = Signature.from({
    r: "0x" + _sig.r,
    s: "0x" + _sig.s,
    v: _sig.recid,
  }).serialized
  if (sig === null) return res.json({ success: false })

  const profile = await fetch(
    `https://api.twitter.com/1.1/users/show.json?screen_name=${handle}`,
    { headers: { Authorization: `Bearer ${bearer}` } }
  ).then(v => v.json())

  res.json({ success: true, profile, sig })
}
