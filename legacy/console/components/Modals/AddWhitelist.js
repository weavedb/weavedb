import { useState } from "react"
import { Box, Flex, Input, Select } from "@chakra-ui/react"
import { map } from "ramda"
import { inject } from "roidjs"
import { read, _whitelist, setupWeaveDB } from "../../lib/weavedb"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current", "temp_current_all", "tx_logs"],
  ({
    node,
    setWhitelist,
    numLimit,
    setNumLimit,
    setNewWhitelistUser,
    newWhitelistUser,
    setEditWhitelist,
    editWhitelist,
    setAddWhitelist,
    setAllow,
    setLimit,
    allow,
    limit,
    fn,
    set,
    $,
  }) => {
    return (
      <Modal
        title="Whitelist"
        close={() => {
          setAddWhitelist(false)
          setEditWhitelist(false)
        }}
      >
        <>
          <Flex fontSize="10px" m={1}>
            <Box>Contract Owner</Box>
          </Flex>
          <Input
            flex={1}
            disabled={editWhitelist}
            value={newWhitelistUser || ""}
            sx={{ borderRadius: "5px" }}
            onChange={e => setNewWhitelistUser(e.target.value)}
          />
          <Flex mt={3}>
            <Box flex={1}>
              <Flex fontSize="10px" mx={1} my={1}>
                Allow
              </Flex>
              <Select
                w="100%"
                value={allow ? "True" : "False"}
                onChange={e => setAllow(e.target.value === "True")}
                sx={{ borderRadius: "5px" }}
                mb={3}
              >
                {map(v => <option value={v}>{v}</option>)(["True", "False"])}
              </Select>
            </Box>
            <Box flex={1} ml={1}>
              <Flex fontSize="10px" mx={1} my={1}>
                Limit
              </Flex>
              <Select
                disabled={!allow}
                w="100%"
                value={limit ? "True" : "False"}
                onChange={e => setLimit(e.target.value === "True")}
                sx={{ borderRadius: "5px" }}
                mb={3}
              >
                {map(v => <option value={v}>{v}</option>)(["True", "False"])}
              </Select>
            </Box>
            <Box flex={1} ml={1}>
              <Flex fontSize="10px" mx={1} my={1}>
                How many Contracts?
              </Flex>
              <Input
                w="100%"
                value={numLimit}
                disabled={!limit || !allow}
                onChange={e => {
                  if (!Number.isNaN(+e.target.value * 1)) {
                    setNumLimit(e.target.value)
                  }
                }}
                sx={{ borderRadius: "5px" }}
                mb={3}
              />
            </Box>
          </Flex>
        </>
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
          height="40px"
          color="white"
          bg="#333"
          onClick={async () => {
            if ($.loading === null) {
              set("whitelist", "loading")
              if (/^\s*$/.test(newWhitelistUser)) {
                alert("enter address")
                return
              }

              try {
                const res = await fn(_whitelist)({
                  contractTxId: node.contract,
                  rpc: node.rpc,
                  address: newWhitelistUser,
                  allow,
                  limit: limit ? +numLimit : null,
                })
                if (/^Error:/.test(res)) throw new Error()
                const db = await fn(setupWeaveDB)({
                  contractTxId: node.contract,
                  rpc: node.rpc,
                })
                setWhitelist(
                  await fn(read)({ db, m: "get", q: ["users", true] })
                )
                setNewWhitelistUser("")
                setAddWhitelist(false)
                setEditWhitelist(false)
              } catch (e) {
                alert("something went wrong")
                console.log(e)
              }
              set(null, "loading")
            }
          }}
        >
          {$.loading === "whitelist" ? (
            <Box as="i" className="fas fa-spin fa-circle-notch" />
          ) : editWhitelist ? (
            "Update Address"
          ) : (
            "Add to Whitelist"
          )}
        </Flex>
      </Modal>
    )
  }
)
