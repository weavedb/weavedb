import { useState } from "react"
import { Input, Box, Flex, Textarea } from "@chakra-ui/react"
import { isNil, compose, join, map, append, last } from "ramda"
import { inject } from "roidjs"
import { t, parseJSON, checkJSON, read, queryDB } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import Modal from "../Modal"
import { validate } from "jsonschema"
import { useToast } from "@chakra-ui/react"
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
    const [testData, setTestData] = useState("{}")
    const toast = useToast()
    return (
      <Modal title="Data Schema" close={setAddSchema} type="right" width="70%">
        <Flex h="100%">
          <Flex flex={1} direction="column" px={2} h="100%">
            <Flex mb={1} fontSize="10px">
              Collection
            </Flex>
            <Input
              value={last(doc_path)}
              placeholder="Collection ID"
              disabled={true}
              sx={{
                borderRadius: "3px",
              }}
              mb={3}
            />
            <Flex mb={1} fontSize="10px">
              Schema for {doc_path.join(" > ")}
            </Flex>
            <Editor
              value={newSchema}
              onValueChange={code => setNewSchema(code)}
              highlight={code => highlight(code, languages.js)}
              padding={10}
              placeholder="enter schema"
              style={{
                flex: 1,
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
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
              bg="#333"
              onClick={async () => {
                if (isNil($.loading)) {
                  const exID = !/^\s*$/.test(newSchema)
                  let val = null
                  if (checkJSON(newSchema)) return t(toast, "wrong JSON format")
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
                      t(toast, "something went wrong")
                    } else {
                      setNewSchema("")
                      setAddSchema(false)
                      setSchema(res.results[0].result)
                    }
                  } catch (e) {
                    t(toast, "something went wrong")
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
              Test Schema (Enter a test data)
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
                if (checkJSON(newSchema)) {
                  return t(toast, "Wrong JSON format for schema")
                }
                if (checkJSON(testData)) {
                  return t(toast, "Wrong JSON format for data")
                }
                const schema = parseJSON(newSchema)
                const data = parseJSON(testData)
                try {
                  const valid = validate({}, schema)
                  if (valid.valid) return t(toast, "Valid!", "success")
                  return t(toast, "Invalid!")
                } catch (e) {
                  return alert("Wrong schema format")
                }
              }}
            >
              {!isNil($.loading) ? (
                <Box as="i" className="fas fa-spin fa-circle-notch" />
              ) : (
                "Test Schema"
              )}
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    )
  }
)
