import React, { useEffect } from "react"
import md5 from "md5"
import { useRecoilState, useRecoilValue } from "recoil"
import { bind, atoms } from "nd"
import {
  sortBy,
  has,
  clone,
  equals,
  concat,
  uniq,
  o,
  difference,
  isEmpty,
  isNil
} from "ramda"

const Tracker_ = props => {
  const fn = props.init()
  const track_type = props.type || "any"
  if (!has("watch")(props) || !has("func")(props)) return null
  const [diff, setDiff] = useRecoilState(props.tracker.diff)
  const [prev, setPrev] = useRecoilState(props.tracker.prev)
  let tar = {}
  let arr = []
  for (let v of props.watch || []) {
    if (has(v)(atoms)) {
      tar[v] = useRecoilValue(atoms[v])
      arr.push(tar[v])
    }
  }
  const getSnapShot = () => {
    let init = {}
    for (const k in tar) {
      init[k] = clone(tar[k])
    }
    return init
  }
  useEffect(() => {
    setPrev(getSnapShot())
  }, [])
  useEffect(() => {
    const cur = getSnapShot()
    let newDiff = []
    for (let k in prev) {
      if (!equals(prev[k], cur[k])) {
        newDiff.push(k)
      }
    }
    const diffSum = o(uniq, concat(diff))(newDiff)
    const diffDiff = difference(props.watch || [])(diffSum)
    if ((track_type === "any" && diffSum.length !== 0) || isEmpty(diffDiff)) {
      setDiff([])
      fn[props.name]()
    } else {
      setDiff(diffSum)
    }
    setPrev(cur)
  }, arr)
  return null
}
const getHash = props =>
  md5(`${sortBy(v => v)(props.watch).join("-")}-${props.func}`)

export default props => {
  if (!has("watch")(props) || !has("func")(props)) {
    console.log(`Tracker needs at least "watch" and "func" parameters.`)
    return null
  }
  const name = isNil(props.name) ? getHash(props) : props.name
  const Component = bind(
    Tracker_,
    [
      {
        [name]: [
          props.func,
          concat(props.props || props.watch, props.func.props || [])
        ]
      }
    ],
    name
  )
  return <Component {...props} name={name} />
}
