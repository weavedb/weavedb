import { atom } from "recoil"
import { o, mergeLeft, mapObjIndexed } from "ramda"
import init from "nd/.nextdapp-props"
import custom from "nd/init"

export default o(
  mapObjIndexed((v, k) =>
    atom({
      key: k,
      default: v
    })
  ),
  mergeLeft(custom)
)(init)
