import { useState } from "react"
import { Box, Flex, Textarea } from "@chakra-ui/react"
import { is, compose, includes, append, isNil, map, clone, join } from "ramda"
import { inject } from "roidjs"
import { read, queryDB } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current", "tx_logs"],
  ({
    setAddIndex,
    indexes,
    setIndexes,
    contractTxId,
    col,
    base_path,
    doc_path,
    db,
    fn,
    set,
    $,
  }) => {
    const [newIndex, setNewIndex] = useState(`[]`)
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setAddIndex(false)}
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
            value={newIndex}
            placeholder="Compound Index"
            onChange={e => setNewIndex(e.target.value)}
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
                const exIndex = !/^\s*$/.test(newIndex)
                if (!exIndex) {
                  alert("Enter rules")
                  return
                }
                let val = null
                let obj
                try {
                  eval(`obj = ${newIndex}`)
                  if (!is(Array, obj)) {
                    alert("Index must be an array")
                    return
                  }
                  if (obj.length < 2) {
                    alert("Compound Index must have at least 2 fields")
                    return
                  }
                  val = newIndex
                } catch (e) {
                  alert("Wrong JSON format")
                  return
                }
                const serialize = v =>
                  map(v2 => {
                    let v3 = clone(v2)
                    if (v3.length < 2) v3.push("asc")
                    return join(":")(v2)
                  })(v).join(",")
                if (
                  compose(includes(serialize(obj)), map(serialize))(indexes)
                ) {
                  alert("Index exists")
                  return
                }
                set("add_index", "loading")
                let col_path = compose(
                  join(", "),
                  map(v => `"${v}"`),
                  append(col)
                )(base_path)
                let query = `${newIndex}, ${col_path}`
                const res = JSON.parse(
                  await fn(queryDB)({
                    method: "addIndex",
                    query,
                    contractTxId,
                  })
                )
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setNewIndex("[]")
                  setAddIndex(false)
                  setIndexes(
                    await fn(read)({
                      db,
                      m: "getIndexes",
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
