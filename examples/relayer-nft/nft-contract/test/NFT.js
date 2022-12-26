const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")

describe("NFT", function () {
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners()
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy()
    return { nft, owner }
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { nft, owner } = await deploy()
      const tx = await nft.mint()
      await tx.wait()
      console.log(await nft.getTokenURI(0))
      expect(await nft.ownerOf(0)).to.equal(owner.address)
    })
  })
})
