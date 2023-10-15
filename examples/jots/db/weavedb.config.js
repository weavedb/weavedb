module.exports = {
  db: {
    app: "http://localhost:3000",
    name: "Jots",
    rollup: false,
    plugins: { notifications: {} },
    tick: 1000 * 60 * 5,
  },
  accounts: {
    evm: {
      admin: { privateKey: "0x" },
    },
    ar: {},
  },
  defaultNetwork: "localhost",
  networks: {
    localhost: { url: "localhost:8080", admin: "admin" },
  },
}
