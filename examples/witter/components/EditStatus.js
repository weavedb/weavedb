import { Input, Textarea, Box, Flex } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { postStatus } from "../lib/db"
import { isNil, assoc } from "ramda"
import { useRouter } from "next/router"
export default function EditUser({
  repost,
  editStatus,
  setEditStatus,
  user,
  replyTo,
  setPost,
  tweet,
}) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const ok = body.length > 0 && body.length <= 280
  return !editStatus ? null : (
    <Flex
      h="100%"
      w="100%"
      bg="rgba(0,0,0,0.5)"
      sx={{ position: "fixed", top: 0, left: 0 }}
      align="center"
      justify="center"
    >
      <Box
        onClick={e => e.stopPropagation()}
        bg="white"
        m={4}
        maxW="650px"
        width="100%"
        sx={{ borderRadius: "5px" }}
        fontSize="14px"
      >
        <Flex fontSize="18px" justify="flex-end" mx={4} mt={2} mb="-15px">
          <Box
            onClick={() => setEditStatus(false)}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            x
          </Box>
        </Flex>
        <Box px={4} pb={4} pt={isNil(user) ? 4 : 0}>
          <Flex fontSize="24px" justify="center" fontWeight="bold" mb={4}>
            {repost
              ? "Write Comment"
              : isNil(replyTo)
              ? "New Post"
              : "Write Reply"}
          </Flex>
          <Box fontSize="12px" mx={1} mt={3} mb={1}>
            Body ( 280 characters )
          </Box>
          <Box>
            <Textarea
              placeholder="body"
              value={body}
              onChange={e => {
                if (e.target.value.length < 280) setBody(e.target.value)
              }}
            />
          </Box>
          <Box mt={4}>
            <Flex
              bg={ok ? "#333" : "#ccc"}
              color="white"
              w="100%"
              justify="center"
              align="center"
              p={2}
              sx={{
                borderRadius: "5px",
                cursor: ok ? "pointer" : "default",
                ":hover": { opacity: ok ? 0.75 : 1 },
              }}
              onClick={async () => {
                if (ok) {
                  const { err, post } = await postStatus({
                    repost: repost?.id ?? "",
                    replyTo,
                    body,
                    user,
                    tweet: repost ?? tweet,
                  })
                  if (isNil(err)) {
                    setBody("")
                    setEditStatus(false)
                    if (!isNil(setPost)) setPost(post)
                    if (isNil(replyTo)) router.push(`/s/${post.id}`)
                  }
                }
              }}
            >
              {repost ? "Repost" : "Post"}
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  )
}
