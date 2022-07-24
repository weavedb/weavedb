import { clone, mergeLeft, map, prop, is } from "ramda"
import setter from "./setter"
import { conf, global } from "nd"
const func = (arr = [], fn) => {
  if (is(Function)(arr)) {
    fn = arr
    arr = fn.props || []
  } else if (is(Array)(arr)) {
    if (is(Function)(arr[1])) {
      fn = arr[1]
      arr = arr[0] || fn.props || []
    } else {
      arr = arr || fn.props || []
    }
  }
  const _fn = () => {
    const { binder, set, get } = setter(arr)
    return _val => {
      const args = {
        global,
        conf: conf,
        val: _val || {},
        set,
        get,
        props: map(prop("get"))(binder)
      }
      const _fn = fn => val =>
        fn(mergeLeft({ val: val, fn: _fn, binder: binder }, args))
      return fn(mergeLeft({ fn: _fn }, args))
    }
  }
  _fn.props = fn.props
  return _fn
}

export default func
