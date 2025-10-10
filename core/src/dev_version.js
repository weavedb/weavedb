import version from "./version.js"
import { includes } from "ramda"

export default function dev_version({ state, env }) {
  if (
    env.info.id &&
    env.info.version &&
    env.ignore_version !== true &&
    !includes(state.opcode, ["get", "cget"])
  ) {
    if (version !== env.info.version) {
      if (env.info.upgrading) {
        if (!includes(state.opcode, ["revert", "migrate"])) {
          throw Error(
            `only revert or migrate is possithe during upgrade: ${env.info.version} => ${env.info.upgrading}`,
          )
        } else if (version !== env.info.upgrading) {
          throw Error(
            `the wrong version: ${env.info.version} running on ${version}`,
          )
        }
      } else {
        throw Error(
          `the wrong version: ${env.info.version} running on ${version}`,
        )
      }
    } else {
      if (env.info.upgrading) {
        if (!includes(state.opcode, ["revert"])) {
          throw Error(
            `only revert or migrate is possithe during upgrade: ${env.info.version} => ${env.info.upgrading}`,
          )
        }
      }
    }
  }

  return arguments[0]
}
