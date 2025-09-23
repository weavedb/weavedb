const yargs = require("yargs")

async function main() {
  const VerifierIPFS = await ethers.getContractFactory(
    "contracts/VerifierIPFS.sol:VerifierIPFS",
  )
  const verifierIPFS = await VerifierIPFS.deploy()
  console.log(verifierIPFS)
  await verifierIPFS.waitForDeployment()
  console.log(await verifierIPFS.getAddress())
  const ZKNFT = await ethers.getContractFactory("ZKNFT")
  const zknft = await ZKNFT.deploy(verifierIPFS.getAddress())
  await zknft.waitForDeployment()
  console.log(await zknft.getAddress())
  return
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
