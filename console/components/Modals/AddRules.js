import { useState } from "react"
import { Box, Flex, Textarea } from "@chakra-ui/react"
import { isNil, compose, join, map, append } from "ramda"
import { inject } from "roidjs"
import { queryDB } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current"],
  ({
    db,
    doc_path,
    setRules,
    setAddRules,
    col,
    base_path,
    contractTxId,
    fn,
    set,
    $,
  }) => {
    const [newRules, setNewRules] = useState(`{"allow write": true}`)
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddRules(false)}
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
          <Textarea
            mt={3}
            value={newRules}
            placeholder="Access Control Rules"
            onChange={e => setNewRules(e.target.value)}
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
                const exRules = !/^\s*$/.test(newRules)
                if (!exRules) {
                  alert("Enter rules")
                }
                let val = null
                try {
                  eval(`const obj = ${newRules}`)
                  val = newRules
                } catch (e) {
                  alert("Wrong JSON format")
                  return
                }
                set("add_rules", "loading")
                let col_path = compose(
                  join(", "),
                  map(v => `"${v}"`),
                  append(col)
                )(base_path)
                try {
                  let query = `${newRules}, ${col_path}`
                  const res = JSON.parse(
                    await fn(queryDB)({
                      method: "setRules",
                      query,
                      contractTxId,
                    })
                  )
                  if (!res.success) {
                    alert("Something went wrong")
                  } else {
                    setNewRules(`{"allow write": true}`)
                    setAddRules(false)
                    setRules(
                      await db.getRules(
                        ...(doc_path.length % 2 === 0
                          ? doc_path.slice(0, -1)
                          : doc_path),
                        true
                      )
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
        </Box>
      </Flex>
    )
  }
)
