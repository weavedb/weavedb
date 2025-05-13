#!/usr/bin/env node
const pm2 = require("pm2")

const args = process.argv.slice(2)

const cmds = {
  server: { script: "./hb/src/run.js" },
}

const cmd = cmds[args[0]] ?? cmds["server"]
if (cmds[args[0]]) args.shift()
if (!cmd) {
  console.log("The wrong command")
  process.exit()
}

pm2.connect(false, err => {
  if (err) {
    console.error("Error connecting to PM2:", err)
    process.exit(2)
  }

  pm2.start(
    {
      script: "./hb/src/run.js",
      nodeArgs: "--experimental-wasm-memory64",
      instances: 1,
      force: true,
      args: args,
      daemon: false,
      name: "server",
    },
    err => {
      if (err) {
        console.error("Error starting process:", err)
        pm2.disconnect()
        process.exit(2)
      }
    },
  )
  pm2.streamLogs("all", 0, false)
})

process.on("SIGINT", () => {
  pm2.delete("server", err => {
    pm2.disconnect()
    process.exit(err ? 1 : 0)
  })
})
