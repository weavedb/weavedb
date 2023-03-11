import { Image, Box, Flex } from "@chakra-ui/react"
import { inject } from "roidjs"

import { logoutTemp } from "../lib/weavedb.js"

import { isNil } from "ramda"

const ConnectWallet = inject(
  ["temp_current_all", "temp_current", "temp_wallet", "signing_in_modal"],
  ({ $, set, fn, tab, node, contractTxId, setAddInstance }) => {
    const isLens = /^lens:/.test($.temp_current || "")
    return tab === "Nodes" ? (
      <Flex
        py={2}
        px={6}
        bg={isNil(node) ? "#6441AF" : "#333"}
        color="white"
        sx={{
          borderRadius: "25px",
          cursor: isNil(node) ? "default" : "pointer",
          ":hover": { opacity: 0.75 },
        }}
        justifyContent="center"
        onClick={async () => {
          if (isNil(node)) {
          } else if (isNil($.temp_current_all)) {
            set(true, "signing_in_modal")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn(logoutTemp)()
            }
          }
        }}
      >
        {isNil(node) ? (
          "Select Node"
        ) : isNil($.temp_current_all) ? (
          "Connect Wallet"
        ) : (
          <Flex align="center">
            {isLens
              ? $.temp_current_all.addr.split(":")[2]
              : `${$.temp_current_all.addr.slice(
                  0,
                  6
                )}...${$.temp_current_all.addr.slice(-4)}`}
          </Flex>
        )}
      </Flex>
    ) : (
      <Flex
        py={2}
        px={6}
        bg={isNil(contractTxId) ? "#6441AF" : isLens ? "#00501E" : "#333"}
        color="white"
        sx={{
          borderRadius: "25px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        justifyContent="center"
        onClick={async () => {
          if (isNil(contractTxId)) {
            setAddInstance(true)
          } else if (isNil($.temp_current)) {
            set(true, "signing_in_modal")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn(logoutTemp)()
            }
          }
        }}
      >
        {isNil(contractTxId) ? (
          "Connect with DB"
        ) : isNil($.temp_current) ? (
          "Sign Into DB"
        ) : (
          <Flex align="center">
            <Image
              boxSize="25px"
              src={
                $.temp_wallet === "intmax"
                  ? "/static/images/intmax.png"
                  : $.temp_current.length < 88
                  ? /^0x/.test($.temp_current)
                    ? "/static/images/metamask.png"
                    : /^lens:/.test($.temp_current)
                    ? "/static/images/lens.png"
                    : "/static/images/arconnect.png"
                  : "/static/images/dfinity.png"
              }
              mr={3}
            />
            {isLens
              ? $.temp_current.split(":")[2]
              : `${$.temp_current.slice(0, 6)}...${$.temp_current.slice(-4)}`}
          </Flex>
        )}
      </Flex>
    )
  }
)

export default ({
  port,
  setPort,
  setConnect,
  tab,
  node,
  contractTxId,
  setAddInstance,
}) => (
  <Flex
    bg="white"
    width="100%"
    height="56px"
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      borderBottom: "1px solid #ddd",
      boxShadow: "0px 2px 10px 0px rgba(0,0,0,0.75)",
    }}
    align="center"
  >
    <Flex px={5} justify="flex-start" align="center" fontSize="16px" w="500px">
      <Image
        boxSize="30px"
        src="/static/images/logo.png"
        sx={{ borderRadius: "50%" }}
        mr={3}
      />
      WeaveDB
    </Flex>
    <Flex flex={1} justify="center" fontSize="12px">
      {isNil(port) ? (
        <Flex onClick={() => setConnect(true)} sx={{ cursor: "pointer" }}>
          Connect with Localhost
        </Flex>
      ) : (
        <Flex
          sx={{ cursor: "pointer" }}
          onClick={() => {
            if (confirm("Would you like to disconnect?")) {
              setPort(null)
            }
          }}
        >
          Connected with local port{" "}
          <Box ml={2} color="#6441AF">
            {port}
          </Box>
        </Flex>
      )}
    </Flex>
    <Flex
      w="250px"
      justify="flex-end"
      align="center"
      justifySelf="flex-end"
      px={5}
    >
      <ConnectWallet {...{ tab, node, contractTxId, setAddInstance }} />
    </Flex>
  </Flex>
)
