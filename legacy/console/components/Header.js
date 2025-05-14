import { Image, Box, Flex } from "@chakra-ui/react"
import { inject } from "roidjs"

import { logoutTemp } from "../lib/weavedb.js"

import { isNil } from "ramda"

const ConnectWallet = inject(
  ["temp_current_all", "temp_current", "temp_wallet", "signing_in_modal"],
  ({ $, set, fn, tab, node, contractTxId, setAddInstance }) => {
    const isLens = /^lens:/.test($.temp_current || "")
    const isWebAuthn = /^webauthn:/.test($.temp_current || "")
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
        bg={
          isNil(contractTxId)
            ? "#6441AF"
            : isWebAuthn
            ? "#3423A6"
            : isLens
            ? "#00501E"
            : "#333"
        }
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
              h="25px"
              src={
                $.temp_wallet === "intmax"
                  ? "/static/images/intmax.png"
                  : /^lens:/.test($.temp_current)
                  ? "/static/images/lens.png"
                  : /^webauthn:/.test($.temp_current)
                  ? "/static/images/webauthn.png"
                  : $.temp_current.length < 88
                  ? /^0x/.test($.temp_current)
                    ? "/static/images/metamask.png"
                    : "/static/images/arconnect.png"
                  : "/static/images/dfinity.png"
              }
              mr={3}
            />
            {isWebAuthn
              ? $.temp_current.split(":")[1].slice(0, 10)
              : isLens
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
  showSidebar,
  setShowSidebar,
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
      zIndex: 3,
    }}
    align="center"
  >
    <Flex
      px={5}
      justify="flex-start"
      align="center"
      fontSize="16px"
      w={["250px", null, null, null, "500px"]}
      onClick={() => setShowSidebar(!showSidebar)}
    >
      <Box
        display={["block", null, null, null, "none"]}
        sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
        as="i"
        className={showSidebar ? "fas fa-angle-left" : "fas fa-bars"}
        fontSize="25px"
        color="#6441AF"
      />
      <Box
        sx={{ alignItems: "center" }}
        display={["none", null, null, null, "flex"]}
      >
        <Image
          boxSize="30px"
          src="/static/images/logo.png"
          sx={{ borderRadius: "50%" }}
          mr={3}
        />
        WeaveDB
      </Box>
    </Flex>
    <Flex flex={1} justify="center" fontSize="12px"></Flex>
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
