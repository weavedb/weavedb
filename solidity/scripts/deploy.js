const yargs = require("yargs")
const hre = require("hardhat")

async function main() {
  const _committer = { address: process.env.COMMITTER }

  const VerifierDB = await hre.ethers.getContractFactory(
    "zkjson/contracts/verifiers/verifier_db.sol:Groth16VerifierDB",
  )
  const verifierDB = await VerifierDB.deploy()
  console.log(verifierDB)
  await verifierDB.waitForDeployment()
  console.log(await verifierDB.getAddress())

  const ZKDB = await hre.ethers.getContractFactory("ZKDB")
  const zkdb = await ZKDB.deploy(
    await verifierDB.getAddress(),
    _committer.address,
  )
  await zkdb.waitForDeployment()
  console.log(await zkdb.getAddress())
  return
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
