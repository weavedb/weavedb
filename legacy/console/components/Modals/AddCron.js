import { useState } from "react"
import { Checkbox, Box, Flex, Input, Textarea } from "@chakra-ui/react"
import { isNil, is } from "ramda"
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
  ({ db, contractTxId, setCrons, setAddCron, fn, set, $ }) => {
    const [newSpan, setNewSpan] = useState("")
    const [newCronName, setNewCronName] = useState("")
    const [newStart, setNewStart] = useState("")
    const [newEnd, setNewEnd] = useState("")
    const [newDo, setNewDo] = useState("")
    const [newCron, setNewCron] = useState("[]")
    const [newTimes, setNewTimes] = useState("")
    return (
      <Modal title="Cron Job" close={setAddCron} type="right">
        <Flex>
          <Input
            value={newCronName}
            placeholder="Cron Name"
            onChange={e => setNewCronName(e.target.value)}
            sx={{
              borderRadius: "3px",
            }}
          />
        </Flex>
        <Flex mt={4}>
          <Input
            mr={2}
            value={newStart}
            placeholder="Start"
            onChange={e => {
              if (!Number.isNaN(e.target.value * 1)) {
                setNewStart(e.target.value)
              }
            }}
            sx={{
              borderRadius: "3px",
            }}
          />
          <Input
            ml={2}
            value={newEnd}
            placeholder="End"
            onChange={e => {
              if (!Number.isNaN(e.target.value * 1)) {
                setNewEnd(e.target.value)
              }
            }}
            sx={{
              borderRadius: "3px",
            }}
          />
        </Flex>
        <Flex mt={4}>
          <Flex mx={2} align="center" flex={1}>
            <Checkbox
              mr={2}
              checked={newDo}
              onClick={e => setNewDo(!newDo)}
              sx={{
                borderRadius: "3px",
              }}
            />
            Do at Start
          </Flex>
          <Input
            flex={1}
            mr={2}
            value={newSpan}
            placeholder="Span"
            onChange={e => {
              if (!Number.isNaN(e.target.value * 1)) {
                setNewSpan(e.target.value)
              }
            }}
            sx={{
              borderRadius: "3px",
            }}
          />
          <Input
            flex={1}
            ml={2}
            value={newTimes}
            placeholder="Times"
            onChange={e => {
              if (!Number.isNaN(e.target.value * 1)) {
                setNewTimes(e.target.value)
              }
            }}
            mb={3}
            sx={{
              borderRadius: "3px",
            }}
          />
        </Flex>
        <Editor
          value={newCron}
          onValueChange={code => setNewCron(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          placeholder="Cron Jobs"
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
              const exID = !/^\s*$/.test(newCronName)
              if (!exID) {
                alert("Enter Cron Name")
                return
              }
              if (newSpan * 1 === 0) {
                alert("Span must be greater than 0")
                return
              }
              let val = null
              try {
                let obj = null
                eval(`obj = ${newCron}`)
                val = newCron
                if (!is(Array)(obj)) {
                  alert("Jobs should be an array.")
                  return
                }
              } catch (e) {
                alert("Wrong JSON format")
                return
              }
              set("add_cron", "loading")
              try {
                let query = `{times: ${newTimes || null}, start: ${
                  newStart || null
                }, end: ${newEnd || null},do: ${
                  newDo ? "true" : "false"
                }, span: ${newSpan * 1}, jobs: ${newCron}}, "${newCronName}"`
                const res = JSON.parse(
                  await fn(queryDB)({
                    method: "addCron",
                    query,
                    contractTxId,
                    dryRead: [["getCrons"]],
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewCron("")
                  setNewStart("")
                  setNewCronName("")
                  setNewEnd("")
                  setNewTimes("")
                  setNewSpan("")
                  setAddCron(false)
                  setCrons(res.results[0].result)
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
