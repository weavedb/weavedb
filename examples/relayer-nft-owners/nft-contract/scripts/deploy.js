const hre = require("hardhat")

async function main() {
  const NFT = await hre.ethers.getContractFactory("NFT")
  const nft = await NFT.deploy()

  await nft.deployed()

  console.log(`NFT deployed to ${nft.address}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
