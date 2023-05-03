import {
  Select,
  Textarea,
  Input,
  Flex,
  Box,
  ChakraProvider,
} from "@chakra-ui/react"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import {
  reject,
  propEq,
  split,
  join,
  tail,
  values,
  compose,
  flatten,
  pluck,
  last,
  clone,
  append,
  includes,
  addIndex,
  range,
  isNil,
  map,
  keys,
} from "ramda"

const BPT = require("../lib/BPT")
const { gen, isErr, build } = require("../lib/utils")
let tree = null
let init = false

let ids = {}
let stop = false

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
const default_schema = [
  { key: "name", type: "string" },
  { key: "age", type: "number" },
  { key: "married", type: "boolean" },
]
let _his4 = []
for (const i of range(0, initial_order * 5)) {
  _his4.push(gen("object", default_schema))
}

let len = 0
let prev_count = 0
let isDel = false
let last_id = null
let count = 0
const KV = require("lib/KV")
export default function Home() {
  const [auto, setAuto] = useState(false)
  const [store, setStore] = useState("{}")
  const [order, setOrder] = useState(initial_order)
  const [schema, setSchema] = useState(default_schema)
  const [currentOrder, setCurrentOrder] = useState(initial_order)
  const [currentType, setCurrentType] = useState("number")
  const [currentSchema, setCurrentSchema] = useState(schema)
  const [data_type, setDataType] = useState("number")
  const [number, setNumber] = useState("")
  const [bool, setBool] = useState("true")
  const [str, setStr] = useState("")
  const [obj, setObj] = useState("")
  const [his, setHis] = useState([])
  const [fields, setFields] = useState("age:asc,name:desc")
  const [field, setField] = useState("")
  const [field_type, setFieldType] = useState("number")
  const [currentFields, setCurrentFields] = useState("age:asc,name:desc")
  const [display, setDisplay] = useState("Box")
  const [initValues, setInitValues] = useState(clone(_his).join(","))
  const [initValuesStr, setInitValuesStr] = useState(clone(_his2).join(","))
  const [initValuesBool, setInitValuesBool] = useState(clone(_his3).join(","))
  const [initValuesObject, setInitValuesObject] = useState(
    map(v => `${v.name},${v.age},${v.married}`)(clone(_his4)).join("\n")
  )

  const reset = async () => {
    if (order < 3) return alert("order must be >= 3")
    setCurrentOrder(order)
    setCurrentType(data_type)
    setCurrentSchema(schema)
    count = 0
    isDel = false
    last_id = null
    prev_count = 0
    const sort_fields =
      data_type === "object" ? map(split(":"))(fields.split(",")) : null
    setCurrentFields(sort_fields)
    tree = new BPT(order, sort_fields ?? data_type, new KV(setStore))
    const arr =
      data_type === "number"
        ? map(v => v * 1)(initValues.split(","))
        : data_type === "object"
        ? compose(
            map(v => {
              let obj = {}
              let i = 0
              for (let v2 of schema) {
                obj[v2.key] =
                  v2.type === "string"
                    ? v[i]
                    : v2.type === "number"
                    ? v[i] * 1
                    : v[i] === "true"
                i++
              }
              return obj
            }),
            map(split(",")),
            split("\n")
          )(initValuesObject)
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
    prev_count = len
    isDel = false
    last_id = id
    await tree.insert(id, val)
    _his2 = append({ val, op: "insert", id }, _his2)
    setHis(_his2)
    const [err, where, arrs, _len, _vals] = isErr(
      tree.kv.store,
      order,
      last_id,
      isDel,
      prev_count
    )
    len = _len
  }

  const del = async key => {
    const _keys = keys(ids)
    key = isNil(key) ? _keys[Math.floor(Math.random() * _keys.length)] : key
    last_id = key
    prev_count = len
    _his2 = append({ val: await tree.data(key), op: "del", id: key }, _his2)
    setHis(_his2)
    isDel = true
    await tree.delete(key)
    delete ids[key]
    const [err, where, arrs, _len, _vals] = isErr(
      tree.kv.store,
      order,
      last_id,
      isDel,
      prev_count
    )
    len = _len
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
        const [err, where, arrs, len, vals] = isErr(
          tree.kv.store,
          order,
          last_id,
          isDel,
          prev_count
        )
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
      await insert(number * 1)
      setNumber("")
      setTimeout(() => {
        document.getElementById("number").focus()
      }, 100)
    }
  }
  const addBool = async () => await insert(bool)
  const addString = async () => {
    if (str !== "") {
      await insert(str)
      setStr("")
      setTimeout(() => {
        document.getElementById("number").focus()
      }, 100)
    }
  }
  const addObject = async () => {
    const sp = obj.split(",")
    let _obj = {}
    for (let v2 of schema) {
      _obj[v2.key] =
        v2.type === "string"
          ? gen("string")
          : v2.type === "number"
          ? gen("number")
          : gen("boolean")
      await insert(_obj)
      setObj("")
      setTimeout(() => {
        document.getElementById("number").focus()
      }, 100)
    }
  }

  const [err, where] = isErr(store, currentOrder, last_id, isDel, prev_count)
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
                bg="white"
                fontSize="12px"
                height="28px"
                sx={{ borderRadius: "3px" }}
              >
                {map(v => <option value={v}>{v}</option>)([
                  "number",
                  "string",
                  "boolean",
                  "object",
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
        {data_type !== "object" ? null : (
          <Box fontSize="10px">
            <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
              Schema
            </Flex>
            <Flex mx={2}>
              <Input
                onChange={e => setField(e.target.value)}
                placeholder="name"
                value={field}
                height="auto"
                flex={1}
                bg="white"
                fontSize="12px"
                py={1}
                px={3}
                sx={{ borderRadius: "3px 0 0 3px" }}
              />
              <Select
                onChange={e => {
                  setFieldType(e.target.value)
                }}
                value={field_type}
                height="28px"
                width="100px"
                bg="white"
                fontSize="12px"
                sx={{ borderRadius: "0" }}
              >
                {map(v => <option value={v}>{v}</option>)([
                  "number",
                  "string",
                  "boolean",
                ])}
              </Select>
              <Flex
                width="30px"
                align="center"
                p={1}
                justify="center"
                bg="#666"
                color="white"
                onClick={async () => {
                  if (!/^\s*$/.test(field)) {
                    setField("")
                    setSchema(
                      compose(
                        append({ key: field, type: field_type }),
                        reject(propEq(field, "key"))
                      )(schema)
                    )
                  }
                }}
                sx={{
                  borderRadius: "0 3px 3px 0",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                +
              </Flex>
            </Flex>
            <Box mx={3} my={2}>
              {map(v => {
                return (
                  <Flex align="center" my={1}>
                    <Flex flex={1}>{v.key}</Flex>
                    <Flex flex={1}>{v.type}</Flex>
                    <Flex
                      onClick={() => {
                        setSchema(reject(propEq(v.key, "key"))(schema))
                      }}
                      sx={{ textDecoration: "underline", cursor: "pointer" }}
                      color="#6441AF"
                    >
                      Remove
                    </Flex>
                  </Flex>
                )
              })(schema)}
            </Box>
          </Box>
        )}
        <Flex mx={2} color="#666" mb={1} fontSize="10px">
          <Box>
            Initial Values (
            {currentType === "object" ? "csv" : "comma separeted"})
          </Box>
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
          ) : data_type === "object" ? (
            <Textarea
              onChange={e => setInitValuesObject(e.target.value)}
              placeholder="Order"
              value={initValuesObject}
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
        {data_type === "object" ? (
          <>
            <Flex mx={2} color="#666" mb={1} fontSize="10px">
              <Box>Sort Fields (e.g. age=asc,name=desc)</Box>
            </Flex>
            <Flex mx={2} mb={2}>
              <Input
                onChange={e => setFields(e.target.value)}
                placeholder="Order"
                value={fields}
                height="auto"
                flex={1}
                bg="white"
                fontSize="12px"
                py={1}
                px={3}
                sx={{ borderRadius: "3px 0 0 3px" }}
              />
            </Flex>
          </>
        ) : null}
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
          {currentType !== "boolean" ? (
            <Input
              onChange={e => {
                if (currentType === "number") {
                  const num = e.target.value * 1
                  if (!isNaN(num)) setNumber(num)
                } else if (currentType === "string") {
                  setStr(e.target.value)
                } else {
                  setObj(e.target.value)
                }
              }}
              placeholder={
                data_type === "object"
                  ? pluck("type")(schema).join(",")
                  : data_type
              }
              value={
                currentType === "number"
                  ? number
                  : currentType === "string"
                  ? str
                  : obj
              }
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
                  currentType === "number"
                    ? addNumber()
                    : currentType === "string"
                    ? addString()
                    : addObject()
                }
              }}
            />
          ) : (
            <Select
              onChange={e => {
                setBool(e.target.value)
              }}
              value={bool}
              height="28px"
              flex={1}
              bg="white"
              fontSize="12px"
              sx={{ borderRadius: "3px 0 0 3px" }}
            >
              <option value={"true"}>True</option>
              <option value={"false"}>False</option>
            </Select>
          )}
          <Flex
            width="80px"
            align="center"
            p={1}
            justify="center"
            bg="#666"
            color="white"
            onClick={async () => {
              if (err) return
              currentType === "number"
                ? addNumber()
                : currentType === "string"
                ? addString()
                : currentType === "boolean"
                ? addBool()
                : addObject()
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
            const num = gen(currentType, currentSchema)
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
              [ {typeof where === "string" ? where : where.arr.join(", ")} ]
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
            {addIndex(map)((v, i) => (
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
                          let v3val = v3.val ?? v3.child
                          let val = includes(typeof v3val, ["number", "string"])
                            ? v3val
                            : typeof v3val === "boolean"
                            ? v3val
                              ? "true"
                              : "false"
                            : typeof v3val === "object"
                            ? compose(
                                join(":"),
                                map(v4 => v3val[v4[0]])
                              )(currentFields)
                            : "-"
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
                                cursor:
                                  i === arrs.length - 1 ? "pointer" : "default",
                                ":hover": { opacity: 0.75 },
                              }}
                              title={v3.key ?? null}
                              onClick={async () => {
                                if (err) return
                                if (i !== arrs.length - 1) return
                                if (!isNil(v3.key)) await del(v3.key)
                              }}
                            >
                              {val}
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
                  v =>
                    `${
                      v.op === "del"
                        ? `-${v.id.split(":")[1]}`
                        : currentType === "object"
                        ? compose(
                            join(":"),
                            map(v4 => v.val[v4[0]])
                          )(currentFields)
                        : v.val
                    }`
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
                      : typeof v.val === "object"
                      ? v.val.age
                      : v.val}
                  </Flex>
                ))(his)}
          </Flex>
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
