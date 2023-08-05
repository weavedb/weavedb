import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Box, Flex, ChakraProvider, Image } from "@chakra-ui/react"
import Link from "next/link"
import {
  reject,
  isEmpty,
  path,
  last,
  concat,
  prepend,
  mergeLeft,
  keys,
  indexBy,
  prop,
  compose,
  isNil,
  map,
  includes,
  pluck,
  filter,
  propEq,
  values,
  difference,
  __,
  uniq,
  mergeRight,
} from "ramda"
import Tweet from "../../components/Tweet"
import Header from "../../components/Header"
import SDK from "weavedb-client"
import { followUser, initDB, checkUser } from "../../lib/db"
import EditUser from "../../components/EditUser"
import EditStatus from "../../components/EditStatus"
const limit = 10

function StatusPage() {
  const router = useRouter()
  const [puser, setPuser] = useState(null)
  const [user, setUser] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [users, setUsers] = useState({})
  const [tab, setTab] = useState("posts")
  const [posts, setPosts] = useState([])
  const [replies, setReplies] = useState([])
  const [tweets, setTweets] = useState({})
  const [plikes, setPLikes] = useState([])
  const [likes, setLikes] = useState({})
  const [reposts, setReposts] = useState({})
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [isNext, setIsNext] = useState(false)
  const [isNextReplies, setIsNextReplies] = useState(false)
  const [isNextLikes, setIsNextLikes] = useState(false)
  const [isNextFollowers, setIsNextFollowers] = useState(false)
  const [isNextFollowing, setIsNextFollowing] = useState(false)

  const getUsers = async __users => {
    const db = await initDB()
    const _users = compose(difference(__, keys(users)), uniq)(__users)
    if (_users.length > 0) {
      setUsers(
        compose(
          mergeRight(users),
          indexBy(prop("address"))
        )(await db.get("users", ["address", "in", _users]))
      )
    }
  }
  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        await getUsers(compose(pluck("owner"), values)(tweets))
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
        await getUsers(compose(pluck("owner"), values)(tweets))
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
    if (!isNil(router.query.id)) {
      ;(async () => {
        const db = await initDB()
        const user = (
          await db.get("users", ["handle", "==", router.query.id])
        )[0]
        if (!isNil(user)) {
          setPuser(user)
          const _posts = await db.cget(
            "posts",
            ["owner", "==", user.address],
            ["reply_to", "==", ""],
            ["date", "desc"],
            limit
          )
          setPosts(_posts)
          setIsNext(_posts.length >= limit)
          const _replies = await db.cget(
            "posts",
            ["owner", "==", user.address],
            ["reply_to", "!=", ""],
            ["date", "desc"],
            limit
          )
          setReplies(_replies)
          setIsNextReplies(_replies.length >= limit)

          const _plikes = await db.cget(
            "likes",
            ["user", "==", user.address],
            ["date", "desc"],
            limit
          )
          setPLikes(_plikes)
          setIsNextLikes(_plikes.length >= limit)

          const _following = await db.cget(
            "follows",
            ["from", "==", user.address],
            ["date", "desc"],
            limit
          )
          setFollowing(_following)
          setIsNextFollowing(_following.length >= limit)

          const _followers = await db.cget(
            "follows",
            ["to", "==", user.address],
            ["date", "desc"],
            limit
          )
          setFollowers(_followers)
          setIsNextFollowers(_followers.length >= limit)
        }
      })()
    }
  }, [router])

  const getTweets = async ids => {
    const db = await initDB()
    const _ids = compose(difference(__, keys(tweets)), uniq)(ids)
    if (!isEmpty(_ids)) {
      const _tweets = indexBy(prop("id"))(
        await db.cget("posts", ["id", "in", _ids])
      )
      setTweets(mergeLeft(_tweets, tweets))
    }
  }

  useEffect(() => {
    ;(async () => {
      await getTweets(
        compose(
          uniq,
          reject(isEmpty),
          map(path(["data", "reply_to"]))
        )(values(tweets))
      )
      await getUsers(map(path(["data", "owner"]))(values(tweets)))
    })()
  }, [tweets])

  useEffect(() => {
    ;(async () => {
      await getUsers(map(path(["data", "address"]))(values(following)))
    })()
  }, [following])

  useEffect(() => {
    ;(async () => {
      await getUsers(map(path(["data", "address"]))(values(followers)))
    })()
  }, [followers])

  useEffect(() => {
    ;(async () => {
      let _tweets = indexBy(prop("id"))(posts)
      setTweets(mergeLeft(_tweets, tweets))
      await getTweets(
        compose(reject(isEmpty), map(path(["data", "repost"])))(values(posts))
      )
    })()
  }, [posts])

  useEffect(() => {
    ;(async () => {
      await getTweets(map(path(["data", "aid"]))(plikes))
    })()
  }, [plikes])

  useEffect(() => {
    ;(async () => {
      let _tweets = indexBy(prop("id"))(replies)
      setTweets(mergeLeft(_tweets, tweets))
    })()
  }, [replies])

  useEffect(() => {
    ;(async () => {
      const { user, identity } = await checkUser()
      setUser(user)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!isNil(user) && !isNil(puser)) {
        const db = await initDB()
        setIsFollowing(
          (
            await db.get(
              "follows",
              ["from", "==", user.address],
              ["to", "==", puser.address]
            )
          ).length > 0
        )
        setIsFollowed(
          (
            await db.get(
              "follows",
              ["to", "==", user.address],
              ["from", "==", puser.address]
            )
          ).length > 0
        )
      }
    })()
  }, [user, puser])
  const _user = puser
  const tabs = [
    { key: "posts", name: "Posts" },
    { key: "replies", name: "Replies" },
    { key: "likes", name: "Likes" },
  ]

  const tabs2 = [
    { key: "following", name: "Following" },
    { key: "followers", name: "Followers" },
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
      {isNil(puser) ? null : (
        <Flex justify="center" minH="100%">
          <Box flex={1}></Box>
          <Box
            w="100%"
            maxW="760px"
            minH="100%"
            sx={{ borderX: "1px solid #ccc" }}
          >
            <Header
              link={includes(tab, ["following", "followers"]) ? null : "/"}
              title={
                includes(tab, ["following", "followers"]) ? _user?.name : "Home"
              }
              func={
                includes(tab, ["following", "followers"])
                  ? () => setTab("posts")
                  : null
              }
              {...{
                user,
                setUser,
                setEditUser,
                setIdentity,
                identity,
                setEditStatus,
              }}
            />
            {includes(tab, ["following", "followers"]) ? null : (
              <>
                <Box
                  title={_user.cover}
                  sx={{
                    backgroundImage:
                      _user.cover ??
                      `https://picsum.photos/800/200?id=${Date.now()}`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    zIndex: 100,
                  }}
                  h="190px"
                  w="100%"
                />
                <Box sx={{ zIndex: 100 }}>
                  <Flex>
                    <Image
                      ml="20px"
                      boxSize="150px"
                      src={_user.image ?? "/images/default-icon.png"}
                      mt="-75px"
                      sx={{
                        borderRadius: "50%",
                      }}
                    />
                    <Box flex={1} />
                    <Box m={4}>
                      {puser.handle === user?.handle ? (
                        <Flex
                          onClick={() => setEditUser(true)}
                          px={8}
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
                        >
                          Edit Profile
                        </Flex>
                      ) : puser.handle !== user?.handle && !isNil(user) ? (
                        <Flex
                          onClick={() => setEditUser(true)}
                          px={8}
                          py={2}
                          bg="#333"
                          color="white"
                          height="auto"
                          align="center"
                          sx={{
                            borderRadius: "20px",
                            cursor: isFollowing ? "default" : "pointer",
                            ":hover": { opacity: isFollowing ? 1 : 0.75 },
                          }}
                          onClick={async () => {
                            if (!isFollowing) {
                              const { follow } = await followUser({
                                user,
                                puser,
                              })
                              setIsFollowing(true)
                              setPuser(
                                mergeLeft(
                                  { followers: puser.followers + 1 },
                                  puser
                                )
                              )
                              setFollowers(prepend(follow, followers))
                            }
                          }}
                        >
                          {isFollowing
                            ? "Following"
                            : isFollowed
                            ? "Follow Back"
                            : "Follow"}
                        </Flex>
                      ) : null}
                    </Box>
                  </Flex>
                  <Box mx="30px" mt={4} fontSize="20px" fontWeight="bold">
                    {_user.name}
                  </Box>
                  <Box mx="30px" mb={2} fontSize="15px" color="#666">
                    @{_user.handle}
                  </Box>
                  <Box mx="30px" mb={2} fontSize="15px">
                    {_user.description}
                  </Box>
                  <Flex mx="30px" mb={2} fontSize="15px">
                    <Box
                      mr={4}
                      onClick={() => setTab("following")}
                      sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                    >
                      <Box as="b" mr={1}>
                        {_user.following || 0}
                      </Box>
                      Following
                    </Box>
                    <Box
                      mr={4}
                      onClick={() => setTab("followers")}
                      sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                    >
                      <Box as="b" mr={1}>
                        {_user.followers || 0}
                      </Box>
                      Followers
                    </Box>
                  </Flex>
                </Box>
              </>
            )}
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
              })(includes(tab, ["following", "followers"]) ? tabs2 : tabs)}
            </Flex>
            {includes(tab, ["following", "followers"]) ? (
              <>
                {map(v => {
                  const u = users[v]
                  return isNil(u) ? null : (
                    <Link
                      href={`/u/${u.handle}`}
                      onClick={() => setTab("posts")}
                    >
                      <Box
                        p={2}
                        sx={{
                          borderBottom: "1px solid #ccc",
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                      >
                        <Flex align="center">
                          <Image
                            m={2}
                            src={u.image ?? "/images/default-icon.png"}
                            boxSize="50px"
                            sx={{ borderRadius: "50%" }}
                          />
                          <Box>
                            <Box>
                              <Box fontWeight="bold">{u.name}</Box>
                              <Box color="#666">@{u.handle}</Box>
                            </Box>
                            <Box fontSize="15px">{u.description}</Box>
                          </Box>
                        </Flex>
                      </Box>
                    </Link>
                  )
                })(
                  tab === "following"
                    ? map(path(["data", "to"]))(following)
                    : map(path(["data", "from"]))(followers)
                )}
                {tab !== "following" || !isNextFollowing ? null : (
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
                        const _following = await db.cget(
                          "follows",
                          ["from", "==", puser.address],
                          ["date", "desc"],
                          ["startAfter", last(following)],
                          limit
                        )
                        setFollowing(concat(following, _following))
                        setIsNextFollowing(_following.length >= limit)
                      }}
                    >
                      Load More
                    </Flex>
                  </Flex>
                )}
                {tab !== "followers" || !isNextFollowers ? null : (
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
                        const _followers = await db.cget(
                          "follows",
                          ["from", "==", puser.address],
                          ["date", "desc"],
                          ["startAfter", last(followers)],
                          limit
                        )
                        setFollowers(concat(followers, _followers))
                        setIsNextFollowers(_followers.length >= limit)
                      }}
                    >
                      Load More
                    </Flex>
                  </Flex>
                )}
              </>
            ) : tab === "likes" ? (
              <>
                {map(v2 => {
                  const v = tweets[v2.data.aid] ?? { data: {} }
                  return (
                    <Tweet
                      {...{
                        likes,
                        reposted: reposts[v.data.id],
                        users,
                        tweets,
                        tweet: {
                          cover: v.data.cover,
                          id: v.data.id,
                          date: v.data.date,
                          title: v.data.title,
                          user: v.data.owner,
                          reposts: v.data.reposts,
                          likes: v.data.likes,
                          comments: v.data.comments,
                          reply_to: v.data.reply_to,
                          body: v.data.description,
                        },
                        repost:
                          tab === "posts" && v.data.owner !== puser?.address
                            ? v.data.owner
                            : null,
                        reply: v.data.reply_to !== "",
                      }}
                    />
                  )
                })(plikes)}
                {!isNextLikes ? null : (
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
                        const _plikes = await db.cget(
                          "likes",
                          ["user", "==", puser.address],
                          ["date", "desc"],
                          ["startAfter", last(plikes)],
                          limit
                        )
                        setPLikes(concat(plikes, _plikes))
                        setIsNextLikes(_plikes.length >= limit)
                      }}
                    >
                      Load More
                    </Flex>
                  </Flex>
                )}
              </>
            ) : tab === "posts" || tab === "replies" ? (
              <>
                {map(v2 => {
                  const v =
                    v2.data.repost === ""
                      ? v2
                      : tweets[v2.data.repost] ?? { data: {} }
                  return (
                    <Tweet
                      {...{
                        likes,
                        reposted: reposts[v.data.id],
                        users,
                        tweets,
                        tweet: {
                          cover: v.data.cover,
                          id: v.data.id,
                          date: v.data.date,
                          title: v.data.title,
                          user: v.data.owner,
                          reposts: v.data.reposts,
                          likes: v.data.likes,
                          comments: v.data.comments,
                          reply_to: v.data.reply_to,
                          body: v.data.description,
                        },
                        repost:
                          tab === "posts" && v2.data.repost !== ""
                            ? puser.address
                            : null,
                        reply: tab === "replies" || v.data.reply_to !== "",
                      }}
                    />
                  )
                })(tab === "posts" ? posts : replies)}
                {tab !== "posts" || !isNext ? null : (
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
                          ["owner", "==", puser.address],
                          ["reply_to", "==", ""],
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
                {tab !== "replies" || !isNextReplies ? null : (
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
                        const _replies = await db.cget(
                          "posts",
                          ["owner", "==", puser.address],
                          ["reply_to", "!=", ""],
                          ["date", "desc"],
                          ["startAfter", last(replies)],
                          limit
                        )
                        setReplies(concat(replies, _replies))
                        setIsNextReplies(_replies.length >= limit)
                      }}
                    >
                      Load More
                    </Flex>
                  </Flex>
                )}
              </>
            ) : null}
          </Box>
          <Box flex={1}></Box>
        </Flex>
      )}
      <EditUser
        {...{ setEditUser, editUser, identity, setUser, user, setPuser }}
      />
    </ChakraProvider>
  )
}

export default StatusPage
