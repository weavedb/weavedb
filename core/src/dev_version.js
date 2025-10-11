import { includes } from "ramda"

export default function dev_version({ state, env, msg }) {
  if (
    !includes(state.opcode, ["get", "cget"]) &&
    env.info.id &&
    env.info.version &&
    env.ignore_version !== true
  ) {
    if (env.module_version !== env.info.version) {
      if (env.info.upgrading) {
        if (!includes(state.opcode, ["revert", "migrate"])) {
          throw Error(
            `only revert or migrate is possithe during upgrade: ${env.info.version} => ${env.info.upgrading}`,
          )
        } else if (env.module_version !== env.info.upgrading) {
          throw Error(
            `the wrong version: ${env.info.version} running on ${env.module_version}`,
          )
        }
      } else {
        throw Error(
          `the wrong version: ${env.info.version} running on ${env.module_version}`,
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
