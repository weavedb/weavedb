#!/usr/bin/env bash
# Patch every atob() call site in node_modules/hbsig and core/src/utils.js
# to use Buffer.from(s, "base64") instead — workerd's atob is stricter than
# Node's, and Buffer.from is tolerant on both.
#
# This is a development-time workaround. The proper fix is upstream in the
# hbsig npm package; this script replicates it locally so the CF Worker
# can run the full signed pipeline today. Re-run after every npm install.
#
# Idempotent: marker `__weavedb_buffer_patched__` skips already-patched files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"

patch_file() {
  local f="$1"
  if [ ! -f "$f" ]; then
    echo "  skip (not found): $f"
    return
  fi
  if grep -q "__weavedb_buffer_patched__" "$f" 2>/dev/null; then
    echo "  skip (patched): $f"
    return
  fi
  # Two patterns we replace, both decode base64 → Uint8Array.
  # Pattern A:  Uint8Array.from(atob(X), c => c.charCodeAt(0))
  # Pattern B:  const bin = atob(X); const bytes = new Uint8Array(...); for ...
  python3 - "$f" <<'PY'
import re, sys
p = sys.argv[1]
src = open(p).read()
orig = src

# Pattern A — Uint8Array.from(atob(NAME), c => c.charCodeAt(0)) [arrow form]
src = re.sub(
    r"Uint8Array\.from\(atob\((\w+)\),\s*c\s*=>\s*\n?\s*c\.charCodeAt\(0\)\s*\)",
    r"new Uint8Array(Buffer.from(\1, 'base64'))",
    src,
)

# Pattern A' — Uint8Array.from(atob(NAME), function (c) { return c.charCodeAt(0); })
src = re.sub(
    r"Uint8Array\.from\(atob\((\w+)\),\s*function\s*\(c\)\s*\{\s*\n?\s*return\s+c\.charCodeAt\(0\)\s*;?\s*\n?\s*\}\s*\)",
    r"new Uint8Array(Buffer.from(\1, 'base64'))",
    src,
)

# Pattern B — (const|let|var) NAME = atob(VAR) — generalize
# Replaces `<decl> ID = atob(VAR)` with `<decl> ID = Buffer.from(VAR, 'base64').toString('binary')`
src = re.sub(
    r"((?:const|let|var)\s+\w+\s*=)\s*atob\((\w+)\)",
    r"\1 Buffer.from(\2, 'base64').toString('binary')",
    src,
)

# Pattern C — bare assignment: textData = atob(textData) (no decl)
src = re.sub(
    r"(\w+)\s*=\s*atob\((\w+)\)\s*;",
    r"\1 = Buffer.from(\2, 'base64').toString('binary');",
    src,
)

if src != orig:
    src = "// __weavedb_buffer_patched__ — atob → Buffer.from (workerd compat)\n" + src
    open(p, "w").write(src)
    print(f"  patched: {p}")
else:
    print(f"  unchanged: {p}")
PY
}

echo "atob → Buffer.from patch (idempotent)"
echo "  scope: cf/node_modules + core/node_modules (npm packages only — no source files)"
# Patch hbsig in both cf/node_modules AND core/node_modules. core/'s copy is
# what wrangler bundles when our DO dynamically imports ../../core/src/db.js.
for ROOT_NM in "$ROOT/node_modules" "$REPO_ROOT/core/node_modules"; do
  patch_file "$ROOT_NM/hbsig/esm/id.js"
  patch_file "$ROOT_NM/hbsig/esm/utils.js"
  patch_file "$ROOT_NM/hbsig/cjs/id.js"
  patch_file "$ROOT_NM/hbsig/cjs/utils.js"
  patch_file "$ROOT_NM/hbsig/node_modules/hbsig/esm/id.js"
  patch_file "$ROOT_NM/hbsig/node_modules/hbsig/esm/utils.js"
  patch_file "$ROOT_NM/hbsig/node_modules/hbsig/cjs/id.js"
  patch_file "$ROOT_NM/hbsig/node_modules/hbsig/cjs/utils.js"
done
# structured-headers (nested under http-message-signatures)
patch_file "$ROOT/node_modules/http-message-signatures/node_modules/structured-headers/dist/util.js"
patch_file "$ROOT/node_modules/http-message-signatures/node_modules/structured-headers/cjs/index.cjs"
# @ethersproject/base64 — pulled in transitively via aoconnect/wao
patch_file "$ROOT/node_modules/@ethersproject/base64/lib.esm/base64.js"
patch_file "$ROOT/node_modules/@ethersproject/base64/lib/browser-base64.js"
echo "done"
echo
echo "Note: this fixes init-time call sites. Subsequent ops still hit a"
echo "different atob path — see cf/test/miniflare-pipeline.test.js for the"
echo "skipped tests. Run: cf/scripts/patch-atob.sh after every npm install."
