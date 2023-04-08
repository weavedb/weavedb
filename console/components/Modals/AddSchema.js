import { useState } from "react"
import { Box, Flex, Textarea } from "@chakra-ui/react"
import { isNil, compose, join, map, append } from "ramda"
import { inject } from "roidjs"
import { checkJSON, read, queryDB } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    newSchema,
    setNewSchema,
    db,
    doc_path,
    setSchema,
    setAddSchema,
    contractTxId,
    col,
    base_path,
    fn,
    set,
    $,
  }) => {
    return (
      <Modal title="Data Schema" close={setAddSchema}>
        <Flex mb={1} fontSize="10px">
          Schema for ({doc_path.join(" > ")})
        </Flex>
        <Editor
          value={newSchema}
          onValueChange={code => setNewSchema(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          placeholder="enter schema"
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
          height="40px"
          bg="#333"
          onClick={async () => {
            if (isNil($.loading)) {
              const exID = !/^\s*$/.test(newSchema)
              let val = null
              if (checkJSON(newSchema)) return alert("Wrong JSON format")
              set("add_schema", "loading")
              let col_path = compose(
                join(", "),
                map(v => `"${v}"`),
                append(col)
              )(base_path)
              let query = `${newSchema}, ${col_path}`
              try {
                const res = JSON.parse(
                  await fn(queryDB)({
                    method: "setSchema",
                    query,
                    contractTxId,
                    dryRead: [
                      [
                        "getSchema",
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
                  setNewSchema("")
                  setAddSchema(false)
                  setSchema(res.results[0].result)
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
