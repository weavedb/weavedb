import { of } from "monade"

function migrate_0_1_0({ state, env }) {
  return arguments[0]
}

const migrator = {
  "0.1.0": migrate_0_1_0,
}

export default function migrate({
  state,
  env: { kv, kv_dir, info, module_version },
}) {
  if (!info.upgrading) throw Error("not in the process of upgrading")
  if (module_version !== info.upgrading)
    throw Error("the wrong version running")
  if (!migrator[info.version]) {
    throw Error(
      `migration not possible from ${info.version} to ${module_version}, please revert.`,
    )
  } else of(arguments[0]).map(migrator[info.version])
  info.version = module_version
  delete info.upgrading
  kv.put("_config", `info`, info)
  return arguments[0]
}
