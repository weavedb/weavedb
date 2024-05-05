import { useState, useEffect } from "react"
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
import Tweet from "../components/Tweet"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Alpha from "../components/Alpha"
import SDK from "weavedb-client"
import EditUser from "../components/EditUser"
import EditStatus from "../components/EditStatus"
import EditPost from "../components/EditPost"
import { checkUser, initDB, getTweets, getUsers } from "../lib/db"
const limit = 10
function Page() {
  const [posts, setPosts] = useState([])
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
      const db = await initDB()
      const _posts = await db.cget(
        "posts",
        ["type", "==", "article"],
        ["pt", "desc"],
        ["date", "desc"],
        limit
      )
      setPosts(_posts)
      setIsNext(_posts.length >= limit)
      setTweets(
        mergeLeft(compose(indexBy(path(["data", "id"])))(_posts), tweets)
      )
    })()
  }, [])

  useEffect(() => {
    ;(async () =>
      await getUsers({
        ids: map(path(["data", "owner"]))(posts),
        setUsers,
        users,
      }))()
  }, [posts])
  useEffect(() => {
    ;(async () => {
      await getUsers({
        ids: compose(pluck("owner"), values)(tweets),
        users,
        setUsers,
      })
      const db = await initDB()
    })()
  }, [tweets])

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        await getUsers({
          ids: compose(pluck("owner"), values)(tweets),
          users,
          setUsers,
        })
        const db = await initDB()
        const ids = difference(keys(tweets), keys(likes))
        if (ids.length > 0) {
          let new_likes = indexBy(prop("aid"))(
            await db.get(
              "likes",
              ["user", "==", user.address],
              ["aid", "in", ids]
            )
          )
          for (let v of ids) {
            if (isNil(new_likes[v])) new_likes[v] = null
          }
          setLikes(mergeLeft(new_likes, likes))
        }
      }
    })()
  }, [tweets, user])
  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        await getUsers({
          ids: compose(pluck("owner"), values)(tweets),
          users,
          setUsers,
        })
        const db = await initDB()
        const ids = difference(keys(tweets), keys(reposts))
        if (ids.length > 0) {
          let new_reposts = indexBy(prop("repost"))(
            await db.get(
              "posts",
              ["owner", "==", user.address],
              ["repost", "in", ids]
            )
          )
          for (let v of ids) {
            if (isNil(new_reposts[v])) new_reposts[v] = null
          }
          setReposts(mergeLeft(new_reposts, reposts))
        }
      }
    })()
  }, [tweets, user])
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

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        const db = await initDB()
        const _tl = await db.cget(
          "timeline",
          ["broadcast", "array-contains", user.address],
          ["date", "desc"],
          limit
        )
        setTimeline(_tl)
        setIsNextTL(_tl.length >= limit)
      }
    })()
  }, [user])

  useEffect(() => {
    ;(async () => {
      let aids = []
      for (let v of pluck("data")(timeline)) {
        aids.push(v.aid)
        if (v.rid !== "") aids.push(v.rid)
      }
      aids = uniq(aids)
      if (aids.length > 0) await getTweets({ ids: aids, tweets, setTweets })
    })()
  }, [timeline])

  const tabs = [
    { key: "all", name: "Trending" },
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
          title: "Home",
          user,
          setUser,
          setEditPost,
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
          {isNil(user) ? null : (
            <Flex
              bg="white"
              w="100%"
              justify="center"
              sx={{
                position: "fixed",
                top: "50px",
                left: 0,
              }}
            >
              <Flex
                fontSize="14px"
                w="100%"
                maxW="760px"
                align="center"
                pt={2}
                px={4}
                bg="white"
                sx={{
                  borderBottom: "1px solid #ccc",
                  borderX: "1px solid #ccc",
                }}
              >
                {map(v => {
                  return (
                    <Flex
                      onClick={e => {
                        e.stopPropagation()
                        setTab(v.key)
                      }}
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
            </Flex>
          )}

          <Flex
            justify="center"
            minH="100%"
            pt={isNil(user) ? "50px" : "91px"}
            pb={["50px", 0]}
          >
            <Box flex={1}></Box>
            <Box
              w="100%"
              maxW="760px"
              minH="100%"
              sx={{ borderX: "1px solid #ccc" }}
            >
              {tab === "following" ? (
                <>
                  {map(v2 => {
                    const v = tweets[v2.aid] ?? {}
                    let repost = null
                    let parent = null
                    if (v2.rid !== "") {
                      const rpost = tweets[v2.rid]
                      repost = rpost?.owner
                      if (
                        !isNil(rpost) &&
                        !isNil(rpost.description) &&
                        v2.rid !== v2.aid
                      ) {
                        parent = rpost
                      }
                    }
                    return (
                      <Tweet
                        disabled={true}
                        likes={likes}
                        reposted={!isNil(reposts[v.id])}
                        {...{
                          parent,
                          users,
                          tweets,
                          tweet: {
                            cover: v.cover,
                            id: v.id,
                            date: v.date,
                            title: v.title,
                            user: v.owner,
                            reposts: v.reposts,
                            likes: v.likes,
                            comments: v.comments,
                            reply_to: v.reply_to,
                            body: v.description,
                          },
                          repost,
                          reply: tab === "replies" || v.reply_to !== "",
                        }}
                      />
                    )
                  })(pluck("data", timeline))}
                  {!isNextTL ? null : (
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
                          const db = await initDB()
                          const _tl = await db.cget(
                            "timeline",
                            ["broadcast", "array-contains", user.address],
                            ["date", "desc"],
                            ["startAfter", last(timeline)],
                            limit
                          )
                          setTimeline(concat(timeline, _tl))
                          setIsNextTL(_tl.length >= limit)
                        }}
                      >
                        Load More
                      </Flex>
                    </Flex>
                  )}
                </>
              ) : (
                <>
                  {map(v => (
                    <Tweet
                      disabled={true}
                      reposted={!isNil(reposts[v.id])}
                      likes={likes}
                      users={users}
                      tweet={{
                        cover: v.cover,
                        id: v.id,
                        date: v.date,
                        title: v.title,
                        user: v.owner,
                        reposts: v.reposts,
                        likes: v.likes,
                        comments: v.comments,
                      }}
                      body={v.description}
                    />
                  ))(pluck("data", posts))}
                  {!isNext ? null : (
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
                          const db = await initDB()
                          const _posts = await db.cget(
                            "posts",
                            ["type", "==", "article"],
                            ["pt", "desc"],
                            ["date", "desc"],
                            ["startAfter", last(posts)],
                            limit
                          )
                          setPosts(concat(posts, _posts))
                          setIsNext(_posts.length >= limit)
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
