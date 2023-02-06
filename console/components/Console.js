import { Box, Flex, Select, Input } from "@chakra-ui/react"
import { map } from "ramda"
import { inject } from "roidjs"
import { queryDB } from "../lib/weavedb"
import { methods } from "../lib/const"

export default inject(
  [],
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
  }) => (
    <Flex w="100%" bg="white" direction="column">
      <Flex
        w="100%"
        justify="center"
        bg="white"
        sx={{
          border: "1px solid #333",
        }}
      >
        <Select
          w="200px"
          value={method}
          onChange={e => setMethod(e.target.value)}
          sx={{
            borderRadius: 0,
          }}
        >
          {map(v => <option value={v}>{v}</option>)(methods)}
        </Select>
        <Input
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
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
          w="150px"
          justify="center"
          align="center"
          color="white"
          bg="#333"
          onClick={async () => {
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
          }}
        >
          Execute
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
        <Flex p={2} align="center">
          <Box
            as="i"
            mr={2}
            className="fas fa-angle-right"
            color="#aaa"
            fontSize="18px"
          />
          {`${method}(${query})`}
        </Flex>
        <Flex
          flex={1}
          px={6}
          color={/^Error:/.test(result) ? "#6441AF" : "#333"}
        >
          {result}
        </Flex>
      </Flex>
    </Flex>
  )
)
