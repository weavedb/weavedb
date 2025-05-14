import { Input, Textarea, Box, Flex, Image } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { postStatus } from "../lib/db"
import { map, isNil, assoc } from "ramda"
import { useRouter } from "next/router"
import Tweet from "./Tweet"
import dynamic from "next/dynamic"
const App = dynamic(() => import("./App2"), { ssr: false })

export default function EditUser({
  users,
  repost,
  editStatus,
  setEditStatus,
  user,
  replyTo,
  setPost,
  tweet,
}) {
  const router = useRouter()
  const [coverIcon, setCoverIcon] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [HTML, setHTML] = useState("")
  const [json, setJSON] = useState(null)
  const [text, setText] = useState("")
  const ok = text.length > 0 && text.length <= 280
  return !editStatus ? null : (
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
            <Box as="i" className="fas fa-times" />
          </Box>
        </Flex>
        {!isNil(replyTo) && !repost && !isNil(tweet) ? (
          <Box p={2} mx={2} sx={{ borderBottom: "1px solid #ccc" }} mb={4}>
            <Tweet {...{ isLink: false, tweet, users, buttons: false }} />
          </Box>
        ) : null}
        <Box px={4} pb={4} pt={isNil(user) ? 4 : 0}>
          <Flex fontSize="24px" justify="center" fontWeight="bold">
            {repost
              ? "Write Comment"
              : isNil(replyTo)
              ? "New Post"
              : "Write Reply"}
          </Flex>
          <Box className="simple_post" minH="100px">
            <App {...{ setHTML, setJSON, setText }} />
          </Box>
          <Flex align="center" mt={2}>
            <Flex flex={1} px={8} align="center">
              <Box
                as="label"
                htmlFor="cover-image"
                fontSize="20px"
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box as="i" className="far fa-image" />
              </Box>
              <Input
                id="cover-image"
                display="none"
                p={1}
                accept=".jpg,.png,.jpeg"
                type="file"
                onChange={async e => {
                  if (!isNil(e.target.files[0])) {
                    const {
                      readAndCompressImage,
                    } = require("browser-image-resizer")
                    const file = await readAndCompressImage(e.target.files[0], {
                      maxWidth: 800,
                      maxHeight: 800,
                      mimeType: e.target.files[0].type,
                    })
                    let reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = () => setCoverIcon(reader.result)
                  }
                }}
              />
              <Box flex={1} />
              <Box
                fontSize="20px"
                color={text.length > 280 ? "crimson" : "#333"}
              >
                {text.length}
              </Box>
            </Flex>
          </Flex>
          {isNil(coverIcon) ? null : (
            <Flex justify="center" w="100%" mb={2}>
              <Box flex={1} />
              <Image
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                my={4}
                src={coverIcon}
                maxW="500px"
                maxH="500px"
                onClick={() => {
                  const base64ImageData = coverIcon
                  const contentType = coverIcon.split(";")[0].split(":")[1]

                  const byteCharacters = atob(
                    base64ImageData.substr(`data:${contentType};base64,`.length)
                  )
                  const byteArrays = []

                  for (
                    let offset = 0;
                    offset < byteCharacters.length;
                    offset += 1024
                  ) {
                    const slice = byteCharacters.slice(offset, offset + 1024)

                    const byteNumbers = new Array(slice.length)
                    for (let i = 0; i < slice.length; i++) {
                      byteNumbers[i] = slice.charCodeAt(i)
                    }

                    const byteArray = new Uint8Array(byteNumbers)

                    byteArrays.push(byteArray)
                  }
                  const blob = new Blob(byteArrays, { type: contentType })
                  const blobUrl = URL.createObjectURL(blob)
                  window.open(blobUrl, "_blank")
                }}
              />
              <Flex flex={1} justify="flex-end">
                <Box
                  m={6}
                  onClick={() => setCoverIcon(null)}
                  sx={{
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  as="i"
                  fontSize="20px"
                  className="fas fa-times"
                />
              </Flex>
            </Flex>
          )}
          {!isNil(repost) ? (
            <Box
              sx={{ border: "1px solid #ccc", borderRadius: "10px" }}
              mb={4}
              mt={2}
            >
              <Tweet
                {...{ isLink: false, tweet: repost, users, buttons: false }}
              />
            </Box>
          ) : null}
          <Box mt={2}>
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
                const getHashes = (json, hashes, mentions) => {
                  for (let v of json.children) {
                    if (v.type === "hashtag") hashes.push(v.text)
                    if (v.type === "mention") mentions.push(v.text)
                    if (!isNil(v.children)) getHashes(v, hashes, mentions)
                  }
                }
                let hashes = []
                let mentions = []
                getHashes(json.root, hashes, mentions)
                const _hashes = map(v => v.replace(/^#/, "").toLowerCase())(
                  hashes
                )
                const _mentions = map(v => v.replace(/^@/, "").toLowerCase())(
                  mentions
                )
                if (ok) {
                  setUpdating(true)
                  try {
                    const { err, post } = await postStatus({
                      hashes: _hashes,
                      repost: repost?.id ?? "",
                      replyTo,
                      body: text,
                      user,
                      tweet: repost ?? tweet,
                      cover: coverIcon,
                      mentions: _mentions,
                    })
                    if (isNil(err)) {
                      setText("")
                      setHTML("")
                      setJSON(null)
                      setEditStatus(false)
                      if (!isNil(setPost)) setPost(post)
                      if (isNil(replyTo) || !isNil(repost)) {
                        router.push(`/s/${post.id}`)
                      }
                    }
                  } catch (e) {}
                  setUpdating(false)
                }
              }}
            >
              {updating ? (
                <Box
                  as="i"
                  className="fas fa-circle-notch fa-spin"
                  mr={2}
                  ml="-22px"
                  mb="2px"
                />
              ) : null}
              {repost ? "Repost" : "Post"}
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  )
}
