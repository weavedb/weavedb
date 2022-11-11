export function arrayify(value, options) {
  if (!options) {
    options = {}
  }

  if (typeof value === "number") {
    logger.checkSafeUint53(value, "invalid arrayify value")

    const result = []
    while (value) {
      result.unshift(value & 0xff)
      value = parseInt(String(value / 256))
    }
    if (result.length === 0) {
      result.push(0)
    }

    return addSlice(new Uint8Array(result))
  }

  if (
    options.allowMissingPrefix &&
    typeof value === "string" &&
    value.substring(0, 2) !== "0x"
  ) {
    value = "0x" + value
  }

  if (isHexable(value)) {
    value = value.toHexString()
  }

  if (isHexString(value)) {
    let hex = value.substring(2)
    if (hex.length % 2) {
      if (options.hexPad === "left") {
        hex = "0" + hex
      } else if (options.hexPad === "right") {
        hex += "0"
      } else {
        logger.throwArgumentError("hex data is odd-length", "value", value)
      }
    }

    const result = []
    for (let i = 0; i < hex.length; i += 2) {
      result.push(parseInt(hex.substring(i, i + 2), 16))
    }

    return addSlice(new Uint8Array(result))
  }

  if (isBytes(value)) {
    return addSlice(new Uint8Array(value))
  }

  return logger.throwArgumentError("invalid arrayify value", "value", value)
}

export function concat(items) {
  const objects = items.map(item => arrayify(item))
  const length = objects.reduce((accum, item) => accum + item.length, 0)

  const result = new Uint8Array(length)

  objects.reduce((offset, object) => {
    result.set(object, offset)
    return offset + object.length
  }, 0)

  return addSlice(result)
}
