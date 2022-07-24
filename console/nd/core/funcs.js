import { map, prop, mergeAll, mapObjIndexed, o, is } from "ramda"
import { useRecoilCallback, useRecoilState, atom } from "recoil"
import { atoms } from "nd"
import { default as func } from "./func"
import conf from "nd/conf"
import * as predefined from "nd/.nextdapp"
import * as custom from "nd/custom"
import global from "nd/global"
import setter from "./setter"
export default o(mapObjIndexed((v, k, o) => func(v)), mergeAll)([
  predefined,
  custom
])
