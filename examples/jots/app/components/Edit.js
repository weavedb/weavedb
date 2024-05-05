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
import Header from "./Header"
import Alpha from "./Alpha"
import EditUser from "./EditUser"
import EditStatus from "./EditStatus"
import { postArticle, postStatus, checkUser, initDB } from "../lib/db"
import dynamic from "next/dynamic"
import lf from "localforage"
import Article from "./Article"
import GithubMarkdown from "../lib/GithubMarkdown"
const App = dynamic(() => import("./App"), { ssr: false })

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
  const [editID, setEditID] = useState(null)
  const [editContent, setEditContent] = useState(null)
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
  useEffect(() => {
    ;(async () => {
      if (!isNil(router.query.id)) {
        setEditID(router.query.id)
        const db = await initDB()
        let post = await db.cget("posts", router.query.id)
        if (!isNil(post)) {
          if (!isNil(post.data.body)) {
            try {
              const json = await fetch(post.data.body, { mode: "cors" }).then(
                v => v.json()
              )
              setTitle(
                (await lf.getItem(`edit-title-${editID ?? "new"}`)) ??
                  post.data.title ??
                  ""
              )
              setBody(
                (await lf.getItem(`edit-body-${editID ?? "new"}`)) ??
                  post.data.description ??
                  ""
              )
              setEditContent(json)
            } catch (e) {}
          }
        }
      }
    })()
  }, [router, user])
  const ok =
    !updating &&
    body?.length > 0 &&
    body?.length <= 280 &&
    title.length > 0 &&
    title.length <= 100
  const maxW = "760px"

  return (
    <ChakraProvider>
      <Header
        {...{
          wide: true,
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
      {isNil(user?.handle) && process.env.NEXT_PUBLIC_MODE === "closed" ? (
        <Alpha />
      ) : (
        <>
          <GithubMarkdown />
          <Flex justify="center" minH="100%" pt="50px">
            <Box flex={1}></Box>
            <Box w="100%" maxW={maxW} minH="100%">
              {isNil(user) ? (
                <Flex
                  justify="center"
                  align="center"
                  w="100%"
                  h="calc(100vh - 50px)"
                >
                  Sign In to Edit
                </Flex>
              ) : !isNil(editID) && isNil(editContent) ? (
                <Flex
                  justify="center"
                  align="center"
                  w="100%"
                  h="calc(100vh - 50px)"
                >
                  Article Not Found
                </Flex>
              ) : (
                <>
                  <Flex justify="center" w="100%">
                    <Box
                      w="100%"
                      display={tab === "edit" ? "flex" : "none"}
                      className="markdown-body"
                    >
                      <App
                        {...{
                          setHTML,
                          editID,
                          editContent,
                          setTitle,
                          setBody,
                          title,
                          body,
                        }}
                      />
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
                          disabled: true,
                          main: true,
                          preview: true,
                          post: {
                            description: body,
                            content: HTML,
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
                            onChange={async e => {
                              if (e.target.value.length <= 50) {
                                setTitle(e.target.value)
                                await lf.setItem(
                                  `edit-title-${editID ?? "new"}`,
                                  e.target.value
                                )
                              }
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
                            onChange={async e => {
                              if (e.target.value.length < 280) {
                                setBody(e.target.value)
                                await lf.setItem(
                                  `edit-body-${editID ?? "new"}`,
                                  e.target.value
                                )
                              }
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
                                    body: HTML,
                                    cover: coverIcon,
                                    editID,
                                  })
                                  if (isNil(err)) {
                                    await lf.removeItem(
                                      `edit-${editID ?? "new"}`
                                    )
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
                            {!isNil(editID) ? "Update" : "Publish"}
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
        </>
      )}
      <EditUser {...{ setEditUser, editUser, identity, setUser, user }} />
    </ChakraProvider>
  )
}
