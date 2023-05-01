import { Select, Input, Flex, Box, ChakraProvider } from "@chakra-ui/react"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import {
  length,
  sum,
  compose,
  reject,
  clone,
  append,
  pluck,
  includes,
  addIndex,
  range,
  splitAt,
  tail,
  indexOf,
  last,
  splitWhen,
  lt,
  objOf,
  flatten,
  zip,
  median,
  prop,
  isNil,
  map,
  keys,
} from "ramda"

const KV = require("../lib/KV")
const BPT = require("../lib/BPT")

let tree = null
let init = false
const build = store => {
  let _s = JSON.parse(store)
  let arrs = []
  let nodemap = {}
  const add = (node, depth = 0) => {
    arrs[depth] ??= []
    node.arr = []
    let i = 0
    for (const v of node.vals) {
      if (!isNil(node.children?.[i])) node.arr.push({ child: node.children[i] })
      node.arr.push({ key: v, val: node.leaf ? _s[`data/${v}`] : v })
      i++
    }
    if (!isNil(node.children?.[i])) node.arr.push({ child: node.children[i] })
    arrs[depth].push(node)
    nodemap[node.id] = node
    for (const v of node.children || []) add(_s[v], depth + 1)
  }
  if (!isNil(_s["root"])) add(_s[_s["root"]])
  return { arrs, nodemap }
}

let ids = {}
let stop = false
const isErr = (store, order = 4) => {
  let err = false
  let where = null
  let { nodemap, arrs } = build(
    typeof store === "object" ? JSON.stringify(store) : store
  )
  let i = 0
  for (const v of arrs) {
    let num = null
    let i2 = 0
    for (const v2 of v) {
      // check connections
      // top
      if (i !== 0) {
        if (isNil(v2.parent) || !includes(v2.id, nodemap[v2.parent].children)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-top" }
          break
        }
      } else {
        if (!isNil(v2.parent)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-top" }
          break
        }
      }
      // left
      if (i2 > 0) {
        if (isNil(v2.prev) || nodemap[v2.prev].next !== v2.id) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-left" }
          break
        }
      } else {
        if (!isNil(v2.prev)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-left" }
          break
        }
      }
      // right
      if (i2 < v.length - 1) {
        if (isNil(v2.next) || nodemap[v2.next].prev !== v2.id) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "right-left" }
          break
        }
      } else {
        if (!isNil(v2.next)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "right-left" }
          break
        }
      }
      for (const v3 of v2.arr) {
        if (isNil(v3.child)) {
          if (num === null || num <= v3.val) {
            num = v3.val
          } else {
            err = true
            where = { arr: pluck("val", v2.arr), id: v2.id, type: "sort" }
            break
          }
        }
      }
      i2++
      if (err) break
    }
    i++
  }
  const min_vals = Math.ceil(order / 2) - 1
  if (!err) {
    let mins = {}
    if (arrs.length > 1) {
      for (let i = arrs.length - 1; i >= 0; i--) {
        if (i !== arrs.length - 1) {
          if (
            compose(sum, map(length), pluck("children"))(arrs[i]) !==
            arrs[i + 1].length
          ) {
            err = true
            where = {
              arr: [],
              id: `arr:${i}`,
              type: `diff children`,
            }
            break
          }
        }
        for (let node of arrs[i]) {
          if (i !== 0 && node.vals.length < min_vals) {
            err = true
            where = {
              arr: node.vals,
              id: node.id,
              type: `min keys`,
            }
            break
          }
          mins[node.id] = compose(reject(isNil), pluck("val"))(node.arr)[0]
          if (!node.leaf) {
            mins[node.id] = mins[node.children[0]]
            let i2 = 0
            for (let v of node.vals) {
              if (v > mins[node.children[i2 + 1]]) {
                err = true
                where = {
                  arr: node.vals,
                  id: node.id,
                  type: `min index (${i2})`,
                }
                break
              }
              i2++
            }
            if (err) break
          }
        }
        if (err) break
      }
    }
  }
  return [err, where]
}

const alpha = "abcdefghijklmnopqrstuvwxyz".toUpperCase()
const gen = type => {
  if (type === "boolean") {
    return Math.random() > 0.5 ? true : false
  } else if (type === "string") {
    return map(() => alpha[Math.floor(Math.random() * alpha.length)])(
      range(0, 3)
    ).join("")
  } else {
    return Math.floor(Math.random() * 100)
  }
}

const initial_order = 5
let _his = []
for (const i of range(0, initial_order * 5)) {
  _his.push(gen("number"))
}
let _his2 = []
for (const i of range(0, initial_order * 5)) {
  _his2.push(gen("string"))
}

let _his3 = []
for (const i of range(0, initial_order * 5)) {
  _his3.push(gen("boolean"))
}

let count = 0
export default function Home() {
  const [auto, setAuto] = useState(false)
  const [store, setStore] = useState("{}")
  const [order, setOrder] = useState(initial_order)
  const [currentOrder, setCurrentOrder] = useState(initial_order)
  const [currentType, setCurrentType] = useState("number")
  const [data_type, setDataType] = useState("number")
  const [number, setNumber] = useState("")
  const [his, setHis] = useState([])
  const [display, setDisplay] = useState("Box")
  const [initValues, setInitValues] = useState(clone(_his).join(","))
  const [initValuesStr, setInitValuesStr] = useState(clone(_his2).join(","))
  const [initValuesBool, setInitValuesBool] = useState(clone(_his3).join(","))
  const reset = async () => {
    if (order < 3) return alert("order must be >= 3")
    setCurrentOrder(order)
    setCurrentType(data_type)
    count = 0
    tree = new BPT(order, data_type, setStore)
    const arr =
      data_type === "number"
        ? map(v => v * 1)(initValues.split(","))
        : data_type === "string"
        ? initValuesStr.split(",")
        : initValuesBool.split(",")
    ;(async () => {
      for (const n of arr) {
        ;(currentType === "number" && n < 0) ||
        (currentType !== "number" && /^-/.test(n))
          ? await del(`id:${n * -1}`)
          : await insert(
              data_type === "boolean"
                ? typeof n === "string"
                  ? n === "true"
                  : n
                : n
            )
      }
    })()
    setStore("{}")
    setHis([])
    _his2 = []
    ids = {}
  }
  const insert = async val => {
    const id = `id:${(++count).toString()}`
    ids[id] = true
    await tree.insert(id, val)
    _his2 = append({ val, op: "insert", id }, _his2)
    setHis(_his2)
  }
  const del = async key => {
    const _keys = keys(ids)
    key = isNil(key) ? _keys[Math.floor(Math.random() * _keys.length)] : key
    _his2 = append({ val: await tree.data(key), op: "del", id: key }, _his2)
    setHis(_his2)
    await tree.delete(key)
    delete ids[key]
  }
  const go = async () => {
    if (stop) return
    setTimeout(async () => {
      try {
        const _keys = keys(ids)
        if (
          _keys.length > 0 &&
          Math.random() < (_keys.length > order * 10 ? 0.8 : 0.2)
        ) {
          await del()
        } else {
          await insert(gen(currentType))
        }
        const [err] = isErr(tree.kv.store, order)
        !err ? go() : setAuto(true)
      } catch (e) {
        console.log(e)
      }
    }, 100)
  }

  useEffect(() => {
    if (!init) {
      init = true
      reset()
    }
  }, [])
  let { nodemap, arrs } = build(store)
  const addNumber = async () => {
    if (number !== "") {
      await insert(number)
      setNumber("")
      setTimeout(() => {
        document.getElementById("number").focus()
      }, 100)
    }
  }
  const [err, where] = isErr(store, currentOrder)
  return (
    <ChakraProvider>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <Box minH="100%" w="250px" px={3} py={2} bg="#eee" fontSize="12px">
        <Flex align="center" direction="column">
          <Box>WeaveDB</Box>
          <Box>B+ Tree Index Engine</Box>
        </Flex>
        <Box as="hr" my={3} />
        <Flex>
          <Box flex={1}>
            <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
              Data Type
            </Flex>
            <Flex mx={2} mb={2}>
              <Select
                onChange={e => setDataType(e.target.value)}
                value={data_type}
                height="auto"
                bg="white"
                fontSize="12px"
                height="28px"
                sx={{ borderRadius: "3px" }}
              >
                {map(v => <option value={v}>{v}</option>)([
                  "number",
                  "string",
                  "boolean",
                ])}
              </Select>
            </Flex>
          </Box>
          <Box flex={1}>
            <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
              Order
            </Flex>
            <Flex mx={2} mb={2}>
              <Input
                onChange={e => {
                  const ord = e.target.value * 1
                  if (!isNaN(ord)) setOrder(ord)
                }}
                placeholder="Order"
                value={order}
                height="auto"
                flex={1}
                bg="white"
                fontSize="12px"
                py={1}
                px={3}
                sx={{ borderRadius: "3px 0 0 3px" }}
              />
            </Flex>
          </Box>
        </Flex>
        <Flex mx={2} color="#666" mb={1} fontSize="10px">
          Initial Values (comma separeted)
        </Flex>
        <Flex mx={2} mb={2}>
          {data_type === "boolean" ? (
            <Input
              onChange={e => setInitValuesBool(e.target.value)}
              placeholder="Order"
              value={initValuesBool}
              height="auto"
              flex={1}
              bg="white"
              fontSize="12px"
              py={1}
              px={3}
              sx={{ borderRadius: "3px 0 0 3px" }}
            />
          ) : data_type === "string" ? (
            <Input
              onChange={e => setInitValuesStr(e.target.value)}
              placeholder="Order"
              value={initValuesStr}
              height="auto"
              flex={1}
              bg="white"
              fontSize="12px"
              py={1}
              px={3}
              sx={{ borderRadius: "3px 0 0 3px" }}
            />
          ) : (
            <Input
              onChange={e => setInitValues(e.target.value)}
              placeholder="Order"
              value={initValues}
              height="auto"
              flex={1}
              bg="white"
              fontSize="12px"
              py={1}
              px={3}
              sx={{ borderRadius: "3px 0 0 3px" }}
            />
          )}
        </Flex>
        <Flex
          align="center"
          p={1}
          mx={2}
          justify="center"
          bg="#666"
          color="white"
          onClick={async () => {
            reset()
          }}
          sx={{
            borderRadius: "3px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          Reset
        </Flex>
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          Add Value
        </Flex>
        <Flex mx={2} mb={2}>
          <Input
            onChange={e => {
              const num = e.target.value * 1
              if (!isNaN(num)) setNumber(num)
            }}
            placeholder={data_type}
            value={number}
            height="auto"
            flex={1}
            bg="white"
            fontSize="12px"
            id="number"
            py={1}
            px={3}
            sx={{ borderRadius: "3px 0 0 3px" }}
            onKeyDown={async e => {
              if (e.code === "Enter") {
                addNumber()
              }
            }}
          />
          <Flex
            width="80px"
            align="center"
            p={1}
            justify="center"
            bg="#666"
            color="white"
            onClick={async () => {
              if (err) return
              addNumber()
            }}
            sx={{
              borderRadius: "0 3px 3px 0",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            Add
          </Flex>
        </Flex>
        <Flex
          m={2}
          p={1}
          justify="center"
          bg="#666"
          color="white"
          onClick={async () => {
            if (err) return
            const num = gen(currentType)
            await insert(num)
          }}
          sx={{
            borderRadius: "3px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          Add Random Value
        </Flex>
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          Auto Test
        </Flex>
        <Flex
          m={2}
          p={1}
          justify="center"
          bg="#6441AF"
          color="white"
          onClick={async () => {
            stop = auto
            if (!stop) go()
            setAuto(!auto)
          }}
          sx={{
            borderRadius: "3px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          {!auto ? "Run" : "Stop"}
        </Flex>
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          Health Check
        </Flex>
        <Box mx={2} color={err ? "salmon" : "#6441AF"}>
          {err ? (
            <Box>
              Error!
              <Box mx={2} as="span" sx={{ textDecoration: "underline" }}>
                {where.id}
              </Box>
              <Box mx={2} as="span" sx={{ textDecoration: "underline" }}>
                {where.type}
              </Box>
              [ {where.arr.join(", ")} ]
            </Box>
          ) : (
            "Fine!"
          )}
        </Box>
      </Box>
      <Flex
        minH="100%"
        direction="column"
        minW="calc(100vw - 250px)"
        sx={{ position: "absolute", top: 0, left: "250px" }}
      >
        <Box flex={1} p={4}>
          <Box>
            {map(v => (
              <Flex justify="center" fontSize="10px">
                {map(v2 => {
                  return (
                    <Flex
                      m={1}
                      direction="column"
                      p={1}
                      bg="#ccc"
                      sx={{ borderRadius: "3px" }}
                    >
                      <Flex justify="center" fontSize="8px" mb={1}>
                        {v2.parent || "root"}
                      </Flex>
                      <Flex justify="center" align="center">
                        <Box
                          fontSize="8px"
                          ml={1}
                          mr={2}
                          minW="9px"
                          align="center"
                        >
                          {v2.prev ?? "-"}
                        </Box>
                        {addIndex(map)((v3, i3) => {
                          return (
                            <Flex
                              px={1}
                              justify="center"
                              bg={
                                !isNil(v3.val)
                                  ? v2.leaf
                                    ? "#bbb"
                                    : "#ddd"
                                  : "white"
                              }
                              sx={{
                                borderY: "1px solid #333",
                                borderRight: "1px solid #333",
                                borderLeft: i3 === 0 ? "1px solid #333" : "",
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                              }}
                              title={v3.key ?? null}
                              onClick={async () => {
                                if (err) return
                                if (!isNil(v3.key)) await del(v3.key)
                              }}
                            >
                              {includes(typeof (v3.val ?? v3.child), [
                                "number",
                                "string",
                              ])
                                ? v3.val ?? v3.child
                                : typeof (v3.val ?? v3.child) === "boolean"
                                ? v3.val
                                  ? "true"
                                  : "false"
                                : "-"}
                            </Flex>
                          )
                        })(v2.arr)}
                        <Box
                          fontSize="8px"
                          mr={1}
                          ml={2}
                          minW="9px"
                          align="center"
                        >
                          {v2.next ?? "-"}
                        </Box>
                      </Flex>
                      <Flex
                        justify="center"
                        fontSize="8px"
                        mt={1}
                        sx={{ textDecoration: "underline" }}
                      >
                        {v2.id}
                      </Flex>
                    </Flex>
                  )
                })(v)}
              </Flex>
            ))(arrs)}
          </Box>
        </Box>
        <Flex
          p={4}
          fontSize="10px"
          mt={3}
          sx={{ borderTop: "1px solid #eee" }}
          direction="column"
          color="#333"
        >
          <Flex mb={2}>
            <Box px={4} bg="#ddd" sx={{ borderRadius: "3px" }}>
              History
            </Box>
            <Box mx={3}>
              {map(v => (
                <Box
                  mx={1}
                  as="span"
                  color={display === v ? "#6441AF" : "#333"}
                  sx={{
                    textDecoration: display === v ? "underline" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setDisplay(v)}
                >
                  {v}
                </Box>
              ))(["Box", "JSON"])}
            </Box>
          </Flex>
          <Flex
            wrap="wrap"
            fontSize={display === "JSON" ? "10px" : "8px"}
            justify="flex-start"
            w="100%"
          >
            {display === "JSON"
              ? `[ ${map(
                  v => `${v.op === "del" ? `-${v.id.split(":")[1]}` : v.val}`
                )(his).join(", ")} ]`
              : map(v => (
                  <Flex
                    title={v.id}
                    justify="center"
                    align="center"
                    minW="16px"
                    minH="16px"
                    m={1}
                    p={1}
                    as="span"
                    color="white"
                    bg={v.op === "del" ? "salmon" : "#6441AF"}
                    sx={{ borderRadius: "3px", wordBreak: "break-allx" }}
                  >
                    {typeof v.val === "boolean"
                      ? v.val
                        ? "true"
                        : "false"
                      : v.val}
                  </Flex>
                ))(his)}
          </Flex>
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
