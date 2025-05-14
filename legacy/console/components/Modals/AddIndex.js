import { useState } from "react"
import { Box, Flex, Textarea } from "@chakra-ui/react"
import { is, compose, includes, append, isNil, map, clone, join } from "ramda"
import { inject } from "roidjs"
import { read, queryDB } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    newIndex,
    setNewIndex,
    setAddIndex,
    indexes,
    setIndexes,
    contractTxId,
    col,
    base_path,
    doc_path,
    db,
    fn,
    set,
    $,
  }) => {
    return (
      <Modal title="Indexes" close={setAddIndex}>
        <Flex mb={1} fontSize="10px">
          Index for ({doc_path.join(" > ")})
        </Flex>
        <Editor
          value={newIndex}
          onValueChange={code => setNewIndex(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          placeholder="enter index"
          style={{
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
              const exIndex = !/^\s*$/.test(newIndex)
              if (!exIndex) {
                alert("Enter rules")
                return
              }
              let val = null
              let obj
              try {
                eval(`obj = ${newIndex}`)
                if (!is(Array, obj)) {
                  alert("Index must be an array")
                  return
                }
                if (obj.length < 2) {
                  alert("Compound Index must have at least 2 fields")
                  return
                }
                val = newIndex
              } catch (e) {
                alert("Wrong JSON format")
                return
              }
              const serialize = v =>
                map(v2 => {
                  let v3 = clone(v2)
                  if (v3.length < 2) v3.push("asc")
                  return join(":")(v2)
                })(v).join(",")
              if (compose(includes(serialize(obj)), map(serialize))(indexes)) {
                alert("Index exists")
                return
              }
              set("add_index", "loading")
              try {
                let col_path = compose(
                  join(", "),
                  map(v => `"${v}"`),
                  append(col)
                )(base_path)
                let query = `${newIndex}, ${col_path}`
                const res = JSON.parse(
                  await fn(queryDB)({
                    method: "addIndex",
                    query,
                    contractTxId,
                    dryRead: [
                      [
                        "getIndexes",
                        ...(doc_path.length % 2 === 0
                          ? doc_path.slice(0, -1)
                          : doc_path),
                      ],
                    ],
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewIndex("[]")
                  setAddIndex(false)
                  setIndexes(res.results[0].result)
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
