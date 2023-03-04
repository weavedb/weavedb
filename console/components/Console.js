import { Box, Flex, Select, Input } from "@chakra-ui/react"
import { useState } from "react"
import { map, isNil, includes } from "ramda"
import { inject } from "roidjs"
import { read, addLog, queryDB } from "../lib/weavedb"
import { methods } from "../lib/const"
import dayjs from "dayjs"
const reads = [
  "get",
  "cget",
  "getIndexes",
  "getCrons",
  "getSchema",
  "getRules",
  "getIds",
  "getOwner",
  "getAddressLink",
  "getAlgorithms",
  "getLinkedContract",
  "getEvolve",
  "getVersion",
  "getRelayerJob",
  "listRelayerJobs",
  "listCollections",
  "getInfo",
  "getNonce",
]
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
                <Flex align="center" px={2} py={1} ju>
                  <Flex w="120px">
                    {dayjs(v.date).format("YYYY/MM/DD HH:mm:ss")}
                  </Flex>
                  <Box
                    as="i"
                    className="fas fa-angle-right"
                    color="#6441AF"
                    fontSize="18px"
                  />
                  <Flex justify="flex-end" width="55px">
                    {v.duration} ms
                  </Flex>
                  <Box
                    as="i"
                    mx={2}
                    className="fas fa-angle-right"
                    color="#6441AF"
                    fontSize="18px"
                  />
                  <Flex
                    bg={!includes(v.method)(reads) ? "#6441AF" : "#999"}
                    px={2}
                    color="white"
                    mr={2}
                    fontSize="10px"
                    w="40px"
                    justify="center"
                    sx={{ borderRadius: "3px" }}
                  >
                    {!includes(v.method)(reads) ? "Write" : "Read"}
                  </Flex>

                  <Box>{v.method}</Box>
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
                  {!isNil(v.err) ? (
                    <>
                      <Box
                        as="i"
                        mx={2}
                        className="fas fa-times"
                        color="tomato"
                        fontSize="18px"
                      />
                      <Box color="tomato">{v.err}</Box>
                    </>
                  ) : isNil(v.txid) ? null : (
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
                          dryRead: [["getInfo"]],
                        })
                        if (/^Error:/.test(res)) {
                          alert("somethig went wrong")
                        } else {
                          setResult(res)
                          if (!isNil(JSON.parse(res).results)) {
                            setState(JSON.parse(res).results[0].result)
                          }
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
              <Flex
                flex={1}
                height="160px"
                sx={{ overflowY: "auto" }}
                direction="column"
              >
                <Flex p={2} color={isDB ? "#333" : "#6441AF"}>
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
                <Flex
                  flex={1}
                  px={6}
                  color="#6441AF"
                  pb={3}
                  sx={{ wordBreak: "break-all" }}
                >
                  {isDB ? result : ""}
                </Flex>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    )
  }
)
