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
  return await new Validator({
    jwk,
    pid,
    dbpath,
    vid: validate_pid,
    hb,
    autosync,
  }).init()
}
