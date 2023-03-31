const fs = require("fs")
const fn = fs.readFileSync("./dist2/webauthn.js", "utf8")
const s = new Function(fn)
console.log(s())
