import { is, has, assocPath, isNil, forEach } from "ramda"
import {
  useRecoilTransactionObserver_UNSTABLE,
  useRecoilCallback,
  atom,
  useRecoilState
} from "recoil"
import { atoms, funcs } from "nd"

const addFuncProps = (arr, obj, dup_funcs) => {
  for (const v of arr || []) {
    if (!has(v)(atoms) && !has(v)(funcs)) {
      atoms[v] = atom({
        key: v,
        default: null
      })
    } else if (has(v)(funcs) && isNil(dup_funcs[v])) {
      dup_funcs[v] = true
      addFuncProps(funcs[v].props, obj, dup_funcs)
    }
    if (has(v)(atoms)) {
      const hook = useRecoilState(atoms[v])
      obj[v] = { set: hook[1], get: hook[0] }
    }
  }
}
const bind_states = arr => {
  let obj = {}
  let dup_funcs = {}
  addFuncProps(arr, obj, dup_funcs)
  return obj
}

export default _states => {
  const binder = bind_states(_states)
  const updated = {}
  const setter = useRecoilCallback(
    ({ snapshot: { getPromise }, set }) => async ({ name, val }) => {
      name = is(Array)(name)
        ? name.length === 1
          ? name[0]
          : name.length === 0
          ? null
          : name
        : name
      if (is(Array)(name)) {
        if (!has(name[0])(atoms))
          atoms[name[0]] = atom({ key: name[0], default: {} })
        const new_val = assocPath(
          name.slice(1),
          val
        )(await getPromise(atoms[name[0]]))
        set(atoms[name[0]], new_val)
        updated[name[0]] = new_val
      } else {
        const states = isNil(name) ? val : { [name]: val }
        for (const k in states) {
          if (!has(k)(atoms)) atoms[k] = atom({ key: k, default: null })
          set(atoms[k], states[k])
          updated[k] = states[k]
        }
      }
    }
  )
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (let k in atoms) {
      updated[k] = snapshot.getLoadable(atoms[k]).contents
    }
  })
  const getter = useRecoilCallback(
    ({ snapshot: { getLoadable } }) => ({ name }) =>
      has(name)(atoms)
        ? isNil(updated[name])
          ? getLoadable(atoms[name]).contents
          : updated[name]
        : null
  )
  const set = (val, name) => setter({ val, name })
  const get = name => getter({ name })
  return { binder, set, get }
}
