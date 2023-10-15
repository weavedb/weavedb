import { useState, useEffect } from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import {
  Input,
  Textarea,
  Box,
  Flex,
  ChakraProvider,
  Image,
} from "@chakra-ui/react"
import Link from "next/link"
import {
  filter,
  reverse,
  sortBy,
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
  isEmpty,
  pluck,
  last,
  mergeLeft,
} from "ramda"
import Tweet from "../components/Tweet"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Alpha from "../components/Alpha"
import SDK from "weavedb-client"
import EditUser from "../components/EditUser"
import EditStatus from "../components/EditStatus"
import EditPost from "../components/EditPost"
import { checkUser, initDB, initNDB, getUsers, getTweets } from "../lib/db"
const limit = 10
import Embed from "../components/Embed"
function Page() {
  const [notes, setNotes] = useState([])
  const [noteIDs, setNoteIDs] = useState({})
  const [notifications, setNotifications] = useState([])
  const [posts, setPosts] = useState([])
  const [isNextNote, setIsNextNote] = useState(false)
  const [isNext, setIsNext] = useState(false)
  const [isNextTL, setIsNextTL] = useState(false)
  const [users, setUsers] = useState({})
  const [user, setUser] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [editPost, setEditPost] = useState(false)
  const [tab, setTab] = useState("all")
  const [timeline, setTimeline] = useState([])
  const [reposts, setReposts] = useState({})
  const [tweets, setTweets] = useState({})
  const [likes, setLikes] = useState({})

  useEffect(() => {
    ;(async () => {
      let nmap = {}
      let users = []
      let _tweets = []
      let _noteIDs = {}
      for (let v of notes) {
        let extra = {}
        if (noteIDs[v.data.wid]) continue
        _noteIDs[v.data.wid] = true
        let id = null
        switch (v.data.type) {
          case "mention":
            id = `mention:${v.data.aid}`
            _tweets.push(v.data.aid)
            extra.type = "mention"
            extra.aid = v.data.aid
            break
          case "like":
            id = `like:${v.data.aid}`
            _tweets.push(v.data.aid)
            extra.type = "like"
            extra.aid = v.data.aid
            break
          case "reply":
            id = `reply:${v.data.aid}:${v.data.from}`
            _tweets.push(v.data.aid)
            _tweets.push(v.data.rid)
            extra.type = "reply"
            extra.aid = v.data.aid
            extra.rid = v.data.rid
            break
          case "follow":
            id = `follow`
            extra.type = "follow"
            break
          case "repost":
            id = `repost:${v.data.aid}`
            _tweets.push(v.data.aid)
            extra.type = "repost"
            extra.aid = v.data.aid
            break
          case "quote":
            id = `quote:${v.data.aid}:${v.data.id}`
            _tweets.push(v.data.aid)
            _tweets.push(v.data.rid)
            extra.type = "quote"
            extra.aid = v.data.aid
            extra.rid = v.data.rid
            break
        }
        nmap[id] ??= { ...extra, count: 0, date: 0, users: [], viewed: true }
        nmap[id].count++
        if (!v.data.viewed) nmap[id].viewed = false
        if (nmap[id].date < v.data.date) nmap[id].date = v.data.date
        nmap[id].users.push(v.data.from)
        nmap[id].users = uniq(nmap[id].users)
        users.push(v.data.from)
      }
      const __tweets = await getTweets({
        ids: uniq(_tweets),
        tweets,
        setTweets,
      })
      users = users.concat(users, pluck("owner", values(__tweets)))
      await getUsers({ ids: uniq(users), users, setUsers })
      setNoteIDs(mergeLeft(_noteIDs, noteIDs))
      setNotifications(
        concat(
          notifications,
          compose(reverse, sortBy(prop("date")), values)(nmap)
        )
      )
    })()
  }, [notes])

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        const db = await initNDB()
        const notes = await db.cget(
          "notifications",
          ["to", "==", user.address],
          ["date", "desc"],
          limit
        )
        setNotes(notes)
        setIsNextNote(notes.length >= limit)
        const batches = compose(
          map(v => ["update", { viewed: true }, "notifications", v.id]),
          filter(v => !v.data.viewed)
        )(notes)
        if (batches.length > 0) await db.batch(batches, identity)
      } else {
        setNotes([])
        setNotifications([])
        setNoteIDs({})
        setIsNextNote(false)
      }
    })()
  }, [user])

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
    })()
  }, [])

  const tabs = [
    { key: "all", name: "All Posts" },
    { key: "following", name: "Following" },
  ]
  return (
    <ChakraProvider>
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
          color: #333;
        }
      `}</style>
      <Header
        {...{
          setEditPost,
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
          <Flex justify="center" minH="100%" pt="50px" pb={["50px", 0]}>
            <Box flex={1}></Box>
            <Box
              w="100%"
              maxW="760px"
              minH="100%"
              sx={{ borderX: "1px solid #ccc" }}
            >
              {isNil(user) || true ? null : (
                <Flex sx={{ borderBottom: "1px solid #ccc" }} mt={3}>
                  {map(v => {
                    return (
                      <Flex
                        onClick={() => setTab(v.key)}
                        justify="center"
                        flex={1}
                        mx={8}
                        pb={2}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                          borderBottom: tab === v.key ? "3px solid #666" : "",
                        }}
                      >
                        {v.name}
                      </Flex>
                    )
                  })(tabs)}
                </Flex>
              )}
              {isNil(user) ? (
                <Flex
                  justify="center"
                  align="center"
                  w="100%"
                  h="calc(100vh - 47px)"
                >
                  Sign In to View Your Notifications
                </Flex>
              ) : (
                <>
                  {map(v2 => {
                    const user1 = users[v2.users[0]] ?? {}
                    const user2 = users[v2.users[1]] ?? {}
                    const icon =
                      v2.type === "like"
                        ? "fas fa-heart"
                        : v2.type === "repost" || v2.type === "quote"
                        ? "fas fa-retweet"
                        : v2.type === "follow"
                        ? "fas fa-user"
                        : v2.type === "reply"
                        ? "far fa-comment"
                        : "fas fa-at"
                    const icolor =
                      v2.type === "like"
                        ? "#F91880"
                        : v2.type === "repost" || v2.type === "quote"
                        ? "#00BA7C"
                        : v2.type === "follow"
                        ? "#1D9BF0"
                        : "#333"
                    const post = isNil(v2.aid) ? null : tweets[v2.aid] ?? {}
                    const reply = isNil(v2.rid) ? null : tweets[v2.rid] ?? {}
                    let link =
                      v2.type === "like"
                        ? `/s/${post.id}`
                        : v2.type === "quote"
                        ? `/s/${reply.id}`
                        : v2.type === "repost"
                        ? `/s/${post.id}`
                        : v2.type === "follow"
                        ? `/u/${user1?.handle ?? ""}`
                        : `/s/${post.id}`
                    return (
                      <Link href={link}>
                        <Flex
                          sx={{
                            bg: v2.viewed ? "white" : "whitesmoke",
                            borderBottom: "1px solid #ccc",
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                          p={3}
                        >
                          <Flex
                            w="50px"
                            fontSize="22px"
                            justify="center"
                            mt={1}
                            mr={3}
                          >
                            <Box as="i" color={icolor} className={icon} />
                          </Flex>

                          <Box flex={1}>
                            <Flex mb={2}>
                              {map(u => {
                                const user = users[u] ?? {}
                                return (
                                  <Link href={`/u/${user.handle}`}>
                                    <Image
                                      title={user.name}
                                      mr={2}
                                      src={
                                        user?.image ??
                                        "/images/default-icon.png"
                                      }
                                      boxSize="30px"
                                      sx={{ borderRadius: "50%" }}
                                    />
                                  </Link>
                                )
                              })(v2.users)}
                            </Flex>
                            <Flex align="center">
                              <Box>
                                {v2.users.length === 1 ? (
                                  <Link href={`/u/${user1.handle}`}>
                                    <b>{user1.name}</b>
                                  </Link>
                                ) : v2.users.length === 2 ? (
                                  <>
                                    <Link href={`/u/${user1.handle}`}>
                                      <b>{user1.name}</b>
                                    </Link>{" "}
                                    and{" "}
                                    <Link href={`/u/${user2.handle}`}>
                                      <b>{user2.name}</b>
                                    </Link>
                                  </>
                                ) : (
                                  <>
                                    <Link href={`/u/${user1.handle}`}>
                                      <b>{user1.name}</b>
                                    </Link>{" "}
                                    and{" "}
                                    <Link href={`/u/${user2.handle}`}>
                                      <b>{v2.users.length - 1}</b>
                                    </Link>{" "}
                                    others
                                  </>
                                )}
                                <span>
                                  {" "}
                                  {v2.type === "like" ? (
                                    <>
                                      liked{" "}
                                      {!isNil(post.title) ? (
                                        <Link href={`/s/${post.id}`}>
                                          <b>{post.title}</b>
                                        </Link>
                                      ) : (
                                        "your post"
                                      )}
                                    </>
                                  ) : v2.type === "repost" ? (
                                    <>
                                      reposted{" "}
                                      {!isNil(post.title) ? (
                                        <Link href={`/s/${post.id}`}>
                                          <b>{post.title}</b>
                                        </Link>
                                      ) : (
                                        "your post"
                                      )}
                                    </>
                                  ) : v2.type === "quote" ? (
                                    <>
                                      quoted{" "}
                                      {!isNil(post.title) ? (
                                        <Link href={`/s/${post.id}`}>
                                          <b>{post.title}</b>
                                        </Link>
                                      ) : (
                                        "your post"
                                      )}
                                    </>
                                  ) : v2.type === "follow" ? (
                                    "followed you"
                                  ) : v2.type === "reply" ? (
                                    <>
                                      replied to{" "}
                                      {!isNil(post.title) ? (
                                        <Link href={`/s/${post.id}`}>
                                          <b>{post.title}</b>
                                        </Link>
                                      ) : (
                                        "your post"
                                      )}
                                    </>
                                  ) : (
                                    <>mentioned you in a post</>
                                  )}
                                </span>
                              </Box>
                              <Box fontSize="12px" ml={1}>
                                <Box as="span" mx={1}>
                                  ·
                                </Box>
                                <Box as="span" color="#666">
                                  {dayjs(v2.date).fromNow(true)}
                                </Box>
                              </Box>
                            </Flex>
                            {v2.type === "follow" ? null : (
                              <Box
                                fontSize="14px"
                                mt={!isNil(reply) || !isNil(post) ? 2 : 0}
                              >
                                {v2.type === "repost" ||
                                v2.type === "like" ||
                                v2.type === "mention"
                                  ? post?.description ?? ""
                                  : v2.type === "reply" || v2.type === "quote"
                                  ? reply?.description ?? ""
                                  : null}
                              </Box>
                            )}
                            {v2.type === "quote" && !isNil(reply.cover) ? (
                              <Flex p={4} justify="center">
                                <Link target="_blank" href={reply.cover}>
                                  <Image
                                    onClick={e => e.stopPropagation()}
                                    src={reply.cover}
                                    maxW="500px"
                                    maxH="500px"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": { opacity: 0.75 },
                                    }}
                                  />
                                </Link>
                              </Flex>
                            ) : null}
                            {v2.type !== "quote" ? null : (
                              <Link href={`/s/${post.id}`}>
                                <Box
                                  my={3}
                                  sx={{
                                    ":hover": { opacity: 0.75 },
                                    border: "1px solid #ccc",
                                    borderRadius: "10px",
                                  }}
                                >
                                  <Embed
                                    {...{
                                      tweets,
                                      parent: true,
                                      tweet: post,
                                      users,
                                    }}
                                  />
                                </Box>
                              </Link>
                            )}
                          </Box>
                          <Box w="50px" />
                        </Flex>
                      </Link>
                    )
                  })(notifications)}
                  {!isNextNote ? null : (
                    <Flex p={4} justify="center">
                      <Flex
                        justify="center"
                        w="300px"
                        py={2}
                        bg="#333"
                        color="white"
                        height="auto"
                        align="center"
                        sx={{
                          borderRadius: "20px",
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                        onClick={async () => {
                          const db = await initNDB()
                          const _notes = await db.cget(
                            "notifications",
                            ["to", "==", user.address],
                            ["date", "desc"],
                            ["startAfter", last(notes)],
                            limit
                          )
                          setNotes(concat(notes, _notes))
                          setIsNextNote(_notes.length >= limit)
                          const batches = compose(
                            map(v => [
                              "update",
                              { viewed: true },
                              "notifications",
                              v.id,
                            ]),
                            filter(v => !v.data.viewed)
                          )(_notes)
                          if (batches.length > 0)
                            await db.batch(batches, identity)
                        }}
                      >
                        Load More
                      </Flex>
                    </Flex>
                  )}
                </>
              )}
            </Box>
            <Box flex={1}></Box>
          </Flex>
          <EditPost
            {...{
              setEditStatus,
              setEditPost,
              editPost,
            }}
          />
          <EditStatus
            {...{
              setEditStatus,
              editStatus,
              user,
            }}
          />
        </>
      )}
      <EditUser {...{ setEditUser, editUser, identity, setUser, user }} />
      <Footer {...{ user, setEditPost }} />
    </ChakraProvider>
  )
}

export default Page
