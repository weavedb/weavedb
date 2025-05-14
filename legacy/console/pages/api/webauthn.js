const LitJsSdk = require("lit-js-sdk/build/index.node.js")
const { utils } = require("ethers")

export default async (req, res) => {
  const { ipfsId, publicKey } = req.body.lit_action
  const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" })
  await litNodeClient.connect()
  let signature = null
  let err = null
  try {
    const res = await litNodeClient.executeJs({
      ipfsId,
      authSig: JSON.parse(process.env.AUTH_SIG),
      jsParams: {
        publicKey,
        param: req.body.param,
        data: req.body.data,
      },
    })
    const sig = res.signatures.sig1
    signature = utils.joinSignature({
      r: "0x" + sig.r,
      s: "0x" + sig.s,
      v: sig.recid,
    })
  } catch (e) {
    console.log(e)
    err = e.toString()
  }
  res.status(200).json({ err, signature })
}
