import { Box, Flex } from "@chakra-ui/react"
import JSONPretty from "react-json-pretty"
import { map, isNil } from "ramda"
import { inject } from "roidjs"
import { read, removeRelayerJob } from "../lib/weavedb"
export default inject(
  ["loading", "tx_logs", "temp_current"],
  ({
    isOwner,
    contractTxId,
    setRelayers,
    setAddRelayer,
    db,
    setRelayer,
    relayer,
    relayers,
    fn,
    $,
    set,
  }) => (
    <>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Relayer Jobs
          <Box flex={1} />
          <Box
            onClick={() => {
              if (!isOwner) return alert("connect the owner wallet to DB")
              setAddRelayer(true)
            }}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-plus" />
          </Box>
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
                  const job = await fn(read)({
                    db,
                    m: "getRelayerJob",
                    q: [v],
                  })
                  if (!isNil(job)) setRelayer({ name: v, job })
                }}
                bg={!isNil(relayer) && relayer.name === v ? "#ddd" : ""}
                py={2}
                px={3}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box mr={3} flex={1}>
                  {v}
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
                    if (!isOwner) return alert("connect the owner wallet to DB")
                    if (!confirm("Would you like to remove the relayer job?")) {
                      return
                    }
                    if (isNil($.loading)) {
                      set("remove_relayer", "loading")
                      try {
                        console.log(contractTxId)
                        const res = JSON.parse(
                          await fn(removeRelayerJob)({
                            name: v,
                            contractTxId,
                          })
                        )
                        if (!res.success) {
                          alert("Something went wrong")
                        } else {
                          if (!isNil(relayer) && relayer.name === v) {
                            setRelayer(null)
                          }
                          setRelayers(res.results[0].result)
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
            ))(relayers || [])}
          </Box>
        </Box>
      </Flex>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Settings
          <Box flex={1} />
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
            {isNil(relayer) ? null : (
              <>
                <Flex align="flex-start" p={2} px={3}>
                  <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    Relayers
                  </Box>
                  <Box flex={1}>
                    {map(v => <Box>{v}</Box>)(relayer.job.relayers || [])}
                  </Box>
                </Flex>
                <Flex align="center" p={2} px={3}>
                  <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    Multisig Type
                  </Box>
                  <Box flex={1}>{relayer.job.multisig_type}</Box>
                </Flex>

                <Flex align="center" p={2} px={3}>
                  <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    Multisig
                  </Box>
                  <Box flex={1}>{relayer.job.multisig}</Box>
                </Flex>
                <Flex align="flex-start" p={2} px={3}>
                  <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    Signers
                  </Box>
                  <Box flex={1}>
                    {map(v => <Box>{v}</Box>)(relayer.job.signers || [])}
                  </Box>
                </Flex>
              </>
            )}
          </Box>
        </Box>
      </Flex>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Schema for Extra Data
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
            {isNil(relayer) ? null : (
              <JSONPretty
                id="json-pretty"
                data={relayer.job.schema}
              ></JSONPretty>
            )}
          </Box>
        </Box>
      </Flex>
    </>
  )
)
