import { Box, Flex, Image } from "@chakra-ui/react"
import { inject } from "roidjs"
import {
  connectAddress,
  createTempAddress,
  connectAddressWithII,
  createTempAddressWithII,
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
  ],
  ({ newNetwork, contractTxId, network, tab, fn, set, $ }) => {
    return (
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
          }}
        >
          <Image height="100px" src="/static/images/arconnect.png" />
          <Box textAlign="center">ArConnect</Box>
        </Flex>
      </>
    )
  }
)
