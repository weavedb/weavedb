require("dotenv").config()
require("@nomicfoundation/hardhat-toolbox")
console.log(process.env)
process.exit()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.EVM_RPC,
      accounts: [process.env.PRIVATEKEY],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  },
}
