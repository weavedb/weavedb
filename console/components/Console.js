import { nanoid } from "nanoid"
import { Box, Flex, Select, Input } from "@chakra-ui/react"
let ReactJson
import { useRef, useState, useEffect } from "react"
import {
  o,
  flatten,
  head,
  propEq,
  findIndex,
  addIndex,
  map,
  isNil,
  tail,
  includes,
  last,
  pluck,
} from "ramda"
import { inject } from "roidjs"
import { read, addLog, queryDB, queryDB2 } from "../lib/weavedb"
import { methods } from "../lib/const"
import dayjs from "dayjs"
import { useToast } from "@chakra-ui/react"
const reads = [
  "get",
  "cget",
  "getIndexes",
  "getCrons",
  "getSchema",
  "getRules",
  "getIds",
  "getOwner",
  "getAddressLink",
  "getAlgorithms",
  "getLinkedContract",
  "getEvolve",
  "getVersion",
  "getRelayerJob",
  "listRelayerJobs",
  "listCollections",
  "getInfo",
  "getNonce",
]
import parser from "https://unpkg.com/yargs-parser@19.0.0/browser.js"
let ref
export default inject(
  ["temp_current", "tx_logs"],
  ({
    result,
    method,
    contractTxId,
    setResult,
    setState,
    setMethod,
    db,
    setQuery,
    query,
    fn,
    $,
  }) => {
    useEffect(() => {
      ReactJson = require("react-json-view").default
    }, [])
    const toast = useToast()
    const [querying, setQuerying] = useState(false)
    const [validQuery, setValidQuery] = useState(false)
    const [panel, setPanel] = useState("logs")
    const [value, setValue] = useState("")
    const isDB = !isNil(contractTxId)
    const [tx, setTX] = useState(null)
    const TxLog = ({ v }) => (
      <Flex
        align="center"
        px={2}
        py={1}
        sx={{ ":hover": { bg: "#eee" }, cursor: "pointer" }}
        onClick={() => {
          setTX(v.id)
          setPanel("query")
        }}
      >
        <Flex w="120px">{dayjs(v.date).format("YYYY/MM/DD HH:mm:ss")}</Flex>
        <Box
          as="i"
          className="fas fa-angle-right"
          color="#6441AF"
          fontSize="18px"
        />
        <Flex justify="flex-end" width="55px">
          {v.duration} ms
        </Flex>
        <Box
          as="i"
          mx={2}
          className="fas fa-angle-right"
          color="#6441AF"
          fontSize="18px"
        />
        <Flex
          bg={!includes(v.method)(reads) ? "#6441AF" : "#999"}
          px={2}
          color="white"
          mr={2}
          fontSize="10px"
          w="40px"
          justify="center"
          sx={{ borderRadius: "3px" }}
        >
          {!includes(v.method)(reads) ? "Write" : "Read"}
        </Flex>

        <Box>{v.method}</Box>
        <Box
          as="i"
          mx={2}
          className="fas fa-angle-right"
          color="#6441AF"
          fontSize="18px"
        />
        <Box>{v.node || "Browser SDK"}</Box>
        <Box
          as="i"
          mx={2}
          className="fas fa-angle-right"
          color="#6441AF"
          fontSize="18px"
        />
        <Box
          as="a"
          color="#6441AF"
          sx={{ textDecoration: "underline" }}
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${v.contractTxId}?network=mainnet`}
          onClick={e => {
            e.stopPropagation()
          }}
        >
          {v.contractTxId}
        </Box>
        {v.success ? null : (
          <>
            <Box
              as="i"
              mx={2}
              className="fas fa-angle-right"
              color="#6441AF"
              fontSize="18px"
            />
            <Box color="#6441AF">Error</Box>
          </>
        )}
        {!isNil(v.err) ? (
          <>
            <Box
              as="i"
              mx={2}
              className="fas fa-times"
              color="tomato"
              fontSize="18px"
            />
            <Box color="tomato">
              {typeof v.err === "string"
                ? v.err
                : v.err?.dryWrite?.errorMessage || "unknown error"}
            </Box>
          </>
        ) : isNil(v.txid) ? null : (
          <>
            <Box
              as="i"
              mx={2}
              className="fas fa-angle-right"
              color="#6441AF"
              fontSize="18px"
            />
            <Box
              as="a"
              color="#6441AF"
              sx={{ textDecoration: "underline" }}
              target="_blank"
              href={`https://sonar.warp.cc/#/app/interaction/${v.txid}?network=mainnet`}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              {v.txid}
            </Box>
          </>
        )}
      </Flex>
    )
    const parseQuery = txt => {
      let err = false
      const parsed = parser(txt)._
      let func = head(parsed)
      let query = addIndex(map)((v, i) => {
        switch (v) {
          case "null":
            return null
          case "undefined":
            return undefined
          case "true":
            return true
          case "false":
            return false
          default:
            let str = null
            if (typeof v === "number") {
              return v
            } else if (/^`.*`$/.test(v)) {
              str = v.replace(/^`(.*)`$/, "$1")
            } else if (/^'.*'$/.test(v)) {
              str = v.replace(/^'(.*)'$/, "$1")
            } else if (/^".*"$/.test(v)) {
              str = v.replace(/^"(.*)"$/, "$1")
            } else {
              str = v
            }
            if (/^\{.*\}$/.test(str) || /^\[.*\]$/.test(str)) {
              try {
                let json
                eval(`json = ${str}`)
                return json
              } catch (e) {}
            }
            return str
        }
      })(tail(parsed))
      return { func, query, err }
    }
    let _tx = null
    const _ind = findIndex(propEq("id", tx))($.tx_logs || [])
    let json = null

    if (_ind !== -1) {
      _tx = $.tx_logs[_ind]
      try {
        if (typeof _tx?.res === "object") {
          JSON.stringify(_tx.res)
          json = _tx.res
        }
      } catch (e) {}
    }
    return (
      <Flex w="100%" bg="white" direction="column">
        <Flex flex={1}>
          <Flex
            direction="column"
            w="200px"
            sx={{ borderRight: "1px solid #999", borderLeft: "1px solid #999" }}
          >
            {map(v => (
              <Flex
                align="center"
                h="40px"
                onClick={() => setPanel(v.key)}
                bg={panel === v.key ? "#6441AF" : "white"}
                color={panel === v.key ? "white" : "#333"}
                px={4}
                sx={{
                  borderTop: "1px solid #999",
                  cursor: panel === v.key ? "default" : "pointer",
                  ":hover": { opacity: panel === v.key ? 1 : 0.75 },
                }}
              >
                {v.label}
              </Flex>
            ))([
              { key: "logs", label: "Transaction Logs" },
              { key: "query", label: "Custom Query" },
            ])}
            {panel === "query" ? (
              <Select
                color="#6441AF"
                bg="#eee"
                w="100%"
                disabled={!isDB}
                value={method}
                onChange={e => {
                  try {
                    ref.focus()
                  } catch (e) {}
                  setValue(`${e.target.value} `)
                  setMethod(e.target.value)
                  setValidQuery(true)
                }}
                sx={{
                  borderRadius: 0,
                  ":focus": { outline: "none", boxShadow: "none" },
                }}
              >
                {map(v => (
                  <optgroup label={v.label}>
                    {map(v2 => <option value={v2}>{v2}</option>)(v.methods)}
                  </optgroup>
                ))(methods)}
              </Select>
            ) : null}
          </Flex>
          {panel === "logs" ? (
            <Box
              flex={1}
              bg="white"
              w="100%"
              height="250px"
              sx={{ borderTop: "1px solid #999", overflowY: "auto" }}
              p={1}
            >
              {map(v => <TxLog v={v} />)($.tx_logs || [])}
            </Box>
          ) : (
            <Flex
              direction="column"
              flex={1}
              bg="white"
              w="100%"
              justify="center"
            >
              <Flex flex={1} direction="column">
                {!isNil(_tx) ? (
                  <Box
                    bg="white"
                    w="100%"
                    sx={{ borderTop: "1px solid #999", overflowY: "auto" }}
                    p={1}
                    height="35px"
                  >
                    <TxLog v={_tx} />
                  </Box>
                ) : (
                  <Flex p={2} color={"#6441AF"} height="35px">
                    <Box width="9px" mr={2} />
                    {isDB
                      ? `Enter a query.`
                      : "To execute queries, connect with a WeaveDB instance."}
                  </Flex>
                )}
                <Box
                  height="170px"
                  px={3}
                  color="#6441AF"
                  sx={{ wordBreak: "break-all", overflowY: "auto" }}
                >
                  {isNil(_tx) ? null : (
                    <>
                      <Flex mb={2}>
                        <Box>
                          <Flex
                            bg={
                              !includes(_tx.method)(reads) ? "#6441AF" : "#999"
                            }
                            px={2}
                            color="white"
                            mr={2}
                            fontSize="10px"
                            w="60px"
                            justify="center"
                            sx={{ borderRadius: "3px" }}
                          >
                            {!includes(_tx.method)(reads) ? "Write" : "Read"}
                          </Flex>
                        </Box>
                        <Box sx={{ fontFamily: "'Roboto Mono', monospace" }}>
                          {_tx.method}(
                          {map(v => JSON.stringify(v), _tx.query).join(", ")})
                        </Box>
                      </Flex>
                      <Flex
                        align="center"
                        align={isNil(_tx.err) ? "flex-start" : "center"}
                      >
                        <Box>
                          <Flex
                            bg={isNil(_tx.err) ? "#6441AF" : "tomato"}
                            px={2}
                            color="white"
                            mr={2}
                            fontSize="10px"
                            w="60px"
                            justify="center"
                            sx={{ borderRadius: "3px" }}
                          >
                            {isNil(_tx.err) ? "Success" : "Error"}
                          </Flex>
                        </Box>
                        <Box fontSize="10px">
                          {isDB ? (
                            !isNil(_tx.err) ? (
                              <Box color="tomato" fontSize="12px">
                                {typeof _tx?.err?.dryWrite?.errorMessage ===
                                "string"
                                  ? _tx.err.dryWrite.errorMessage
                                  : typeof _tx?.err === "string"
                                  ? _tx.err
                                  : "unknown error"}
                              </Box>
                            ) : isNil(json) ? (
                              _tx.res
                            ) : (
                              <ReactJson
                                name={false}
                                src={json}
                                displayDataTypes={false}
                                collapsed={true}
                              />
                            )
                          ) : (
                            ""
                          )}
                        </Box>
                      </Flex>
                    </>
                  )}
                </Box>
                <Flex height="10px" />
              </Flex>
              <Flex
                height="35px"
                sx={{ overflowY: "auto" }}
                direction="column"
                bg="#eee"
              >
                <Flex p={2} color={isDB ? "#333" : "#6441AF"} align="center">
                  <Flex width="18px" mr={2} align="center" justify="flex-end">
                    <Box
                      as="i"
                      className={
                        querying
                          ? "fas fa-circle-notch fa-spin"
                          : "fas fa-angle-right"
                      }
                      color="#6441AF"
                      fontSize="18px"
                    />
                  </Flex>
                  <Input
                    disabled={querying || !isDB}
                    color={validQuery ? "#6441AF" : "tomato"}
                    ref={input => {
                      try {
                        ref = input
                      } catch (e) {
                        console.log(e)
                      }
                    }}
                    onKeyDown={async e => {
                      if (e.key === "Enter") {
                        let { err, func, query } = parseQuery(value)
                        if (!validQuery || err || isNil(func)) {
                          err = true
                        } else {
                          if (!querying) {
                            setQuerying(true)
                            try {
                              const id = nanoid()
                              const res = await fn(queryDB2)({
                                method: func,
                                query,
                                contractTxId,
                                dryRead: [["getInfo"]],
                                id,
                              })
                              if (/^Error:/.test(res)) {
                                err = true
                              } else {
                                let _res
                                try {
                                  _res = JSON.parse(res)
                                  setResult(_res)
                                } catch (e) {}
                                setValue("")
                                if (!isNil(JSON.parse(res).results)) {
                                  setState(JSON.parse(res).results[0].result)
                                }
                                if (_res?.success) {
                                  toast({
                                    description: "Success!",
                                    status: "success",
                                    duration: 3000,
                                    isClosable: true,
                                    position: "bottom-right",
                                  })
                                }
                              }
                              setTX(id)
                            } catch (e) {
                              console.log(e)
                              err = true
                            }
                          }
                        }
                        if (err) {
                          toast({
                            description: "The wrong format...",
                            status: "error",
                            duration: 3000,
                            isClosable: true,
                            position: "bottom-right",
                          })
                        }
                        setQuerying(false)
                      }
                    }}
                    value={
                      isDB
                        ? value
                        : "To execute queries, connect with a WeaveDB instance."
                    }
                    onChange={e => {
                      let { err, func, query } = parseQuery(e.target.value)
                      setValue(e.target.value)
                      const _methods = o(flatten, pluck("methods"))(methods)
                      setValidQuery(includes(func)(_methods))
                    }}
                    sx={{
                      padding: 0,
                      border: "0px",
                      outline: "none",
                      fontFamily: "'Roboto Mono', monospace",
                      ":focus": { outline: "none", boxShadow: "none" },
                    }}
                    fontSize="12px"
                    height="100%"
                  />
                </Flex>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    )
  }
)
