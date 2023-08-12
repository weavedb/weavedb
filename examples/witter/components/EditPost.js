import { Input, Textarea, Box, Flex } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { postStatus } from "../lib/db"
import { isNil, assoc } from "ramda"
import { useRouter } from "next/router"
import Link from "next/link"
export default function EditUser({
  setReplyTo,
  editPost,
  setEditPost,
  setEditStatus,
}) {
  return !editPost ? null : (
    <Flex
      h="100%"
      w="100%"
      bg="rgba(0,0,0,0.5)"
      sx={{ position: "fixed", top: 0, left: 0, zIndex: 99 }}
      align="center"
      justify="center"
    >
      <Box
        onClick={e => e.stopPropagation()}
        bg="white"
        m={4}
        maxW="650px"
        sx={{ borderRadius: "5px" }}
        pb={5}
      >
        <Flex fontSize="18px" justify="flex-end" mx={4} mt={2} mb="-15px">
          <Box
            onClick={() => setEditPost(false)}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-times" />
          </Box>
        </Flex>

        <Flex justify="center" mx={10} direction="column">
          <Flex
            bg={"#333"}
            color="white"
            my={2}
            py={2}
            justify="center"
            align="center"
            w="250px"
            sx={{
              borderRadius: "5px",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
            onClick={async () => {
              if (typeof setReplyTo === "function") setReplyTo(null)
              setEditStatus(true)
              setEditPost(false)
            }}
          >
            Simple Post
          </Flex>
          <Link href="/new">
            <Flex
              bg="#333"
              color="white"
              my={2}
              py={2}
              justify="center"
              align="center"
              w="250px"
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              Article
            </Flex>
          </Link>
        </Flex>
      </Box>
    </Flex>
  )
}
