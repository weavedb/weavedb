import { useState } from "react"
import { Box, Flex, Input, Textarea, Select } from "@chakra-ui/react"
import { concat, compose, join, append, map, isNil, includes } from "ramda"
import { inject } from "roidjs"
import { read, queryDB, plusNonce } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    col,
    doc,
    contractTxId,
    base_path,
    doc_path,
    docdata,
    db,
    setSubCollections,
    setDocdata,
    setAddData,
    fn,
    set,
    $,
  }) => {
    const [newField, setNewField] = useState("")
    const [newFieldType, setNewFieldType] = useState(`string`)
    const [newFieldVal, setNewFieldVal] = useState("")
    const [newFieldVal2, setNewFieldVal2] = useState(
      JSON.stringify({ "allow write": true })
    )
    const [newFieldBool, setNewFieldBool] = useState(true)
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddData(false)}
        justify="center"
        align="center"
      >
        <Box
          bg="white"
          width="500px"
          p={3}
          sx={{ borderRadius: "5px", cursor: "default" }}
          onClick={e => e.stopPropagation()}
        >
          <Flex mb={3}>
            <Select
              value={newFieldType}
              onChange={e => setNewFieldType(e.target.value)}
            >
              {map(v => <option value={v}>{v}</option>)([
                "string",
                "bool",
                "number",
                "object",
                "null",
                "sub collection",
              ])}
            </Select>
            <Input
              value={newField}
              placeholder={
                newFieldType === "sub collection"
                  ? "Collection ID"
                  : "Field Key"
              }
              onChange={e => setNewField(e.target.value)}
              sx={{
                borderRadius: "3px",
              }}
            />
          </Flex>
          {newFieldType === "bool" ? (
            <Select
              value={newFieldBool}
              onChange={e => setNewFieldBool(eval(e.target.value))}
            >
              {map(v => <option value={v}>{v ? "true" : "false"}</option>)([
                true,
                false,
              ])}
            </Select>
          ) : newFieldType === "sub collection" ? (
            <Editor
              value={newFieldVal2}
              onValueChange={code => setNewFieldVal2(code)}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              placeholder="Access Contral Rules"
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
              }}
            />
          ) : (
            <Editor
              value={newFieldVal}
              onValueChange={code => setNewFieldVal(code)}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              placeholder="Field Value"
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
              }}
            />
          )}
          <Flex
            mt={3}
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
                const exID = !/^\s*$/.test(newField)
                const _val =
                  newFieldType === "sub collection" ? newFieldVal2 : newFieldVal
                const exVal =
                  includes(newFieldType)(["bool", "null"]) ||
                  !/^\s*$/.test(_val)
                if (!exVal) alert("Enter a value")
                if (!exID) alert("Enter field key")
                if (
                  exID &&
                  newFieldType !== "sub collection" &&
                  !isNil(docdata.data[newField])
                ) {
                  alert("Field exists")
                  return
                }
                let val = null
                switch (newFieldType) {
                  case "number":
                    if (Number.isNaN(_val * 1)) {
                      alert("Enter a number")
                      return
                    }
                    val = _val * 1
                    break
                  case "string":
                    val = `"${_val}"`
                    break
                  case "bool":
                    val = eval(newFieldBool)
                    break
                  case "object":
                    try {
                      eval(`const obj = ${_val}`)
                      val = _val
                    } catch (e) {
                      alert("Wrong JSON format")
                      return
                    }
                    break
                  case "sub collection":
                    if (/^\s*$/.test(newField)) {
                      alert("Enter Collection ID")
                      return
                    } else if (!isNil(docdata.data[newField])) {
                      alert("Collection exists")
                      return
                    }
                    try {
                      JSON.parse(_val)
                      val = _val
                    } catch (e) {
                      alert("Wrong JSON format")
                      return
                    }
                    break
                }
                set("add_data", "loading")
                let query = ""
                let method = ""
                if (newFieldType === "sub collection") {
                  method = "setRules"
                  query = `${val}, ${compose(
                    join(", "),
                    map(v => `"${v}"`),
                    append(newField)
                  )(doc_path)}`
                } else {
                  method = "update"
                  let _doc_path = compose(
                    join(", "),
                    map(v => `"${v}"`),
                    concat(base_path)
                  )([col, doc])
                  query = `{ "${newField}": ${val}}, ${_doc_path}`
                }
                const res = JSON.parse(
                  await fn(queryDB)({
                    method,
                    query,
                    contractTxId,
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewField("")
                  setNewFieldVal("")
                  setAddData(false)
                  setDocdata(
                    await fn(read)({ db, m: "cget", q: [...doc_path, true] })
                  )
                  setSubCollections(
                    await fn(read)({
                      db,
                      m: "listCollections",
                      q: [...doc_path, true],
                    })
                  )
                  fn(plusNonce)()
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
        </Box>
      </Flex>
    )
  }
)
