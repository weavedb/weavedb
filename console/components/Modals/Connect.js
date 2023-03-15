import { useToast } from "@chakra-ui/react"
import { Box, Flex, Image } from "@chakra-ui/react"
import { inject } from "roidjs"
import { isNil } from "ramda"
import {
  connectAddress,
  createTempAddress,
  connectAddressWithII,
  createTempAddressWithII,
  createTempAddressWithLens,
  connectAddressWithAR,
  createTempAddressWithAR,
} from "../../lib/weavedb"

export default inject(
  [
    "loading",
    "temp_current",
    "temp_current_all",
    "owner_signing_in_modal",
    "signing_in",
    "signing_in_modal",
    "tx_logs",
  ],
  ({ newNetwork, state, contractTxId, network, tab, fn, set, $ }) => {
    const version = isNil(state?.version) ? 0 : state?.version.split(".")[1] * 1
    const toast = useToast()
    return (
      <Flex
        align="center"
        justify="center"
        sx={{
          bg: "rgba(0,0,0,.5)",
          position: "fixed",
          w: "100%",
          h: "100%",
          zIndex: 100,
          top: 0,
          left: 0,
          cursor: "pointer",
        }}
        onClick={() => {
          set(false, "signing_in_modal")
          set(false, "owner_signing_in_modal")
        }}
      >
        <Flex
          wrap="wrap"
          p={4}
          justify="center"
          bg="white"
          sx={{ borderRadius: "10px", cursor: "default" }}
          onClick={e => e.stopPropagation()}
        >
          {$.signing_in ? (
            <Flex
              justify="center"
              align="center"
              direction="column"
              boxSize="150px"
              p={4}
              m={4}
              color="#333"
              bg="white"
              sx={{
                borderRadius: "10px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => set(false, "signing_in")}
            >
              <Box
                fontSize="50px"
                mb={3}
                as="i"
                className="fas fa-spin fa-circle-notch"
              />
              <Box textAlign="center">cancel sign-in</Box>
            </Flex>
          ) : (
            <>
              <Flex
                justify="center"
                align="center"
                direction="column"
                boxSize="150px"
                p={4}
                m={4}
                bg="#333"
                color="white"
                sx={{
                  borderRadius: "10px",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                onClick={async () => {
                  set(true, "signing_in")
                  if ($.owner_signing_in_modal) {
                    await fn(connectAddress)({ network: newNetwork })
                  } else {
                    await fn(createTempAddress)({
                      contractTxId,
                      network,
                      node: tab === "Nodes",
                    })
                  }
                  set(false, "signing_in")
                  set(false, "signing_in_modal")
                  set(false, "owner_signing_in_modal")
                }}
              >
                <Image height="100px" src="/static/images/metamask.png" />
                <Box textAlign="center">MetaMask</Box>
              </Flex>
              <Flex
                p={4}
                m={4}
                boxSize="150px"
                bg="#333"
                color="white"
                justify="center"
                align="center"
                direction="column"
                sx={{
                  borderRadius: "10px",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                onClick={async () => {
                  set(true, "signing_in")
                  if ($.owner_signing_in_modal) {
                    await fn(connectAddressWithII)({
                      network: newNetwork,
                    })
                  } else {
                    await fn(createTempAddressWithII)({
                      contractTxId,
                      network,
                      node: tab === "Nodes",
                    })
                  }
                  set(false, "signing_in")
                  set(false, "signing_in_modal")
                  set(false, "owner_signing_in_modal")
                }}
              >
                <Image height="100px" src="/static/images/dfinity.png" />
                <Box textAlign="center">Internet Identity</Box>
              </Flex>
              <Flex
                p={4}
                m={4}
                boxSize="150px"
                bg="#333"
                color="white"
                justify="center"
                align="center"
                direction="column"
                sx={{
                  borderRadius: "10px",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                onClick={async () => {
                  set(true, "signing_in")
                  try {
                    if ($.owner_signing_in_modal) {
                      await fn(connectAddressWithAR)({
                        network: newNetwork,
                      })
                    } else {
                      await fn(createTempAddressWithAR)({
                        contractTxId,
                        network,
                        node: tab === "Nodes",
                      })
                    }
                    set(false, "signing_in")
                    set(false, "signing_in_modal")
                    set(false, "owner_signing_in_modal")
                  } catch (e) {
                    console.log(e)
                    alert("Something went wrong")
                  }
                }}
              >
                <Image height="100px" src="/static/images/arconnect.png" />
                <Box textAlign="center">ArConnect</Box>
              </Flex>
              {version < 25 || $.owner_signing_in_modal ? null : (
                <Flex
                  justify="center"
                  align="center"
                  direction="column"
                  boxSize="150px"
                  p={4}
                  m={4}
                  bg="#00501E"
                  color="white"
                  sx={{
                    borderRadius: "10px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    set(true, "signing_in")
                    if ($.owner_signing_in_modal) {
                    } else {
                      let err = null
                      try {
                        const tx = await fn(createTempAddressWithLens)({
                          contractTxId,
                          network,
                          node: tab === "Nodes",
                        })
                        console.log(tx)
                      } catch (e) {
                        err = e.message || e.toString?.()
                      }
                      if (!isNil(err)) {
                        toast({
                          description:
                            typeof err === "string"
                              ? err.replace(/^Error: /, "")
                              : "Something went wrong...",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                          position: "bottom-right",
                        })
                      }
                    }
                    set(false, "signing_in")
                    set(false, "signing_in_modal")
                    set(false, "owner_signing_in_modal")
                  }}
                >
                  <Image height="120px" src="/static/images/lens.png" />
                </Flex>
              )}
            </>
          )}
        </Flex>
      </Flex>
    )
  }
)
