const yargs = require("yargs")
const hre = require("hardhat")

async function main() {
  const VerifierDB = await hre.ethers.getContractFactory(
    "zkjson/contracts/verifiers/verifier_db.sol:Groth16VerifierDB",
  )
  const verifierDB = await VerifierDB.deploy()
  console.log(verifierDB)
  await verifierDB.waitForDeployment()
  console.log(await verifierDB.getAddress())

  const ZKDB = await hre.ethers.getContractFactory("NORU")
  const zkdb = await ZKDB.deploy(await verifierDB.getAddress())
  await zkdb.waitForDeployment()
  console.log(await zkdb.getAddress())
  return
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
