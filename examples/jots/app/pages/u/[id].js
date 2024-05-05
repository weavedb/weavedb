import lf from "localforage"
import * as linkify from "linkifyjs"
import linkifyHtml from "linkify-html"
import "linkify-plugin-hashtag"
import "linkify-plugin-mention"
import { isAddress } from "ethers"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Box, Input, Flex, ChakraProvider, Image } from "@chakra-ui/react"
import Link from "next/link"
import {
  append,
  pathEq,
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
import Footer from "../../components/Footer"
import Alpha from "../../components/Alpha"
import SDK from "weavedb-client"
import {
  followUser,
  unfollowUser,
  initDB,
  checkUser,
  getTweets,
  getUsers,
  inviteUser,
} from "../../lib/db"

import EditUser from "../../components/EditUser"
import EditStatus from "../../components/EditStatus"
import EditPost from "../../components/EditPost"
const limit = 10

function StatusPage() {
  const router = useRouter()
  const [addr, setAddr] = useState("")
  const [puser, setPuser] = useState(null)
  const [user, setUser] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [editPost, setEditPost] = useState(false)
  const [users, setUsers] = useState({})
  const [tab, setTab] = useState("posts")
  const [posts, setPosts] = useState([])
  const [articles, setArticles] = useState([])
  const [replies, setReplies] = useState([])
  const [tweets, setTweets] = useState({})
  const [plikes, setPLikes] = useState([])
  const [likes, setLikes] = useState({})
  const [reposts, setReposts] = useState({})
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [invites, setInvites] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [isNext, setIsNext] = useState(false)
  const [isNextArticles, setIsNextArticles] = useState(false)
  const [isNextReplies, setIsNextReplies] = useState(false)
  const [isNextLikes, setIsNextLikes] = useState(false)
  const [isNextFollowers, setIsNextFollowers] = useState(false)
  const [isNextFollowing, setIsNextFollowing] = useState(false)

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
        const ids2 = difference(keys(tweets), keys(reposts))
        if (ids2.length > 0) {
          let new_reposts = indexBy(prop("repost"))(
            await db.get(
              "posts",
              ["owner", "==", user.address],
              ["repost", "in", ids2]
            )
          )
          for (let v of ids2) {
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

          const _articles = await db.cget(
            "posts",
            ["owner", "==", user.address],
            ["type", "==", "article"],
            ["date", "desc"],
            limit
          )
          setArticles(_articles)
          setIsNextArticles(_articles.length >= limit)

          const _replies = await db.cget(
            "posts",
            ["owner", "==", user.address],
            ["reply", "==", true],
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

          const _invites = await db.cget("users", [
            "invited_by",
            "==",
            user.address,
          ])
          setInvites(_invites)
        }
      })()
    }
  }, [router])
  useEffect(() => {
    ;(async () => {
      await getTweets({
        ids: compose(
          uniq,
          reject(isEmpty),
          map(path(["reply_to"]))
        )(values(tweets)),
        tweets,
        setTweets,
      })
      await getUsers({
        ids: map(path(["owner"]))(values(tweets)),
        users,
        setUsers,
      })
    })()
  }, [tweets])

  useEffect(() => {
    ;(async () => {
      await getUsers({
        ids: map(path(["data", "to"]))(values(following)),
        users,
        setUsers,
      })
    })()
  }, [following])

  useEffect(() => {
    ;(async () => {
      await getUsers({
        ids: map(path(["data", "to"]))(values(invites)),
        users,
        setUsers,
      })
    })()
  }, [invites])

  useEffect(() => {
    ;(async () => {
      await getUsers({
        ids: map(path(["data", "from"]))(values(followers)),
        users,
        setUsers,
      })
    })()
  }, [followers])

  useEffect(() => {
    ;(async () => {
      let _tweets = indexBy(prop("id"))(pluck("data", posts))
      setTweets(mergeLeft(_tweets, tweets))
      await getTweets({
        ids: compose(
          reject(isEmpty),
          map(path(["data", "repost"]))
        )(values(posts)),
        setTweets,
        tweets,
      })
    })()
  }, [posts])

  useEffect(() => {
    ;(async () => {
      await getTweets({
        ids: map(path(["data", "aid"]))(plikes),
        setTweets,
        tweets,
      })
    })()
  }, [plikes])

  useEffect(() => {
    ;(async () => {
      let _tweets = indexBy(prop("id"))(pluck("data", replies))
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

  const tabs = [
    { key: "posts", name: "Posts" },
    { key: "articles", name: "Articles" },
    { key: "replies", name: "Replies" },
    { key: "likes", name: "Likes" },
  ]

  let tabs2 = [
    { key: "following", name: "Following" },
    { key: "followers", name: "Followers" },
  ]
  if ((puser?.invites ?? 0) > 0 && user?.address === puser?.address) {
    tabs2.push({ key: "invites", name: "Invites" })
  }
  const isFollow = includes(tab, ["following", "followers", "invites"])
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
        link={isFollow ? null : "/"}
        title={isFollow ? puser?.name : puser?.name}
        func={isFollow ? () => setTab("posts") : null}
        {...{
          setEditPost,
          user,
          setUser,
          setEditUser,
          setIdentity,
          identity,
          setEditStatus,
        }}
      />
      {isNil(user?.handle) && process.env.NEXT_PUBLIC_MODE === "closed" ? (
        <Alpha />
      ) : (
        <>
          {isFollow ? (
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
                })(tabs2)}
              </Flex>
            </Flex>
          ) : null}
          {isNil(puser) ? null : (
            <Flex
              justify="center"
              minH="100%"
              pt={isFollow ? "91px" : "50px"}
              pb={["50px", 0]}
            >
              <Box flex={1}></Box>
              <Box
                w="100%"
                maxW="760px"
                minH="100%"
                sx={{ borderX: "1px solid #ccc" }}
              >
                {isFollow ? null : (
                  <>
                    <Box
                      title={puser.cover}
                      sx={{
                        backgroundImage:
                          puser.cover ??
                          `https://picsum.photos/800/200?id=${Date.now()}`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        zIndex: 100,
                      }}
                      h={["100px", "190px"]}
                      w="100%"
                    />
                    <Box sx={{ zIndex: 100 }}>
                      <Flex>
                        <Image
                          ml="20px"
                          boxSize={["80px", "150px"]}
                          src={puser.image ?? "/images/default-icon.png"}
                          mt={["-40px", "-75px"]}
                          sx={{
                            borderRadius: "50%",
                          }}
                        />
                        <Box flex={1} />
                        <Box mx={4} mt={4} mb={[2, 4]}>
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
                              p={2}
                              bg="#333"
                              color="white"
                              height="auto"
                              align="center"
                              w="140px"
                              justify="center"
                              sx={{
                                borderRadius: "20px",
                                cursor: "pointer",
                                ":hover": {
                                  opacity: 0.75,
                                  bg: isFollowing ? "crimson" : "",
                                },
                                ":before": {
                                  content: isFollowing
                                    ? `"Following"`
                                    : isFollowed
                                    ? `"Follow Back"`
                                    : `"Follow"`,
                                },
                                ":hover:before": {
                                  content: isFollowing
                                    ? `"Unfollow"`
                                    : isFollowed
                                    ? `"Follow Back"`
                                    : `"Follow"`,
                                },
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
                                } else if (
                                  confirm(
                                    "Would you like to unfollow this user?"
                                  )
                                ) {
                                  const { follow } = await unfollowUser({
                                    user,
                                    puser,
                                  })
                                  setIsFollowing(false)
                                  setPuser(
                                    mergeLeft(
                                      { followers: puser.followers - 1 },
                                      puser
                                    )
                                  )
                                  setFollowers(
                                    reject(
                                      pathEq(["data", "from"], user.address)
                                    )(followers)
                                  )
                                }
                              }}
                            ></Flex>
                          ) : null}
                        </Box>
                      </Flex>
                      <Box
                        mx={["20px", "30px"]}
                        mt={[0, 4]}
                        fontSize="20px"
                        fontWeight="bold"
                      >
                        {puser.name}
                      </Box>
                      <Box
                        mx={["20px", "30px"]}
                        mb={2}
                        fontSize="15px"
                        color="#666"
                      >
                        @{puser.handle}
                      </Box>
                      <Box mx={["20px", "30px"]} mb={2} fontSize="15px">
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: linkifyHtml(puser.description, {
                              nl2br: true,
                              formatHref: {
                                hashtag: href => "/hashtag/" + href.substr(1),
                                mention: href => "/u" + href,
                              },
                            }),
                          }}
                        />
                      </Box>
                      <Flex mx={["20px", "30px"]} mb={2} fontSize="15px">
                        <Box
                          mr={4}
                          onClick={() => setTab("following")}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          <Box as="b" mr={1}>
                            {puser.following || 0}
                          </Box>
                          Following
                        </Box>
                        <Box
                          mr={4}
                          onClick={() => setTab("followers")}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          <Box as="b" mr={1}>
                            {puser.followers || 0}
                          </Box>
                          Followers
                        </Box>
                        {!isNil(user) &&
                        (puser.invites || 0) > 0 &&
                        user.address === puser.address ? (
                          <Box
                            mr={4}
                            onClick={() => setTab("invites")}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box as="b" mr={1}>
                              {invites.length} / {puser.invites || 0}
                            </Box>
                            Invites
                          </Box>
                        ) : null}
                      </Flex>
                    </Box>
                  </>
                )}
                {!isFollow ? (
                  <Flex sx={{ borderBottom: "1px solid #ccc" }} mt={3}>
                    {map(v => {
                      return (
                        <Flex
                          onClick={() => setTab(v.key)}
                          justify="center"
                          flex={1}
                          mx={[2, 8]}
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
                ) : null}
                {isFollow ? (
                  <>
                    {tab !== "invites" ? null : (
                      <Flex
                        p={4}
                        justify="center"
                        sx={{ borderBottom: "1px solid #ccc" }}
                      >
                        <Input
                          maxW="450px"
                          sx={{ borderRadius: "5px 0 0 5px" }}
                          placeholder="ETH Address"
                          value={addr}
                          onChange={e => setAddr(e.target.value)}
                        />
                        <Flex
                          justify="center"
                          w="150px"
                          py={2}
                          bg={isAddress(addr) ? "#333" : "#999"}
                          color="white"
                          height="auto"
                          align="center"
                          sx={{
                            borderRadius: "0 5px 5px 0",
                            cursor: isAddress(addr) ? "pointer" : "default",
                            ":hover": { opacity: isAddress(addr) ? 0.75 : 1 },
                          }}
                          onClick={async () => {
                            if (isAddress(addr)) {
                              const { err, doc } = await inviteUser({ addr })
                              if (!err) {
                                setInvites(
                                  prepend(
                                    { id: addr.toLowerCase(), data: doc },
                                    invites
                                  )
                                )
                                setAddr("")
                              } else {
                                alert("something went wrong")
                              }
                            }
                          }}
                        >
                          Invite
                        </Flex>
                      </Flex>
                    )}
                    {map(v => {
                      const u = users[v]
                      return isNil(u) ? null : isNil(u.handle) ? (
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
                              src={"/images/default-icon.png"}
                              boxSize="50px"
                              sx={{ borderRadius: "50%" }}
                            />
                            <Box>
                              <Box>
                                <Box fontWeight="bold">{v}</Box>
                                <Box color="#666">Not Registered Yet</Box>
                              </Box>
                            </Box>
                          </Flex>
                        </Box>
                      ) : (
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
                        : tab === "followers"
                        ? map(path(["data", "from"]))(followers)
                        : map(path(["data", "address"]))(invites)
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
                              ["to", "==", puser.address],
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
                      const v = tweets[v2.data.aid] ?? {}
                      const parent =
                        v2.data.repost !== "" && !isNil(v2.data.description)
                          ? v2.data
                          : null

                      return (
                        <Tweet
                          {...{
                            disabled: true,
                            parent,
                            likes,
                            reposted: reposts[v.id],
                            users,
                            tweets,
                            tweet: v,
                            repost:
                              tab === "posts" && v.owner !== puser?.address
                                ? v.owner
                                : null,
                            reply: v.reply_to !== "",
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
                ) : tab === "posts" ||
                  tab === "replies" ||
                  tab === "articles" ? (
                  <>
                    {(tab === "articles"
                      ? articles
                      : tab === "posts"
                      ? posts
                      : replies
                    ).length === 0 ? (
                      <Flex justify="center" p={10}>
                        No Post Found
                      </Flex>
                    ) : (
                      map(v2 => {
                        const v =
                          v2.data.repost === ""
                            ? v2.data
                            : tweets[v2.data.repost] ?? {}
                        const parent =
                          v2.data.repost !== "" && !isNil(v2.data.description)
                            ? v2.data
                            : null
                        const repost =
                          tab === "posts" && v2.data.repost !== ""
                            ? puser.address
                            : null
                        const reply =
                          tab === "replies" ||
                          (isNil(repost) ? v2.data.reply_to !== "" : v.reply_to)
                        return (
                          <Tweet
                            {...{
                              disabled: true,
                              parent,
                              likes,
                              reposted: reposts[v.id],
                              users,
                              tweets,
                              tweet: v,
                              repost,
                              reply,
                            }}
                          />
                        )
                      })(
                        tab === "articles"
                          ? articles
                          : tab === "posts"
                          ? posts
                          : replies
                      )
                    )}
                    {tab !== "articles" || !isNextArticles ? null : (
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
                            const _articles = await db.cget(
                              "posts",
                              ["owner", "==", puser.address],
                              ["type", "==", "article"],
                              ["date", "desc"],
                              ["startAfter", last(posts)],
                              limit
                            )
                            setArticles(concat(articles, _articles))
                            setIsNextArticles(_articles.length >= limit)
                          }}
                        >
                          Load More
                        </Flex>
                      </Flex>
                    )}
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
                              ["reply", "==", true],
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
      <EditUser
        {...{ setEditUser, editUser, identity, setUser, user, setPuser }}
      />
      <Footer {...{ user, setEditPost }} />
    </ChakraProvider>
  )
}

export default StatusPage
