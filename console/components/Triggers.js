import { Box, Flex } from "@chakra-ui/react"
import JSONPretty from "react-json-pretty"
import { compose, append, pluck, indexOf, map, isNil } from "ramda"
import { inject } from "roidjs"
import { read, queryDB2 } from "../lib/weavedb"
export default inject(
  ["loading", "tx_logs", "temp_current"],
  ({
    setLockTrigger,
    isOwner,
    contractTxId,
    setTrigger,
    setAddTrigger,
    db,
    setTriggers,
    trigger,
    triggers,
    fn,
    $,
    set,
    base_path,
    doc_path,
    col,
    setNewTriggerKey,
  }) => {
    const _trigger = !isNil(trigger)
      ? triggers[indexOf(trigger, pluck("key", triggers))]
      : null
    return (
      <>
        <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
          <Flex py={2} px={3} color="white" bg="#333" h="35px">
            Triggers
            <Box flex={1} />
            {isNil(col) ? null : (
              <Box
                onClick={() => {
                  if (!isOwner) return alert("connect the owner wallet to DB")
                  setNewTriggerKey("")
                  setLockTrigger(false)
                  setAddTrigger(true)
                }}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box as="i" className="fas fa-plus" />
              </Box>
            )}
          </Flex>
          <Box flex={1} sx={{ position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                overflowY: "auto",
              }}
            >
              {map(v => (
                <Flex
                  onClick={async () => {
                    setTrigger(v.key)
                  }}
                  bg={!isNil(trigger) && trigger === v.key ? "#ddd" : ""}
                  py={2}
                  px={3}
                  sx={{
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                >
                  <Box mr={3} flex={1}>
                    {v.key} : {v.on}
                  </Box>
                  <Box
                    color="#999"
                    sx={{
                      cursor: "pointer",
                      ":hover": {
                        opacity: 0.75,
                        color: "#6441AF",
                      },
                    }}
                    onClick={async e => {
                      e.stopPropagation()
                      if (!isOwner)
                        return alert("connect the owner wallet to DB")
                      if (!confirm("Would you like to remove the trigger?")) {
                        return
                      }
                      if (isNil($.loading)) {
                        set("remove_trigger", "loading")
                        try {
                          let col_path = compose(append(col))(base_path)
                          const res = JSON.parse(
                            await fn(queryDB2)({
                              method: "removeTrigger",
                              contractTxId,
                              query: [v.key, ...col_path],
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
                            if (!isNil(trigger) && trigger === v.key) {
                              setTrigger(null)
                            }
                            setTriggers(res.results[0].result)
                          }
                        } catch (e) {
                          alert("Something went wrong")
                        }
                        set(null, "loading")
                      }
                    }}
                  >
                    <Box as="i" className="fas fa-trash" />
                  </Box>
                </Flex>
              ))(triggers || [])}
            </Box>
          </Box>
        </Flex>
        <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
          <Flex py={2} px={3} color="white" bg="#333" h="35px">
            Func
            <Box flex={1} />
            {isNil(trigger) ? null : (
              <Box
                onClick={() => {
                  if (!isOwner) return alert("connect the owner wallet to DB")
                  setNewTriggerKey(trigger)
                  setLockTrigger(true)
                  setAddTrigger(true)
                }}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box as="i" className="fas fa-edit" />
              </Box>
            )}
          </Flex>
          <Box flex={1} sx={{ position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                overflowY: "auto",
              }}
              p={3}
            >
              {isNil(_trigger) ? null : (
                <JSONPretty id="json-pretty" data={_trigger.func}></JSONPretty>
              )}
            </Box>
          </Box>
        </Flex>
      </>
    )
  }
)
