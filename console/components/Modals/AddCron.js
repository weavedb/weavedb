import { useState } from "react"
import { Checkbox, Box, Flex, Input, Textarea } from "@chakra-ui/react"
import { isNil, is } from "ramda"
import { inject } from "roidjs"
import { read, queryDB } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({ db, contractTxId, setCrons, setAddCron, fn, set, $ }) => {
    const [newSpan, setNewSpan] = useState("")
    const [newCronName, setNewCronName] = useState("")
    const [newStart, setNewStart] = useState("")
    const [newEnd, setNewEnd] = useState("")
    const [newDo, setNewDo] = useState("")
    const [newCron, setNewCron] = useState("")
    const [newTimes, setNewTimes] = useState("")
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddCron(false)}
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
              sx={{
                borderRadius: "3px",
              }}
            />
          </Flex>
          <Textarea
            mt={3}
            value={newCron}
            placeholder="Cron Jobs"
            onChange={e => setNewCron(e.target.value)}
            sx={{
              borderRadius: "3px",
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
                    setCrons(await fn(read)({ db, m: "getCrons", q: [true] }))
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
        </Box>
      </Flex>
    )
  }
)
