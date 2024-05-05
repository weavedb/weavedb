import { useRouter } from "next/router"
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
import Tweet from "../../../components/Tweet"
import Header from "../../../components/Header"
import Footer from "../../../components/Footer"
import Alpha from "../../../components/Alpha"
import SDK from "weavedb-client"
import EditUser from "../../../components/EditUser"
import EditStatus from "../../../components/EditStatus"
import EditPost from "../../../components/EditPost"
import { checkUser, initDB, getTweets, getUsers } from "../../../lib/db"
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
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      if (!isNil(router?.query.id)) {
        const db = await initDB()
        const _posts = await db.cget(
          "posts",
          ["date", "desc"],
          ["repost", "==", router.query.id],
          ["quote", "==", true],
          limit
        )
        setPosts(_posts)
        setIsNext(_posts.length >= limit)
        setTweets(
          mergeLeft(compose(indexBy(path(["data", "id"])))(_posts), tweets)
        )
      }
    })()
  }, [router])
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
      let aids = []
      for (let v of pluck("data")(posts)) {
        aids.push(v.id)
        if (v.repost !== "") aids.push(v.repost)
      }
      aids = uniq(aids)
      if (aids.length > 0) await getTweets({ ids: aids, tweets, setTweets })
    })()
  }, [posts])
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
          title: "Quotes",
          link: `/s/${router.query.id}`,
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
        <Flex justify="center" minH="100%" pt="50px" pb={["50px", 0]}>
          <Box flex={1}></Box>
          <Box
            w="100%"
            maxW="760px"
            minH="100%"
            sx={{ borderX: "1px solid #ccc" }}
          >
            {posts.length === 0 ? (
              <Flex h="100px" justify="center" align="center">
                No Posts Found
              </Flex>
            ) : (
              <>
                {map(v2 => {
                  const v = tweets[v2.repost] ?? {}
                  let repost = v2.owner
                  let parent = v2
                  return (
                    <Tweet
                      likes={likes}
                      reposted={true}
                      {...{
                        isLink: true,
                        disabled: true,
                        parent,
                        users,
                        tweets,
                        tweet: v,
                        repost,
                        reply: tab === "replies" || v.reply_to !== "",
                      }}
                    />
                  )
                })(pluck("data", posts))}
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
                          ["date", "desc"],
                          ["repost", "==", router.query.id],
                          ["quote", "==", true],
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
      )}
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
      <EditUser {...{ setEditUser, editUser, identity, setUser, user }} />
      <Footer {...{ user, setEditPost }} />
    </ChakraProvider>
  )
}

export default Page
