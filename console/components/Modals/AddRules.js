import fpjson from "fpjson-lang"
import jsonLogic from "json-logic-js"
import EthCrypto from "eth-crypto"
import { useState } from "react"
import { nanoid } from "nanoid"
import { Select, Input, Box, Flex, Textarea } from "@chakra-ui/react"
import {
  includes,
  intersection,
  clone,
  mergeLeft,
  isNil,
  compose,
  join,
  map,
  append,
  is,
  complement,
  concat,
  without,
} from "ramda"
import { inject } from "roidjs"
import { t, parseJSON, checkJSON, read, queryDB } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import Modal from "../Modal"
import { useToast } from "@chakra-ui/react"
const mergeData = (_data, new_data, overwrite = false, signer, timestamp) => {
  if (isNil(_data) || overwrite) _data = {}
  for (let k in new_data) {
    const d = new_data[k]
    if (is(Object)(d) && d.__op === "arrayUnion") {
      if (complement(is)(Array, d.arr)) throw new Error(`${k} is not an array`)
      if (complement(is)(Array, _data[k])) _data[k] = []
      _data[k] = concat(_data[k], d.arr)
    } else if (is(Object)(d) && d.__op === "arrayRemove") {
      if (complement(is)(Array, d.arr)) throw new Error(`${k} is not an array`)
      if (complement(is)(Array, _data[k])) _data[k] = []
      _data[k] = without(d.arr, _data[k])
    } else if (is(Object)(d) && d.__op === "inc") {
      if (isNaN(d.n)) throw new Error(`${k} is not a number`)
      if (isNil(_data[k])) _data[k] = 0
      _data[k] += d.n
    } else if (is(Object)(d) && d.__op === "del") {
      delete _data[k]
    } else if (is(Object)(d) && d.__op === "ts") {
      _data[k] = timestamp
    } else if (is(Object)(d) && d.__op === "signer") {
      _data[k] = signer
    } else {
      _data[k] = d
    }
  }
  return _data
}

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    setCollections,
    editRules,
    setEditRules,
    newRules,
    setNewRules,
    db,
    doc_path,
    setRules,
    setAddRules,
    col,
    state,
    base_path,
    contractTxId,
    fn,
    set,
    $,
  }) => {
    const [testData, setTestData] = useState("{}")
    const [oldData, setOldData] = useState("{}")
    const [newData, setNewData] = useState("")
    const [ruleData, setRuleData] = useState("")
    const [method, setMethod] = useState("set")
    const [docid, setDocId] = useState("")
    const [signer, setSigner] = useState("")
    const [oldSigner, setOldSigner] = useState("")
    const [exists, setExists] = useState(false)
    const toast = useToast()
    const [newCollection, setNewCollection] = useState(editRules ?? "")
    return (
      <Modal
        type="right"
        title="Access Control Rules"
        close={setAddRules}
        width="70%"
      >
        <Flex h="100%">
          <Flex flex={1} direction="column" px={2} h="100%">
            <Input
              value={newCollection}
              placeholder="Collection ID"
              onChange={e => setNewCollection(e.target.value)}
              disabled={!isNil(editRules)}
              sx={{
                borderRadius: "3px",
              }}
              mb={3}
            />
            <Editor
              value={newRules}
              onValueChange={code => setNewRules(code)}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              placeholder="Access Contral Rules"
              style={{
                flex: 1,
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
              }}
            />
            <Flex
              mt={4}
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              p={2}
              justify="center"
              align="center"
              color="white"
              bg="#333"
              height="40px"
              onClick={async () => {
                if (isNil($.loading)) {
                  const exRules = !/^\s*$/.test(newRules)
                  if (!exRules) {
                    alert("Enter rules")
                  }
                  let val = null
                  if (checkJSON(newRules)) return alert("Wrong JSON format")
                  set("add_rules", "loading")
                  let col_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(isNil(editRules) ? newCollection : col)
                  )(base_path)
                  try {
                    let query = `${newRules}, ${col_path}`
                    const res = JSON.parse(
                      await fn(queryDB)({
                        dryRead: [
                          ["listCollections", ...base_path],
                          [
                            "getRules",
                            ...(doc_path.length % 2 === 0
                              ? doc_path.slice(0, -1)
                              : doc_path),
                          ],
                        ],
                        method: "setRules",
                        query,
                        contractTxId,
                      })
                    )
                    if (!res.success) {
                      alert("Something went wrong")
                    } else {
                      setNewRules(`{"allow write": true}`)
                      setAddRules(false)

                      if (isNil(editRules)) {
                        setCollections(res.results[0].result)
                      } else {
                        setRules(res.results[1].result)
                      }
                    }
                  } catch (e) {
                    alert("Something went wrong")
                  }
                  set(null, "loading")
                }
              }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                "Add"
              )}
            </Flex>
          </Flex>
          <Flex flex={1} direction="column" px={2} h="100%">
            <Flex mb={1} fontSize="10px">
              <Box>Test Rules (Enter a test query)</Box>
              <Box flex={1} />
              <Box
                onClick={() => setDocId(nanoid())}
                sx={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                generate
              </Box>
            </Flex>
            <Flex mb={2}>
              <Select
                onChange={e => setMethod(e.target.value)}
                value={method}
                mr={2}
              >
                {map(v => <option value={v}>{v}</option>)([
                  "add",
                  "set",
                  "update",
                  "upsert",
                  "delete",
                ])}
              </Select>
              <Input
                disabled={method === "add"}
                ml={2}
                placeholder="Doc ID"
                value={docid}
                onChange={e => setDocId(e.target.value)}
              />
            </Flex>
            <Flex mb={1} fontSize="10px">
              <Box>Query Signer</Box>
              <Box flex={1} />
              <Box
                onClick={() => {
                  setSigner(EthCrypto.createIdentity().address.toLowerCase())
                }}
                sx={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                generate
              </Box>
            </Flex>
            <Flex mb={2}>
              <Input
                placeholder="Signer"
                value={signer}
                onChange={e => setSigner(e.target.value)}
              />
            </Flex>
            <Flex mb={1} fontSize="10px">
              Query Data
            </Flex>
            <Editor
              value={testData}
              onValueChange={code => setTestData(code)}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              placeholder="enter test data"
              style={{
                flex: 1,
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                overflowY: "auto",
              }}
            />
            <Flex
              onClick={() => setExists(!exists)}
              fontSize="14px"
              align="center"
              mt={2}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              <Box
                as="i"
                className={exists ? "far fa-check-square" : "far fa-square"}
              />
              <Box ml={2}>Data Exists</Box>
            </Flex>
            {!exists ? null : (
              <>
                <Flex mb={1} fontSize="10px" mt={2}>
                  <Box>Old Data Signer</Box>
                  <Box flex={1} />
                  <Box
                    onClick={() => {
                      setOldSigner(
                        EthCrypto.createIdentity().address.toLowerCase()
                      )
                    }}
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                  >
                    generate
                  </Box>
                </Flex>
                <Flex mb={2}>
                  <Input
                    placeholder="Old Signer"
                    value={oldSigner}
                    onChange={e => setOldSigner(e.target.value)}
                  />
                </Flex>
                <Flex mb={1} fontSize="10px">
                  Old Data
                </Flex>
                <Editor
                  value={oldData}
                  onValueChange={code => setOldData(code)}
                  highlight={code => highlight(code, languages.js)}
                  padding={10}
                  placeholder="enter old data"
                  style={{
                    flex: 1,
                    border: "1px solid #E2E8F0",
                    borderRadius: "5px",
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                    overflowY: "auto",
                  }}
                />
              </>
            )}
            <Flex mb={1} fontSize="10px" mt={2}>
              Query Info
            </Flex>
            <Editor
              value={ruleData}
              disabled={true}
              highlight={code => highlight(code, languages.js)}
              placeholder="execute test query"
              padding={10}
              style={{
                flex: 1,
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                overflowY: "auto",
              }}
            />
            <Flex mb={1} fontSize="10px" mt={2}>
              New Data
            </Flex>
            <Editor
              value={newData}
              disabled={true}
              highlight={code => highlight(code, languages.js)}
              placeholder="execute test query"
              padding={10}
              style={{
                flex: 1,
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                overflowY: "auto",
              }}
            />
            <Flex
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              mt={4}
              p={2}
              justify="center"
              align="center"
              color="white"
              height="40px"
              bg="#6441AF"
              onClick={async () => {
                if (checkJSON(newRules)) {
                  return t(toast, "Wrong JSON format for rules")
                }
                if (checkJSON(testData)) {
                  return t(toast, "Wrong JSON format for query data")
                }
                if (/^\s*$/.test(signer)) {
                  return t(toast, "Signer missing")
                }
                const _docid = method === "add" ? nanoid() : docid
                if (/^\s*$/.test(_docid)) {
                  return t(toast, "Doc ID missing")
                }
                const _signer = /^0x/.test(signer)
                  ? signer.toLowerCase()
                  : signer

                let old_data = null
                let _oldSigner = null
                if (exists) {
                  if (checkJSON(oldData)) {
                    return t(toast, "Wrong JSON format for old data")
                  }
                  if (/^\s*$/.test(oldSigner)) {
                    return t(toast, "Old Data Signer missing")
                  }
                  _oldSigner = /^0x/.test(oldSigner)
                    ? oldSigner.toLowerCase()
                    : oldSigner

                  if (method === "add") t(toast, "Doc exists")
                  old_data = parseJSON(oldData)
                } else if (includes(method)(["delete", "update"])) {
                  return t(toast, "Doc doesn't exist")
                }
                const schema = parseJSON(newRules)
                const data = parseJSON(testData)
                const txid = nanoid()
                const timestamp = Math.floor(Date.now() / 1000)
                let next_data = null
                try {
                  if (includes(method)(["set", "add"])) {
                    next_data = mergeData(
                      clone(old_data),
                      data,
                      true,
                      _signer,
                      timestamp
                    )
                  } else if (includes(method)(["update", "upsert"])) {
                    next_data = mergeData(
                      clone(old_data),
                      data,
                      false,
                      _signer,
                      timestamp
                    )
                  }
                } catch (e) {
                  return t(toast, e.toString())
                }
                let rule_data = {
                  contract: {
                    id: contractTxId,
                    version: state.version,
                    owners: state.owner,
                  },
                  request: {
                    method: method,
                    auth: { signer: _signer },
                    block: {
                      height: 1,
                      timestamp,
                    },
                    transaction: {
                      id: txid,
                    },
                    resource: { data: data },
                    id: _docid,
                    path: append(_docid, base_path),
                  },
                  resource: {
                    data: old_data,
                    setter: !exists ? _signer : _oldSigner ?? _signer,
                    newData: next_data,
                    id: _docid,
                    path: append(_docid, base_path),
                  },
                }
                let allowed = false
                try {
                  const rules = parseJSON(newRules)
                  let op = method
                  if (includes(op)(["set", "add"])) op = "create"
                  if (op === "create" && exists) op = "update"
                  if (op === "upsert") {
                    if (exists) {
                      op = "update"
                    } else {
                      op = "create"
                    }
                  }
                  const setElm = (k, val) => {
                    let elm = rule_data
                    let elm_path = k.split(".")
                    let i = 0
                    for (let v of elm_path) {
                      if (i === elm_path.length - 1) {
                        elm[v] = val
                        break
                      } else if (isNil(elm[v])) elm[v] = {}
                      elm = elm[v]
                      i++
                    }
                    return elm
                  }
                  if (!isNil(rules)) {
                    for (let k in rules || {}) {
                      const [permission, _ops] = k.split(" ")
                      if (permission !== "let") continue
                      const rule = rules[k]
                      let ok = false
                      if (isNil(_ops)) {
                        ok = true
                      } else {
                        const ops = _ops.split(",")
                        if (intersection(ops)(["write", op]).length > 0) {
                          ok = true
                        }
                      }
                      if (ok) {
                        for (let k2 in rule || {}) {
                          setElm(k2, fpjson(clone(rule[k2]), rule_data))
                        }
                      }
                    }
                  }
                  for (let k in rules || {}) {
                    const spk = k.split(" ")
                    if (spk[0] === "let") continue
                    const rule = rules[k]
                    const [permission, _ops] = k.split(" ")
                    const ops = _ops.split(",")
                    if (intersection(ops)(["write", op]).length > 0) {
                      const ok = jsonLogic.apply(rule, rule_data)
                      if (permission === "allow" && ok) {
                        allowed = true
                      } else if (permission === "deny" && ok) {
                        allowed = false
                        break
                      }
                    }
                  }
                } catch (e) {
                  return t(toast, e.toString())
                }
                setRuleData(JSON.stringify(rule_data, undefined, 2))
                if (allowed) {
                  t(toast, "Valid!", "success")
                  setNewData(JSON.stringify(next_data, undefined, 2))
                } else {
                  t(toast, "Invalid!")
                  setNewData("")
                }
              }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                "Test Rules"
              )}
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    )
  }
)
