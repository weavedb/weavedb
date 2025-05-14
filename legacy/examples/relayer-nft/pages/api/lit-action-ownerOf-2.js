const { utils } = require("ethers")
const LitJsSdk = require("lit-js-sdk/build/index.node.js")

export default async (req, res) => {
  const params = JSON.parse(req.body)
  const tokenID = params.query[0].tokenID
  let owner = "0x"
  try {
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" })
    await litNodeClient.connect()
    const authSig = {
      sig: process.env.AUTHSIG_SIG2,
      derivedVia: process.env.AUTHSIG_DERIVEDVIA2,
      signedMessage: process.env.AUTHSIG_SIGNEDMESSAGE2,
      address: process.env.AUTHSIG_ADDRESS2,
    }
    const _res = await litNodeClient.executeJs({
      ipfsId: process.env.LIT_IPFSID,
      authSig,
      jsParams: {
        infura_key: process.env.INFURA_KEY,
        params,
        publicKey: process.env.LIT_PUBLICKEY2,
        sigName: "sig1",
      },
    })
    const _sig = _res.signatures.sig1
    const signature = utils.joinSignature({
      r: "0x" + _sig.r,
      s: "0x" + _sig.s,
      v: _sig.recid,
    })
    res.status(200).json({
      success: true,
      signature,
    })
  } catch (e) {
    console.log(e)
    res.status(200).json({
      success: false,
      error: e,
    })
  }
}
