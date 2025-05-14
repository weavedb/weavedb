#!/usr/bin/env node
const util = require("node:util")
const exec = util.promisify(require("node:child_process").exec)
const cmd = process.argv[2]
const { cpSync, existsSync } = require("fs")
const { resolve } = require("path")
const { isNil } = require("ramda")

const main = async () => {
  switch (cmd) {
    case "create":
      const appname = process.argv[3]
      if (isNil(appname)) {
        console.error("appname not specified")
        break
      }
      const appdir = resolve(process.cwd(), appname)
      if (existsSync(appdir)) {
        console.error(`appdir exists: ${appdir}`)
        break
      }
      const workspace = resolve(__dirname, "workspace")
      try {
        cpSync(workspace, appdir, { recursive: true })
        const { error, stdout, stderr } = await exec(
          `cd ${appdir} && yarn && rm -rf .weavedb && mkdir .weavedb`
        )
        if (error) {
          console.error(`something went wrong...`)
        } else {
          console.log(`${appname} successfully created!`)
        }
      } catch (e) {
        console.error(e)
      }
      break
    default:
      console.error(`command not found: ${cmd}`)
  }
}

main()
