const isValidName = str =>
  /^[^\/]+$/.test(str) &&
  !/^__.*__+$/.test(str) &&
  !/^\.{1,2}$/.test(str) &&
  Buffer.byteLength(str, "utf8") <= 1500

module.exports = { isValidName }
