module.exports = {
  db: {
    app: "http://localhost:3000",
    name: "Demo Dapp",
    rollup: false,
    plugins: {},
  },
  accounts: { evm: {}, ar: {} },
  defaultNetwork: "localhost",
  networks: {
    localhost: { url: "localhost:8080", admin: "admin" },
  },
}
