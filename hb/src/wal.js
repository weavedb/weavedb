import { open } from "lmdb"
import { connect, createSigner } from "@permaweb/aoconnect"
import { HB } from "wao"

const commit = async ({ io, height, hb, pid }) =>
  new Promise((res, rej) => {
    setTimeout(async () => {
      let h = height
      let d = null
      let bundle = []
      do {
        d = io.get(["__wal__", h]) ?? null
        if (
          d !== null &&
          d.opt?.headers &&
          typeof d.opt?.headers === "object" &&
          d.opt?.headers["signature"]
        ) {
          bundle.push({ ...d.opt, hashpath: d.hashpath, slot: h, ts: d.ts })
          h++
        }
      } while (d !== null)
      if (bundle.length > 0) {
        try {
          console.log(
            "wal committing....commit..................",
            bundle.length,
          )
          const {
            slot,
            pid: pid2,
            res: { ok },
          } = await hb.message({ pid, data: JSON.stringify(bundle) })
          console.log("wal commit..................", bundle.length)
          if (ok !== true) rej()
          else {
            console.log(`[${slot}] ${pid2} ${ok}`)
            console.log("wal: from", height, "to", h, `${pid}`)
            height = h
            io.put("__meta__/height", h)
            res(height)
          }
        } catch (e) {
          console.log(pid, bundle)
          console.log(e)
          rej()
        }
      } else {
        res(false)
      }
    }, 3000)
  })

const start = async ({ io, height, pid, hb }) => {
  let err = null
  while (true) {
    try {
      const h = await commit({ io, height, hb, pid })
      if (h !== false) {
        height = h
        console.log("new height:", height)
      }
    } catch (e) {
      err = e
      break
    }
  }
}
export default async ({ jwk, pid, hb, dbpath }) => {
  const io = open({ path: `${dbpath}/${pid}` })
  let height = io.get("__meta__/height") ?? 0
  console.log("wal initializing:", `${pid}`, height)
  const _hb = new HB({ jwk, url: hb })
  while (true) {
    await start({ io, height, pid, hb: _hb })
  }
}
