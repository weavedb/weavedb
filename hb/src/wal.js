import { open } from "lmdb"
import { connect, createSigner } from "@permaweb/aoconnect"
export default async ({ jwk, pid, hb, dbpath }) => {
  const io = open({ path: `${dbpath}/${pid}` })
  let height = io.get("__wal__/height") ?? 0
  console.log("wal initializing:", `${dbpath}/${pid}`, height)
  const { request } = connect({
    MODE: "mainnet",
    URL: hb,
    device: "",
    signer: createSigner(jwk),
  })
  const txt = await fetch(`${hb}/~meta@1.0/info/serialize~json@1.0`).then(r =>
    r.json(),
  )
  const addr = txt.address
  setInterval(async () => {
    let h = height
    let d = null
    let bundle = []
    do {
      d = io.get(`__wal__/${h}`) ?? null
      if (
        d !== null &&
        d.opt?.headers &&
        typeof d.opt?.headers === "object" &&
        d.opt?.headers["signature"]
      ) {
        bundle.push(d.opt)
      }
      h++
    } while (d !== null)
    if (bundle.length > 0) {
      const tags = {
        method: "POST",
        path: `/${pid}/schedule`,
        scheduler: addr,
        data: JSON.stringify(bundle),
      }
      const res = await request(tags)
      console.log(`[${res.slot}] ${res.process}`)
      console.log("wal: from", height, "to", h, `${dbpath}/${pid}`)
      height = h
      io.put("__wal__/height", h)
    }
  }, 3000)
}
