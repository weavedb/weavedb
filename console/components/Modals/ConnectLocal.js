import { useState } from "react"
import { Box, Flex, Input } from "@chakra-ui/react"
import { isNil } from "ramda"
import { inject } from "roidjs"
import { connectLocalhost } from "../../lib/weavedb"

export default inject(
  ["loading", "temp_current"],
  ({ newPort, setNewPort, setConnect, setPort, fn, set, $ }) => {
    return (
      <Flex
        w="100%"
        h="100%"
        position="fixed"
        sx={{ top: 0, left: 0, zIndex: 100, cursor: "pointer" }}
        bg="rgba(0,0,0,0.5)"
        onClick={() => setConnect(false)}
        justify="center"
        align="center"
      >
        <Box
          bg="white"
          width="500px"
          p={3}
          sx={{ borderRadius: "5px", cursor: "default" }}
          onClick={e => e.stopPropagation()}
        >
          <>
            <Flex fontSize="10px" m={1}>
              Port
            </Flex>
            <Input
              flex={1}
              value={newPort}
              sx={{ borderRadius: 0 }}
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
        </Box>
      </Flex>
    )
  }
)
