const hre = require("hardhat")
const nft_address = process.env.NFT_ADDRESS
console.log(process.env)
process.exit()
if (typeof nft_address === "undefined") {
  console.log("nft_address missing")
  process.exit()
}

async function main() {
  const ACL = await hre.ethers.getContractFactory("ACL")
  const acl = await ACL.deploy(nft_address)

  await acl.deployed()

  console.log(`ACL deployed to ${acl.address}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
