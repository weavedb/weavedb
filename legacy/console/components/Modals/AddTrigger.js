import { useState } from "react"
import { Box, Flex, Input, Select, Textarea } from "@chakra-ui/react"
import { compose, join, isNil, without, o, uniq, append, map } from "ramda"
import { inject } from "roidjs"
import { checkJSON, read, queryDB2 } from "../../lib/weavedb"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    col,
    base_path,
    doc_path,
    setTriggers,
    contractTxId,
    db,
    setAddTrigger,
    lockTrigger,
    fn,
    set,
    $,
    newTriggerKey,
    setNewTriggerKey,
  }) => {
    const [on, setOn] = useState("create")
    const [newFunc, setNewFunc] = useState("[]")
    return (
      <Modal title="Trigger" close={setAddTrigger} type="right">
        <Flex>
          <Input
            disabled={lockTrigger}
            value={newTriggerKey}
            placeholder="Trigger Name"
            onChange={e => setNewTriggerKey(e.target.value)}
            sx={{
              borderRadius: "3px",
            }}
          />
        </Flex>
        <Flex mt={3} mb={1} fontSize="10px">
          On
        </Flex>
        <Flex>
          <Select value={on} onChange={e => setOn(e.target.value)}>
            {map(v => <option value={v}>{v}</option>)([
              "create",
              "update",
              "delete",
            ])}
          </Select>
        </Flex>
        <Flex mt={3} mb={1} fontSize="10px">
          Func
        </Flex>
        <Editor
          value={newFunc}
          onValueChange={code => setNewFunc(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          placeholder="Func"
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
              try {
                if (/^\s*$/.test(newTriggerKey)) {
                  alert("Enter trigger key")
                  return
                }
                let _func = null
                if (!/^\s.*$/.test(newFunc)) {
                  if (checkJSON(newFunc)) return alert("Wrong JSON format")
                  eval(`_func = ${newFunc}`)
                }
                set("add_trigger", "loading")
                let col_path = compose(append(col))(base_path)
                const res = JSON.parse(
                  await fn(queryDB2)({
                    method: "addTrigger",
                    query: [
                      { key: newTriggerKey, func: _func, on },
                      ...col_path,
                    ],
                    contractTxId,
                    dryRead: [
                      [
                        "getTriggers",
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
                  setAddTrigger(false)
                  setTriggers(res.results[0].result)
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
