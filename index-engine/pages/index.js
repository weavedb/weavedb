import { Select, Input, Flex, Box, ChakraProvider } from "@chakra-ui/react"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import {
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
let len = 0
let prev_count = 0
let isDel = false
let last_id = null
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
    isDel = false
    last_id = null
    prev_count = 0
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
      await insert(number)
      setNumber("")
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
