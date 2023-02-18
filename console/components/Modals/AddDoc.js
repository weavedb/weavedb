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
import { queryDB, read } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"

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
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddDoc(false)}
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
          <Input
            value={newDoc}
            placeholder="Doc ID - leave it empty for random generation"
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
                const docmap = indexBy(prop("id"))(documents)
                if (exID && !isNil(docmap[newDoc])) {
                  alert("Doc exists")
                  return
                }
                try {
                  JSON.parse(newData)
                } catch (e) {
                  alert("Wrong JSON format")
                  return
                }
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
                } catch (e) {}
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
