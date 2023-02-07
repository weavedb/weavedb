import { Box, Flex, Select, Input } from "@chakra-ui/react"
import { useState } from "react"
import { map, isNil } from "ramda"
import { inject } from "roidjs"
import { queryDB } from "../lib/weavedb"
import { methods } from "../lib/const"

export default inject(
  ["temp_current"],
  ({
    result,
    method,
    contractTxId,
    setResult,
    setState,
    setMethod,
    db,
    setQuery,
    query,
    fn,
  }) => {
    const [querying, setQuerying] = useState(false)
    const isDB = !isNil(contractTxId)
    return (
      <Flex w="100%" bg="white" direction="column">
        <Flex
          w="100%"
          justify="center"
          bg="white"
          sx={{
            border: "1px solid #999",
          }}
        >
          <Select
            w="200px"
            disabled={!isDB}
            value={method}
            onChange={e => setMethod(e.target.value)}
            sx={{
              borderRadius: 0,
            }}
          >
            {map(v => (
              <optgroup label={v.label}>
                {map(v2 => <option value={v2}>{v2}</option>)(v.methods)}
              </optgroup>
            ))(methods)}
          </Select>
          <Input
            disabled={!isDB}
            flex={1}
            sx={{
              border: "",
              borderLeft: "1px solid #333",
              borderRadius: 0,
            }}
            placeholder="query"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Flex
            sx={{
              borderRadius: 0,
              cursor: isDB ? "pointer" : "default",
              ":hover": { opacity: isDB ? 0.75 : 1 },
            }}
            w="150px"
            justify="center"
            align="center"
            color="white"
            bg={isDB ? "#333" : "#999"}
            onClick={async () => {
              if (!isDB) return
              if (!querying) {
                setQuerying(true)
                try {
                  const res = await fn(queryDB)({
                    query,
                    method,
                    contractTxId,
                  })
                  setResult(res)
                  setState(await db.getInfo(true))
                } catch (e) {
                  console.log(e)
                  setResult("Error: The wrong query")
                }
                setQuerying(false)
              }
            }}
          >
            {querying ? (
              <Box as="i" className="fas fa-spin fa-circle-notch" />
            ) : (
              "Execute"
            )}
          </Flex>
        </Flex>
        <Flex
          direction="column"
          flex={1}
          px={10}
          bg="white"
          w="100%"
          justify="center"
          mb={3}
        >
          <Flex p={2} align="center" color={isDB ? "#333" : "#6441AF"}>
            <Box
              as="i"
              mr={2}
              className="fas fa-angle-right"
              color="#6441AF"
              fontSize="18px"
            />
            {isDB
              ? `${method}(${query})`
              : "To execute queries, connect with a WeaveDB instance."}
          </Flex>
          <Flex flex={1} px={6} color="#6441AF">
            {isDB ? result : ""}
          </Flex>
        </Flex>
      </Flex>
    )
  }
)
