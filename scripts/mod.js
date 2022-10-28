const fs = require("fs")
const path = require("path")

let lines = fs
  .readFileSync(path.resolve(__dirname, "../dist/contracts-exm/exm.js"), "utf8")
  .split("\n")
  .slice(1, -2)

let i = 0
let lines2 = []
for (let v of lines) {
  if (v === "  async function handle(state, action) {") {
    lines[i] = "export async function handle(state, action) {"
  } else {
    lines[i] = v.replace(/^  /, "")
  }
  lines2[i] = v.replace(/^  /, "")
  i++
}
lines2.push("module.exports = handle")
fs.writeFileSync(
  path.resolve(__dirname, "../dist/contracts-exm/exm.js"),
  lines.join("\n")
)
