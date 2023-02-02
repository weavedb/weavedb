const isValidName = str =>
  /^[^\/]+$/.test(str) &&
  !/^__.*__+$/.test(str) &&
  !/^\.{1,2}$/.test(str) &&
  new Blob([str]).size <= 1500

module.exports = { isValidName }
