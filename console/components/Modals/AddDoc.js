import { nanoid } from "nanoid"
import { useState } from "react"
import { Box, Flex, Input, Textarea } from "@chakra-ui/react"
import {
  o,
  sortBy,
  compose,
  join,
  append,
  map,
  isNil,
  indexBy,
  prop,
} from "ramda"
import { inject } from "roidjs"
import { checkJSON, queryDB, read, checkNonce } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    setDocuments,
    db,
    contractTxId,
    documents,
    setAddDoc,
    col,
    base_path,
    fn,
    set,
    $,
  }) => {
    const [newDoc, setNewDoc] = useState("")
    const [newData, setNewData] = useState(`{}`)
    return (
      <Modal title="Document" close={setAddDoc} type="right">
        <Flex
          justify="flex-end"
          fontSize="10px"
          m={1}
          sx={{
            textDecoration: "underline",
            cursor: "pointer",
            ":hover": { optcity: 0.75 },
          }}
          px={2}
          onClick={() => {
            setNewDoc(nanoid())
          }}
        >
          Generate Doc ID
        </Flex>
        <Input
          value={newDoc}
          placeholder="Doc ID"
          onChange={e => setNewDoc(e.target.value)}
          sx={{
            borderRadius: "3px",
          }}
          mb={3}
        />
        <Editor
          value={newData}
          onValueChange={code => setNewData(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          placeholder="entar doc data"
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
              const exID = !/^\s*$/.test(newDoc)
              if (!exID) return alert("enter doc id")
              const docmap = indexBy(prop("id"))(documents)
              if (exID && !isNil(docmap[newDoc])) {
                alert("Doc exists")
                return
              }
              if (checkJSON(newData)) return alert("Wrong JSON format")
              set("add_doc", "loading")
              let col_path = compose(
                join(", "),
                map(v => `"${v}"`),
                append(col)
              )(base_path)
              let query = `${newData}, ${col_path}`
              if (exID) query += `, "${newDoc}"`
              try {
                const res = JSON.parse(
                  await fn(queryDB)({
                    method: exID ? "set" : "add",
                    query,
                    contractTxId,
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewDoc("")
                  setNewData(`{}`)
                  setAddDoc(false)
                  setDocuments(
                    o(
                      sortBy(prop("id")),
                      append({ id: newDoc, data: newDoc })
                    )(documents)
                  )
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
      </Modal>
    )
  }
)
