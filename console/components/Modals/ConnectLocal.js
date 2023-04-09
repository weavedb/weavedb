import { useState } from "react"
import { Box, Flex, Input } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { connectLocalhost } from "../../lib/weavedb"
import Modal from "../Modal"

export default inject(
  ["loading", "temp_current"],
  ({ newPort, setNewPort, setConnect, setPort, fn, set, $ }) => {
    return (
      <Modal title="Connect with Localhost" close={setConnect}>
        <>
          <Flex fontSize="10px" m={1}>
            Port
          </Flex>
          <Input
            p={2}
            flex={1}
            value={newPort}
            onChange={e => {
              if (!Number.isNaN(e.target.value * 1)) {
                setNewPort(e.target.value * 1)
              }
            }}
          />
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
          color="white"
          bg="#333"
          onClick={async () => {
            const _port = await fn(connectLocalhost)({
              port: newPort,
            })
            if (isNil(_port)) {
              alert("couldn't connect with the port")
            } else {
              setPort(_port)
              setConnect(false)
            }
          }}
        >
          Connect
        </Flex>
      </Modal>
    )
  }
)
