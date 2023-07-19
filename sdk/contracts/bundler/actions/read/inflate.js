const pako = require("pako")

const inflate = async (state, action) => {
  const compressed = new Uint8Array(
    Buffer.from(action.input.data, "base64")
      .toString("binary")
      .split("")
      .map(function (c) {
        return c.charCodeAt(0)
      })
  )

  return { result: { data: pako.inflate(compressed, { to: "string" }) } }
}

module.exports = inflate
