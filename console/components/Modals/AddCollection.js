import { useState } from "react"
import { Box, Flex, Input, Textarea } from "@chakra-ui/react"
import { join, compose, map, append, isNil, indexBy, prop } from "ramda"
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
    setAddCollection,
    documents,
    base_path,
    contractTxId,
    setCollections,
    db,
    fn,
    set,
    $,
  }) => {
    const [newCollection, setNewCollection] = useState("")
    const [newRules, setNewRules] = useState(
      JSON.stringify({ "allow write": true }, undefined, 2)
    )
    return (
      <Modal type="right" title="Access Control Rules" close={setAddCollection}>
        <Input
          value={newCollection}
          placeholder="Collection ID"
          onChange={e => setNewCollection(e.target.value)}
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
              if (/^\s*$/.test(newCollection)) {
                alert("Enter Collection ID")
                return
              } else if (
                !isNil(indexBy(prop("id"))(documents)[newCollection])
              ) {
                alert("Collection exists")
                return
              }
              set("add_collection", "loading")
              let json = null
              try {
                eval(`json = ${newRules}`)
              } catch (e) {}
              if (isNil(json)) return alert("Wrong JSON format")
              try {
                const res = JSON.parse(
                  await fn(queryDB)({
                    dryRead: [["listCollections", ...base_path]],
                    method: "setRules",
                    query: `${newRules}, ${compose(
                      join(", "),
                      map(v => `"${v}"`),
                      append(newCollection)
                    )(base_path)}`,
                    contractTxId,
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewCollection("")
                  setNewRules(`{"allow write": true}`)
                  setAddCollection(false)
                  setCollections(res.results[0].result)
                }
              } catch (e) {
                console.log(e)
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
