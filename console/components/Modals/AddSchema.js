import { useState } from "react"
import { Box, Flex, Textarea } from "@chakra-ui/react"
import { isNil, compose, join, map, append } from "ramda"
import { inject } from "roidjs"
import { read, queryDB } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
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
    const [newSchema, setNewSchema] = useState("")
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddSchema(false)}
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
            value={newSchema}
            placeholder="JSON Schema"
            onChange={e => setNewSchema(e.target.value)}
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
            height="40px"
            bg="#333"
            onClick={async () => {
              if (isNil($.loading)) {
                const exID = !/^\s*$/.test(newSchema)
                let val = null
                try {
                  eval(`const obj = ${newSchema}`)
                  val = newSchema
                } catch (e) {
                  alert("Wrong JSON format")
                  return
                }
                set("add_schema", "loading")
                let col_path = compose(
                  join(", "),
                  map(v => `"${v}"`),
                  append(col)
                )(base_path)
                let query = `${newSchema}, ${col_path}`
                const res = JSON.parse(
                  await fn(queryDB)({
                    method: "setSchema",
                    query,
                    contractTxId,
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewSchema("")
                  setAddSchema(false)
                  setSchema(
                    await fn(read)({
                      db,
                      m: "getSchema",
                      q: [
                        ...(doc_path.length % 2 === 0
                          ? doc_path.slice(0, -1)
                          : doc_path),
                        true,
                      ],
                    })
                  )
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
