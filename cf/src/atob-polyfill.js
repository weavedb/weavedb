// workerd's atob() is stricter than Node's: it rejects strings with base64url
// chars ('-', '_') and is intolerant of inputs with implicit missing padding.
// hbsig and core/src/utils.js call atob() at runtime during signature
// processing assuming Node's lenient behavior.
//
// We install a lenient shim. Loaded as a side-effecting import from both
// worker.js (Worker isolate) and process-do.js (DO isolate) so it's
// in place before any module that uses atob runs.
//
// Note: this fixes the init-time call sites; subsequent ops (mkdir, set,
// get) hit a different atob path that isn't routed through globalThis.atob
// in the workerd bundle. See cf/scripts/patch-atob.sh for the npm-package
// patches needed to fully unblock those — until that lands, those tests
// stay skipped in miniflare-pipeline.test.js.

if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.atob === "function" &&
  !globalThis.atob.__weavedb_lenient__
) {
  const _origAtob = globalThis.atob
  const lenient = function lenientAtob(s) {
    let cleaned = String(s).replace(/-/g, "+").replace(/_/g, "/")
    const pad = cleaned.length % 4
    if (pad === 2) cleaned += "=="
    else if (pad === 3) cleaned += "="
    else if (pad === 1) return _origAtob(s)
    try {
      return _origAtob(cleaned)
    } catch {
      const stripped = cleaned.replace(/[^A-Za-z0-9+/=]/g, "")
      return _origAtob(stripped)
    }
  }
  lenient.__weavedb_lenient__ = true
  try {
    Object.defineProperty(globalThis, "atob", {
      value: lenient,
      writable: true,
      configurable: true,
    })
  } catch {
    globalThis.atob = lenient
  }
}
