const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")

describe("NFT", function () {
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners()
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy()
    const ACL = await ethers.getContractFactory("ACL")
    const acl = await ACL.deploy(nft.address)
    return { acl, nft, owner }
  }

  it("Should mint", async function () {
    const { nft, owner } = await deploy()
    const tx = await nft.mint()
    await tx.wait()
    expect(await nft.ownerOf(0)).to.equal(owner.address)
  })

  it("Should validate ownership", async function () {
    const { acl, nft, owner } = await deploy()
    const tx = await nft.mint()
    await tx.wait()
    expect(await acl.isOwner(owner.address, [3, 4, 0])).to.equal(true)
    expect(await acl.isOwner(owner.address, [5, 6])).to.equal(false)
  })
})
