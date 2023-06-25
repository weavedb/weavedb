import { Textarea, Image, Box, Flex } from "@chakra-ui/react"
import { nanoid } from "nanoid"
import { prepend } from "ramda"
export default function EditPost({
  edit,
  setEdit,
  setBody,
  body,
  user,
  sdk,
  posts,
  toast,
  setPosts,
}) {
  return !edit ? null : (
    <Flex
      bg="rgba(0,0,0,.5)"
      align="center"
      justify="center"
      w="100%"
      h="100%"
      sx={{
        zIndex: 100,
        position: "fixed",
        top: 0,
        left: 0,
        cursor: "pointer",
      }}
      onClick={() => setEdit(false)}
    >
      <Box
        wrap="wrap"
        p={4}
        justify="center"
        bg="white"
        sx={{ borderRadius: "10px", cursor: "default" }}
        onClick={e => e.stopPropagation()}
        maxW="700px"
        width="100%"
        m={4}
      >
        <Box>
          <Textarea
            placeholder="Enter a comment."
            value={body}
            onChange={e => setBody(e.target.value)}
            sx={{ border: "1px solid #ddd" }}
          />
        </Box>
        <Flex justify="flex-end" mt={4} align="center">
          <Flex color={body.length > 280 ? "crimson" : "#8B5CF6"} mr={4}>
            {body.length}
          </Flex>
          <Flex
            color="white"
            bg={body.length > 280 ? "#999" : "#8B5CF6"}
            justify="center"
            align="center"
            w="120px"
            h="35px"
            sx={{
              cursor: body.length > 280 ? "default" : "pointer",
              borderRadius: "3px",
              ":hover": { opacity: 0.75 },
            }}
            onClick={async e => {
              if (/^\s*$/.test(body)) return alert("Enter a comment")
              if (body.length > 280) {
                return alert("Comment cannot be more than 280 characters.")
              }
              const id = nanoid()
              const key = `${user.uid}:${id}`
              const post = {
                user: user.uid,
                body,
                date: Date.now(),
                id,
              }
              const tx = await sdk.set(post, "posts", key, user)
              if (tx.success) {
                setBody("")
                setEdit(false)
                setPosts(prepend(post, posts))
                toast({
                  description: "Posted!",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                  position: "bottom-right",
                })
              } else {
                toast({
                  description: "Something went wrong...",
                  status: "error",
                  duration: 3000,
                  isClosable: true,
                  position: "bottom-right",
                })
              }
            }}
          >
            Post
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}
