const { expect } = require("chai")
const { repeat } = require("ramda")
const { isValidName } = require("../contracts/common/lib/pure")
describe("WeaveDB", function () {
  this.timeout(0)

  it("should be a valid name", async () => {
    expect(isValidName("abc")).to.equal(true)
    expect(isValidName("a/b/c")).to.equal(false)
    expect(isValidName("a.b.c")).to.equal(true)
    expect(isValidName(".")).to.equal(false)
    expect(isValidName("..")).to.equal(false)
    expect(isValidName("...")).to.equal(true)
    expect(isValidName("__id__")).to.equal(false)
    expect(isValidName(repeat("a", 1500).join(""))).to.equal(true)
    expect(isValidName(repeat("a", 1501).join(""))).to.equal(false)
  })
})
