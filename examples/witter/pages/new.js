import {
  Input,
  Textarea,
  Box,
  Flex,
  ChakraProvider,
  Image,
} from "@chakra-ui/react"
import {
  prepend,
  concat,
  values,
  mergeRight,
  __,
  difference,
  keys,
  compose,
  uniq,
  path,
  prop,
  map,
  indexBy,
  isNil,
  pluck,
  last,
  mergeLeft,
} from "ramda"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import Header from "../components/Header"
import EditUser from "../components/EditUser"
import EditStatus from "../components/EditStatus"
import { postArticle, postStatus, checkUser, initDB } from "../lib/db"
import dynamic from "next/dynamic"
import lf from "localforage"
import Article from "../components/Article"
import GithubMarkdown from "../lib/GithubMarkdown"
const App = dynamic(() => import("../components/App"), { ssr: false })

const Placeholder = () => (
  <Box className="editor-placeholder">Enter some text...</Box>
)

export default function Editor() {
  const [coverIcon, setCoverIcon] = useState(null)
  const [users, setUsers] = useState({})
  const [user, setUser] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [tab, setTab] = useState("edit")
  const [HTML, setHTML] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  useEffect(() => {
    ;(async () => {
      const { user, identity } = await checkUser()
      if (!isNil(identity)) {
        setIdentity(identity)
        if (isNil(user)) {
          setEditUser(true)
        } else {
          setUser(user)
        }
      }
      await initDB()
    })()
  }, [])

  const ok =
    !updating &&
    body.length > 0 &&
    body.length <= 280 &&
    title.length > 0 &&
    title.length <= 100
  const maxW = "760px"
  return (
    <ChakraProvider>
      <GithubMarkdown />
      <Flex justify="center" minH="100%">
        <Box flex={1}></Box>
        <Box w="100%" maxW={maxW} minH="100%">
          <Header
            {...{
              conf: { tab, setTab },
              type: "editor",
              user,
              setUser,
              setEditUser,
              identity,
              setIdentity,
              setEditStatus,
            }}
          />

          {isNil(user) ? (
            <Flex
              justify="center"
              align="center"
              w="100%"
              h="calc(100vh - 47px)"
            >
              Sign In to Edit
            </Flex>
          ) : (
            <>
              <Flex justify="center">
                <Box
                  display={tab === "edit" ? "flex" : "none"}
                  className="markdown-body"
                >
                  <App {...{ setHTML }} />
                </Box>
                <Box
                  maxW={maxW}
                  w="100%"
                  display={tab === "preview" ? "flex" : "none"}
                  px={[2, 4, 6]}
                  className="markdown-body"
                >
                  <Article
                    {...{
                      preview: true,
                      post: {
                        description: body,
                        body: HTML,
                        cover: coverIcon,
                        title,
                      },
                      puser: user,
                    }}
                  />
                </Box>

                <Box
                  maxW={maxW}
                  w="100%"
                  display={tab === "post" ? "flex" : "none"}
                  p={4}
                >
                  <Box display={["none", null, null, "block"]} w="58px" />
                  <Box flex={1}>
                    <Box fontSize="12px" mb={1}>
                      Title ( 100 characters )
                    </Box>
                    <Box>
                      <Input
                        placeholder="title"
                        value={title}
                        onChange={e => {
                          if (e.target.value.length <= 50)
                            setTitle(e.target.value)
                        }}
                      />
                    </Box>
                    <Box fontSize="12px" mx={1} mt={3} mb={1}>
                      Description ( 280 characters )
                    </Box>
                    <Box>
                      <Textarea
                        placeholder="description"
                        value={body}
                        onChange={e => {
                          if (e.target.value.length < 280)
                            setBody(e.target.value)
                        }}
                      />
                    </Box>
                    <Flex align="center" mt={3}>
                      <Box flex={1}>
                        <Box fontSize="12px" mx={1} mb={1}>
                          Cover Image
                        </Box>
                        <Box>
                          <Input
                            p={1}
                            accept=".jpg,.png,.jpeg"
                            type="file"
                            onChange={async e => {
                              if (!isNil(e.target.files[0])) {
                                const {
                                  readAndCompressImage,
                                } = require("browser-image-resizer")
                                const file = await readAndCompressImage(
                                  e.target.files[0],
                                  {
                                    maxWidth: 800,
                                    maxHeight: 800,
                                    mimeType: e.target.files[0].type,
                                  }
                                )
                                let reader = new FileReader()
                                reader.readAsDataURL(file)
                                reader.onload = () =>
                                  setCoverIcon(reader.result)
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Flex>
                    <Box px={10}>
                      <Image mt={4} src={coverIcon} width="100%" />
                    </Box>
                    <Box mt={4}>
                      <Flex
                        bg={ok ? "#333" : "#ccc"}
                        color="white"
                        w="100%"
                        justify="center"
                        p={2}
                        sx={{
                          borderRadius: "5px",
                          cursor: ok ? "pointer" : "default",
                          ":hover": { opacity: ok ? 0.75 : 1 },
                        }}
                        align="center"
                        onClick={async () => {
                          if (ok) {
                            try {
                              setUpdating(true)
                              const { err, post } = await postArticle({
                                description: body,
                                title,
                                address: identity.signer,
                                user,
                                body: JSON.stringify({
                                  type: "html",
                                  content: HTML,
                                }),
                                cover: coverIcon,
                              })
                              if (isNil(err)) {
                                await lf.removeItem("edit")
                                router.push(`/s/${post.id}`)
                              }
                            } catch (e) {
                              setUpdating(false)
                            }
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
                        Publish
                      </Flex>
                    </Box>
                  </Box>
                  <Box display={["none", null, null, "block"]} w="58px" />
                </Box>
              </Flex>
            </>
          )}
        </Box>
        <Box flex={1}></Box>
      </Flex>
      <EditUser {...{ setEditUser, editUser, identity, setUser, user }} />
    </ChakraProvider>
  )
}
