const { clone, last, isNil, assoc } = require("ramda")
const md5 = require("md5")
class Chain {
  constructor({ cid, validate, sdk, handle }) {
    this.cid = cid
    this.nonces = {}
    this.txs = []
    this.txmap = {}
    this.validate = validate
    this.nonces = {}
    this.handle = handle
  }
  async init(sdk) {
    this.sdk = sdk
    this.current_state = (await this.sdk.db.readState()).cachedValue.state
    this.virtual_state = clone(this.current_state)
  }
  async push(tx) {
    tx.id = md5(tx.param.signature)
    if (!isNil(this.txmap[tx.id])) throw new Error("tx id exists")
    tx.signer = await this.validate(tx.param)
    tx.date = Date.now()
    this.nonces[tx.signer] ||= null
    const nonce = isNil(this.nonces[tx.signer]) ? 1 : this.nonces[tx.signer] + 1
    if (tx.param.nonce !== nonce) {
      throw new Error(`the wrong nonce${tx.param.nonce}, expected ${nonce}`)
    }
    try {
      const res = this.handle(clone(this.virtual_state), { input: tx.param })
      if (!isNil(res.state)) {
        this.virtual_state = res.state
        this.nonces[tx.signer] = nonce
        this.txs.push(tx.id)
        this.txmap[tx.id] = tx
        console.log("next...................")
        this.next()
      }
    } catch (e) {
      console.log(e)
    }
  }
  async next() {
    console.log(this.txs.length)
    if (this.txs.length === 0) return
    console.log("here...........")
    console.log(this.txmap[this.txs[0]])
    console.log("whatttt")
    let tx = this.txmap[this.txs[0]]
    console.log(tx)
    try {
      const res = await this.sdk.db.dryWrite(tx.param)
      if (res.type === "ok") {
        this.txmap[tx.id].dryWrite = true
        const res = await this.sdk.db.bundleInteraction(tx.param)
        this.txmap[tx.id].txid = res.originalTxId
        this.txs.shift()
        console.log("tx", tx)
        this.next()
      }
    } catch (e) {
      console.log(e)
    }
  }
  async receiveTx() {
    console.log("yes!!!")
  }
}

module.exports = { Chain }
