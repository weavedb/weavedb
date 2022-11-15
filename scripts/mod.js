const fs = require("fs")
const path = require("path")
const { isNil } = require("ramda")
const mod = (file1, file2, start, end) => {
  let lines = fs
    .readFileSync(path.resolve(__dirname, `../dist${file1}`), "utf8")
    .split("\n")

  if (!isNil(start) && !isNil(end)) {
    lines = lines.slice(start, end)
  }
  let i = 0
  for (let v of lines) {
    if (v === "  async function handle(state, action) {") {
      lines[i] = "export async function handle(state, action) {"
    } else {
      lines[i] = v.replace(/^  /, "")
    }
    i++
  }

  fs.writeFileSync(path.resolve(__dirname, `../dist${file2}`), lines.join("\n"))
}

mod("/exm/exm.js", "/exm/exm.js", 1, -2)
mod("/ethereum/eth-exm.js", "/ethereum/eth-exm.js")
