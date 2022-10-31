import { useRouter } from "next/router"
import Head from "./Head"
import Footer from "./Footer"
import Header from "./Header"
import Link from "next/link"
import Autolinker from "autolinker"
import { useEffect, useState } from "react"
import moment from "moment"
import { inject } from "roidjs"
import { isNil, map, trim } from "ramda"

import { Image, Box, Flex, Input, Textarea } from "@chakra-ui/react"

import {
  deleteMessage,
  setupWeaveDB,
  getPosts,
  checkUser,
  setProfile,
  postMessage,
  getUser,
} from "/lib/main"

const App = inject(
  [
    "next",
    "temp_current",
    "temp_wallet",
    "initWDB",
    "signing_in",
    "posts",
    "user",
    "user_map",
  ],
  ({ $, set, fn }) => {
    const router = useRouter()
    const [editUserName, setEditUserName] = useState("")
    const [username, setUsername] = useState("")
    const [message, setMessage] = useState("")
    const [pageUser, setPageUser] = useState(null)
    const [postingUsername, setPostingUsername] = useState(false)
    const [postingMessage, setPostingMessage] = useState(false)
    const [deletingMessage, setDeletingMessage] = useState(null)
    const [checkRouter, setCheckRouter] = useState(false)

    useEffect(() => {
      ;(async () => {
        if (!isNil(router)) {
          set([], "posts")
          let sp = router.asPath.split("/")
          let id = null
          if (!isNil(sp[1]) && /^[0-9a-z_\-]{20,}\s*$/i.test(sp[1])) {
            id = trim(sp[1])
          }
          if (isNil(id)) {
            setCheckRouter(true)
          } else {
            if (!isNil($.user_map[id])) {
              setPageUser($.user_map[id])
            } else {
              setPageUser(await fn(getUser)({ uid: id }))
            }
            setCheckRouter(true)
          }
        }
      })()
    }, [router])

    useEffect(() => {
      if ($.initWDB && checkRouter) fn(getPosts)({ user: pageUser })
    }, [$.initWDB, pageUser, checkRouter])

    useEffect(() => {
      if ($.initWDB) {
        if (isNil($.temp_current)) {
          set(null, "user")
        } else {
          fn(checkUser)({ uid: $.temp_current })
        }
      }
    }, [$.temp_current, $.initWDB])

    const postable = !/^\s*$/.test(message) || message.length > 280

    return (
      <>
        <Head />
        <Header />
        <Flex
          justify="center"
          pt="60px"
          bg="#001626"
          color="white"
          minH={`calc(100vh - 100px)`}
        >
          <Box maxW="650px" p={4} width="100%">
            {isNil(pageUser) || isNil($.user_map[pageUser.address]) ? null : (
              <Flex mb={6} align="center">
                <Image
                  boxSize="50px"
                  src={$.user_map[pageUser.address].image}
                  sx={{ borderRadius: "100%" }}
                  mr={4}
                />
                <Box>
                  <Flex align="center">
                    <Box fontSize="20px" fontWeight="bold">
                      {pageUser.name}
                    </Box>
                    {!isNil($.temp_current) &&
                    $.temp_current.toLowerCase() ===
                      pageUser.address.toLowerCase() ? (
                      <Box
                        fontSize="12px"
                        onClick={() => {
                          if (!editUserName) {
                            setUsername(pageUser.name)
                            setEditUserName(true)
                          } else {
                            setEditUserName(false)
                          }
                        }}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                          textDecoration: "underline",
                        }}
                        ml={4}
                      >
                        {editUserName ? "Cancel" : "Edit"}
                      </Box>
                    ) : null}
                  </Flex>
                  <Box fontSize="14px">{pageUser.address.slice(0, 7)}</Box>
                </Box>
              </Flex>
            )}
            {isNil($.temp_current) ? null : isNil($.user) || editUserName ? (
              <Flex w="100%" mb={6}>
                <Input
                  bg="#eee"
                  color="#333"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  sx={{ borderRadius: "5px 0 0 5px" }}
                />
                <Flex
                  bg="#0090FF"
                  color="white"
                  w="200px"
                  px={3}
                  align="center"
                  justify="center"
                  sx={{
                    borderRadius: "0 5px 5px 0",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    if (!/^\s*$/.test(username) && !postingUsername) {
                      setPostingUsername(true)
                      const new_user = await fn(setProfile)({
                        username,
                        uid: $.temp_current,
                      })
                      if (!isNil(pageUser)) setPageUser(new_user)
                      setPostingUsername(false)
                    }
                  }}
                >
                  {postingUsername ? "Posting..." : "Set Username"}
                </Flex>
              </Flex>
            ) : isNil(pageUser) ||
              (!isNil($.temp_current) &&
                pageUser.address === $.temp_current.toLowerCase()) ? (
              <Flex direction="column" w="100%" mb={6}>
                {isNil($.user) ? null : (
                  <Box
                    justifyContent="center"
                    display={["flex", null, "none"]}
                    mb={4}
                  >
                    Welcome,
                    <Link href={`/${$.user.address}`}>
                      <Box
                        mx={2}
                        as="span"
                        sx={{
                          textDecoration: "underline",
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                      >
                        {$.user.name}
                      </Box>
                    </Link>
                    !
                  </Box>
                )}
                <Textarea
                  w="100%"
                  bg="#eee"
                  color="#333"
                  placeholder="Message (Max 280 letters)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  sx={{ borderRadius: "5px" }}
                />
                <Flex
                  bg={postable ? "#0090FF" : "#aaa"}
                  color="white"
                  w="100%"
                  px={3}
                  py={2}
                  align="center"
                  justify="center"
                  mt={2}
                  sx={{
                    borderRadius: "5px",
                    cursor: postable ? "pointer" : "default",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    if (postable && !postingMessage) {
                      setPostingMessage(true)
                      if (
                        await fn(postMessage)({ message, uid: $.temp_current })
                      ) {
                        setMessage("")
                      }
                      setPostingMessage(false)
                    }
                  }}
                >
                  {postingMessage ? (
                    "Posting..."
                  ) : (
                    <Box>Post [{message.length}]</Box>
                  )}
                </Flex>
              </Flex>
            ) : null}
            {map(v => {
              const __html = Autolinker.link(v.text, {
                sanitizeHtml: true,
                className: "autolink",
              }).replace(/\n/g, "<br />")
              return (
                <>
                  <style jsx global>{`
                    .autolink {
                      text-decoration: underline;
                    }
                    .autolink:hover {
                      opacity: 0.75;
                    }
                  `}</style>
                  <Box
                    fontSize="16px"
                    w="100%"
                    my={2}
                    bg="#002746"
                    color="#0090FF"
                    p={6}
                    sx={{ borderRadius: "5px" }}
                    dangerouslySetInnerHTML={{
                      __html,
                    }}
                  />
                  <Flex justify="center" mb={6} fontSize="12px">
                    <Link href={`/${v.user}`}>
                      <Flex
                        mx={2}
                        align="center"
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                      >
                        {isNil($.user_map[v.user]) ? (
                          v.user.slice(0, 7)
                        ) : (
                          <>
                            <Image
                              sx={{ borderRadius: "100%" }}
                              src={$.user_map[v.user].image}
                              boxSize="16px"
                              mr={1}
                            />
                            <Box>{$.user_map[v.user].name}</Box>
                          </>
                        )}
                      </Flex>
                    </Link>

                    <Box mx={2}>{moment(v.date * 1000).fromNow()}</Box>
                    {!isNil($.temp_current) &&
                    v.user.toLowerCase() === $.temp_current.toLowerCase() ? (
                      <Box
                        onClick={async () => {
                          if (confirm("Would you like to delete the post?")) {
                            setDeletingMessage(v.id)
                            await fn(deleteMessage)({ message: v })
                            setDeletingMessage(null)
                          }
                        }}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                          textDecoration:
                            deletingMessage === v.id ? "none" : "underline",
                        }}
                        mx={2}
                      >
                        {deletingMessage === v.id ? "Deleting..." : "Delete"}
                      </Box>
                    ) : null}
                  </Flex>
                </>
              )
            })($.posts || [])}
            {$.next ? (
              <Flex justify="center">
                <Flex
                  bg="#333"
                  color="white"
                  px={3}
                  py={2}
                  align="center"
                  justify="center"
                  mt={2}
                  width="200px"
                  sx={{
                    borderRadius: "30px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={async () => {
                    fn(getPosts)({ next: true, user: pageUser })
                  }}
                >
                  Load More Messages
                </Flex>
              </Flex>
            ) : null}
          </Box>
        </Flex>
        <Footer />
      </>
    )
  }
)

export default App
