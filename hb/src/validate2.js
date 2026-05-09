// Thin wrapper around the Validator class for tests that expect a
// default-export function with the signature
//   validate2({ pid, hb, dbpath, jwk, validate_pid }) → Promise<Validator>
//
// Older test code referenced this as `validate2`; the underlying
// implementation moved into the `Validator` class in ./validate.js.
import { Validator } from "./validate.js"

export default async function validate2({
  pid,
  hb,
  dbpath,
  jwk,
  validate_pid,
  autosync = 3000,
}) {
  const v = await new Validator({
    jwk,
    pid,
    dbpath,
    vid: validate_pid,
    hb,
    autosync,
  }).init()
  // Drive the write→commit pipeline on a timer. Without this, Sync only
  // pulls messages into __wmsg__/ but the ZK tree (which downstream
  // zkjson reads) never advances, breaking checkZK in server.test.js t2.
  const tick = async () => {
    try {
      await v.write()
      await v.commit()
    } catch (e) {}
    v._tickTimer = setTimeout(tick, autosync)
  }
  v._tickTimer = setTimeout(tick, autosync)
  return v
}
