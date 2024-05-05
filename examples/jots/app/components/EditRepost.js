import { Input, Textarea, Box, Flex } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { postStatus } from "../lib/db"
import { isNil, assoc } from "ramda"
import { useRouter } from "next/router"
import { repostPost } from "../lib/db"

export default function EditUser({
  setRepost,
  editRepost,
  setReplyTo,
  setEditRepost,
  setEditStatus,
  user,
  reposted,
  setRetweet,
}) {
  const post = editRepost
  return isNil(editRepost) ? null : (
    <Flex
      h="100%"
      w="100%"
      bg="rgba(0,0,0,0.5)"
      sx={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
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
            onClick={() => setEditRepost(null)}
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
            bg={reposted ? "#999" : "#333"}
            color="white"
            my={2}
            py={2}
            justify="center"
            align="center"
            w="250px"
            sx={{
              borderRadius: "5px",
              cursor: reposted ? "default" : "pointer",
              ":hover": { opacity: reposted ? 1 : 0.75 },
            }}
            onClick={async () => {
              if (!reposted && !isNil(user)) {
                const { repost } = await repostPost({ user, tweet: post })
                setRetweet(repost)
                setEditRepost(null)
              }
            }}
          >
            <Box as="i" className="fas fa-retweet" mr={3} />
            {reposted ? "Already Reposted" : "Repost"}
          </Flex>
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
            onClick={() => {
              setReplyTo(post.id)
              setRepost(post)
              setEditStatus(true)
              setEditRepost(null)
            }}
          >
            <Box as="i" className="far fa-comment" mr={3} />
            Repost with Comment
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}
