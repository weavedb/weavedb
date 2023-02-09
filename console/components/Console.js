import { Box, Flex, Select, Input } from "@chakra-ui/react"
import { useState } from "react"
import { map, isNil } from "ramda"
import { inject } from "roidjs"
import { read, addLog, queryDB } from "../lib/weavedb"
import { methods } from "../lib/const"
import dayjs from "dayjs"

export default inject(
  ["temp_current", "tx_logs"],
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
    $,
  }) => {
    const [querying, setQuerying] = useState(false)
    const [panel, setPanel] = useState("logs")
    const isDB = !isNil(contractTxId)
    return (
      <Flex w="100%" bg="white" direction="column">
        <Flex flex={1}>
          <Flex
            direction="column"
            w="200px"
            sx={{ borderRight: "1px solid #999", borderLeft: "1px solid #999" }}
          >
            {map(v => (
              <Flex
                align="center"
                h="40px"
                onClick={() => setPanel(v.key)}
                bg={panel === v.key ? "#6441AF" : "white"}
                color={panel === v.key ? "white" : "#333"}
                px={4}
                sx={{
                  borderTop: "1px solid #999",
                  cursor: panel === v.key ? "default" : "pointer",
                  ":hover": { opacity: panel === v.key ? 1 : 0.75 },
                }}
              >
                {v.label}
              </Flex>
            ))([
              { key: "query", label: "Custom Query" },
              { key: "logs", label: "Transaction Logs" },
            ])}
          </Flex>
          {panel === "logs" ? (
            <Box
              flex={1}
              bg="white"
              w="100%"
              h="200px"
              sx={{ borderTop: "1px solid #999", overflowY: "auto" }}
              p={1}
            >
              {map(v => (
                <Flex align="center" px={2} py={1}>
                  <Flex w="120px">
                    {dayjs(v.date).format("YYYY/MM/DD HH:mm:ss")}
                  </Flex>
                  <Box
                    as="i"
                    mr={2}
                    className="fas fa-angle-right"
                    color="#6441AF"
                    fontSize="18px"
                  />
                  <Box>{v.duration} ms</Box>
                  <Box
                    as="i"
                    mx={2}
                    className="fas fa-angle-right"
                    color="#6441AF"
                    fontSize="18px"
                  />
                  <Box>{v.node || "Browser SDK"}</Box>
                  <Box
                    as="i"
                    mx={2}
                    className="fas fa-angle-right"
                    color="#6441AF"
                    fontSize="18px"
                  />
                  <Box
                    as="a"
                    color="#6441AF"
                    sx={{ textDecoration: "underline" }}
                    target="_blank"
                    href={`https://sonar.warp.cc/?#/app/contract/${v.contractTxId}`}
                  >
                    {v.contractTxId}
                  </Box>
                  <Box
                    as="i"
                    mx={2}
                    className="fas fa-angle-right"
                    color="#6441AF"
                    fontSize="18px"
                  />
                  <Box>{v.method}</Box>
                  {v.success ? null : (
                    <>
                      <Box
                        as="i"
                        mx={2}
                        className="fas fa-angle-right"
                        color="#6441AF"
                        fontSize="18px"
                      />
                      <Box color="#6441AF">Error</Box>
                    </>
                  )}
                  {isNil(v.txid) ? null : (
                    <>
                      <Box
                        as="i"
                        mx={2}
                        className="fas fa-angle-right"
                        color="#6441AF"
                        fontSize="18px"
                      />
                      <Box
                        as="a"
                        color="#6441AF"
                        sx={{ textDecoration: "underline" }}
                        target="_blank"
                        href={`https://sonar.warp.cc/#/app/interaction/${v.txid}`}
                      >
                        {v.txid}
                      </Box>
                    </>
                  )}
                </Flex>
              ))($.tx_logs || [])}
            </Box>
          ) : (
            <Flex
              direction="column"
              flex={1}
              bg="white"
              w="100%"
              justify="center"
              mb={3}
            >
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
                    borderLeft: "0px",
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
                        if (/^Error:/.test(res)) {
                          alert("somethig went wrong")
                        } else {
                          setResult(res)
                          setState(
                            await fn(read)({ db, m: "getInfo", q: [true] })
                          )
                        }
                      } catch (e) {
                        console.log(e)
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
              <Flex flex={1} px={6} color="#6441AF" pb={3}>
                {isDB ? result : ""}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    )
  }
)
