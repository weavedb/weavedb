const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { toIndex, path } = require("zkjson")
const { resolve } = require("path")
const { readFileSync } = require("fs")
const { expect } = require("chai")
const { DB } = require("wdb-sdk")

const jwk = JSON.parse(
  readFileSync(
    resolve(__dirname, "../../dev/weavedb/HyperBEAM/.wallet.json"),
    "utf8",
  ),
)
const id = "k10zun9mk4wtrr9jir4ixgo7p6deqphp3twml_arzl4"
const wait = ms => new Promise(res => setTimeout(() => res(), ms))
async function deploy() {
  const [committer] = await ethers.getSigners()
  const VerifierDB = await ethers.getContractFactory(
    "zkjson/contracts/verifiers/verifier_db.sol:Groth16VerifierDB",
  )
  const verifierDB = await VerifierDB.deploy()
  const ZKDB = await ethers.getContractFactory("ZKDB")
  return (zkdb = await ZKDB.deploy(verifierDB.target, committer.address))
}

describe("MyRollup", function () {
  this.timeout(0)
  it("should query WeaveDB from Solidity", async function () {
    const zkdb = await loadFixture(deploy)
    const db = new DB({ jwk, id })
    console.log(await db.set("add:post", { body: "my first post!" }, "posts"))
    const post = (await db.cget("posts", ["date", "desc"]))[0]
    await wait(20000)
    const { zkp, zkhash, dirid } = await fetch("http://localhost:6365/zkp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dir: "posts", doc: post.id, path: "body" }),
    }).then(r => r.json())
    await zkdb.commitRoot(zkhash)
    expect(
      await zkdb.qString([dirid, toIndex(post.id), ...path("body")], zkp),
    ).to.eql("my first post!")
  })
})
