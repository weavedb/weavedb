import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Box, Flex, ChakraProvider, Image } from "@chakra-ui/react"
import Link from "next/link"
import {
  assoc,
  assocPath,
  last,
  concat,
  path,
  difference,
  __,
  keys,
  uniq,
  compose,
  mergeRight,
  prepend,
  clone,
  mergeLeft,
  isNil,
  map,
  pluck,
  filter,
  propEq,
  values,
  indexBy,
  prop,
} from "ramda"
import Tweet from "../../components/Tweet"
import Article from "../../components/Article"
import Header from "../../components/Header"
import SDK from "weavedb-client"
import { initDB, checkUser, getUsers } from "../../lib/db"
import EditUser from "../../components/EditUser"
import EditRepost from "../../components/EditRepost"
import EditPost from "../../components/EditPost"
import EditStatus from "../../components/EditStatus"
const limit = 10

function StatusPage() {
  const router = useRouter()
  const [parent, setParent] = useState(null)
  const [tweet, setTweet] = useState(null)
  const [users, setUsers] = useState({})
  const [likes, setLikes] = useState({})
  const [comments, setComments] = useState([])
  const [user, setUser] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editRepost, setEditRepost] = useState(false)
  const [editPost, setEditPost] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [repost, setRepost] = useState(false)
  const [reposted, setReposted] = useState(false)
  const [reposts, setReposts] = useState({})
  const [isNextComment, setIsNextComment] = useState(false)
  const [tweets, setTweets] = useState({})
  useEffect(() => {
    if (!isNil(router.query.id)) {
      ;(async () => {
        setParent(null)
        const db = await initDB()
        let post = await db.cget("posts", router.query.id)
        if (!isNil(post)) {
          setTweet(post)
          let _users = [post.data.owner]
          if (post.data.reply_to !== "") {
            let par = await db.cget("posts", post.data.reply_to)
            if (!isNil(par)) {
              _users.push(par.data.owner)
              setParent(par)
            }
          }
          await getUsers({ ids: _users, users, setUsers })
          const _comments = await db.cget(
            "posts",
            ["reply_to", "==", post.data.id],
            ["date", "desc"],
            limit
          )
          setComments(_comments)
          setIsNextComment(_comments.length >= limit)
          if (!isNil(post.data.body)) {
            try {
              const json = await fetch(post.data.body, { mode: "cors" }).then(
                v => v.json()
              )
              setTweet(assocPath(["data", "content"], json.content)(post))
            } catch (e) {}
          }
        }
      })()
    }
  }, [router])

  useEffect(() => {
    ;(async () => {
      const { user, identity } = await checkUser()
      setUser(user)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      await getUsers({
        ids: map(path(["data", "owner"]))(values(tweets)),
        setUsers,
        users,
      })
    })()
  }, [tweets])

  useEffect(() => {
    ;(async () => {
      let _tweets = indexBy(prop("id"))(comments)
      if (!isNil(tweet)) {
        _tweets = assoc(tweet.data.id, tweet)(_tweets)
      }
      setTweets(_tweets)
    })()
  }, [tweet, comments])

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
      {isNil(tweet) ? null : (
        <Flex justify="center" minH="100%" pb={10}>
          <Box flex={1}></Box>
          <Box w="100%" maxW="760px" minH="100%">
            <Header
              {...{
                setEditPost,
                setReplyTo,
                user,
                setUser,
                setEditUser,
                identity,
                setIdentity,
                setEditStatus,
              }}
            />
            {isNil(parent) ? null : parent.data.reply_to !== "" ? (
              <Tweet
                {...{
                  disabled: true,
                  user,
                  likes,
                  setLikes,
                  isLink: true,
                  reposted: reposts[parent.data.id],
                  setTweet: () => {
                    setTweet(
                      assocPath(["data", "likes"], parent.data.likes + 1, tweet)
                    )
                  },
                  setRetweet: repost => {
                    setTweet(
                      assocPath(
                        ["data", "reposts"],
                        parent.data.reposts + 1,
                        tweet
                      )
                    )
                    setReposts(mergeLeft({ [parent.data.id]: repost }, reposts))
                  },
                  tweet: {
                    body: parent.data.description,
                    id: parent.data.id,
                    date: parent.data.date,
                    user: parent.data.owner,
                    reposts: parent.data.reposts,
                    likes: parent.data.likes,
                    comments: parent.data.comments,
                  },
                  users,
                  reply: true,
                }}
              />
            ) : (
              <Link href={`/s/${tweet.data.reply_to}`}>
                <Box
                  pb={3}
                  maxW="760px"
                  w="100%"
                  display="flex"
                  px={[2, 4, 6]}
                  sx={{
                    cursor: "pointer",
                    ":hover": { opacity: 0.75, bg: "#f9f9f9" },
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <Article
                    {...{
                      disabled: true,
                      setEditRepost,
                      reposted: reposts[parent.data.id],
                      likes,
                      setLikes,
                      setTweet: () => {
                        setTweet(
                          assocPath(
                            ["data", "likes"],
                            parent.data.likes + 1,
                            tweet
                          )
                        )
                      },
                      setRetweet: repost => {
                        setTweet(
                          assocPath(
                            ["data", "reposts"],
                            parent.data.reposts + 1,
                            tweet
                          )
                        )
                        setReposts(
                          mergeLeft({ [parent.data.id]: repost }, reposts)
                        )
                      },
                    }}
                    post={{
                      id: parent.data.id,
                      title: parent.data.title,
                      description: parent.data.description,
                      body: parent.data.content,
                      cover: parent.data.cover,
                      likes: parent.data.likes,
                      reposts: parent.data.reposts,
                      quotes: parent.data.quotes,
                      comments: parent.data.comments,
                    }}
                    user={user}
                    puser={users[parent.data.owner]}
                  />
                </Box>
              </Link>
            )}
            {tweet.data.reply_to !== "" || isNil(tweet.data.title) ? (
              <Tweet
                {...{
                  user,
                  likes,
                  setLikes,
                  isLink: false,
                  reposted: reposts[tweet.data.id],
                  setTweet: () => {
                    setTweet(
                      assocPath(["data", "likes"], tweet.data.likes + 1, tweet)
                    )
                  },
                  setRetweet: repost => {
                    setTweet(
                      assocPath(
                        ["data", "reposts"],
                        tweet.data.reposts + 1,
                        tweet
                      )
                    )
                    setReposts(mergeLeft({ [tweet.data.id]: repost }, reposts))
                  },
                  tweet: {
                    body: tweet.data.description,
                    id: tweet.data.id,
                    date: tweet.data.date,
                    user: tweet.data.owner,
                    reposts: tweet.data.reposts,
                    likes: tweet.data.likes,
                    comments: tweet.data.comments,
                  },
                  users,
                  reply: true,
                }}
              />
            ) : (
              <Box
                pb={3}
                maxW="760px"
                w="100%"
                display="flex"
                px={[2, 4, 6]}
                sx={{ borderBottom: "1px solid #ccc" }}
              >
                <Article
                  {...{
                    setEditRepost,
                    reposted: reposts[tweet.data.id],
                    likes,
                    setLikes,
                    setTweet: () => {
                      setTweet(
                        assocPath(
                          ["data", "likes"],
                          tweet.data.likes + 1,
                          tweet
                        )
                      )
                    },
                    setRetweet: repost => {
                      setTweet(
                        assocPath(
                          ["data", "reposts"],
                          tweet.data.reposts + 1,
                          tweet
                        )
                      )
                      setReposts(
                        mergeLeft({ [tweet.data.id]: repost }, reposts)
                      )
                    },
                  }}
                  post={{
                    id: tweet.data.id,
                    title: tweet.data.title,
                    description: tweet.data.description,
                    body: tweet.data.content,
                    cover: tweet.data.cover,
                    likes: tweet.data.likes,
                    reposts: tweet.data.reposts,
                    quotes: tweet.data.quotes,
                    comments: tweet.data.comments,
                  }}
                  user={user}
                  puser={users[tweet.data.owner]}
                />
              </Box>
            )}
            {isNil(user) ? null : (
              <Flex
                p={4}
                onClick={() => {
                  setReplyTo(tweet.data.id)
                  setRepost(false)
                  setEditStatus(true)
                }}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                  borderBottom: "1px solid #ccc",
                }}
                align="center"
              >
                <Image
                  src={user.image ?? "/images/default-icon.png"}
                  boxSize="35px"
                  m={1}
                  sx={{ borderRadius: "50%" }}
                />
                <Box flex={1} color="#666" pl={4}>
                  Write your reply!
                </Box>
                <Flex
                  mx={2}
                  px={8}
                  py={2}
                  bg="#333"
                  color="white"
                  height="auto"
                  align="center"
                  sx={{
                    borderRadius: "20px",
                  }}
                >
                  Reply
                </Flex>
              </Flex>
            )}
            {map(v => (
              <Tweet
                {...{
                  user,
                  likes,
                  setLikes,
                  reposted: reposts[v.id],
                  setRetweet: repost => {
                    let _comments = clone(comments)
                    for (let v2 of _comments) {
                      if (v.id === v2.id) v2.data.reposts += 1
                    }
                    setComments(_comments)
                    setReposts(assoc(v.id, repost, reposts))
                  },
                  setTweet: () => {
                    let _comments = clone(comments)
                    for (let v2 of _comments) {
                      if (v2.id === v.id) v2.data.likes += 1
                    }
                    setComments(_comments)
                  },
                  tweet: {
                    body: v.description,
                    id: v.id,
                    date: v.date,
                    user: v.owner,
                    reposts: v.reposts,
                    likes: v.likes,
                    comments: v.comments,
                  },
                  users,
                  reply: true,
                }}
              />
            ))(pluck("data")(comments))}
            {!isNextComment ? null : (
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
                    const _comments = await db.cget(
                      "posts",
                      ["reply_to", "==", tweet.data.id],
                      ["date", "desc"],
                      ["startAfter", last(comments)],
                      limit
                    )
                    setComments(concat(comments, _comments))
                    setIsNextComment(_comments.length >= limit)
                  }}
                >
                  Load More
                </Flex>
              </Flex>
            )}
          </Box>
          <Box flex={1}></Box>
        </Flex>
      )}
      <EditUser {...{ setEditUser, editUser, identity, setUser, user }} />
      {isNil(tweet) ? null : (
        <EditRepost
          post={{
            id: tweet.data.id,
            title: tweet.data.title,
            description: tweet.data.description,
            body: tweet.data.content,
            cover: tweet.data.cover,
            likes: tweet.data.likes,
            reposts: tweet.data.reposts,
            comments: tweet.data.comments,
          }}
          user={user}
          {...{
            setRepost,
            setReplyTo,
            setEditStatus,
            reposted: reposts[tweet.data.id],
            setEditRepost,
            editRepost,
            setRetweet: repost => {
              setTweet(
                assocPath(["data", "reposts"], tweet.data.reposts + 1, tweet)
              )
              setReposts(mergeLeft({ [tweet.data.id]: repost }, reposts))
            },
          }}
        />
      )}
      <EditPost
        {...{
          setEditStatus,
          setEditPost,
          editPost,
          setReplyTo,
        }}
      />
      <EditStatus
        {...{
          tweet: tweet?.data,
          repost,
          setEditStatus,
          editStatus,
          user,
          replyTo,
          setPost: isNil(replyTo)
            ? null
            : post => {
                if (repost) {
                  let new_post = assocPath(
                    ["data", "reposts"],
                    tweet.data.reposts + 1,
                    tweet
                  )
                  if (!isNil(post.description)) {
                    new_post = assocPath(
                      ["data", "quotes"],
                      new_post.data.quotes + 1,
                      new_post
                    )
                  }
                  setTweet(new_post)
                } else {
                  setTweet(
                    assocPath(
                      ["data", "comments"],
                      tweet.data.comments + 1,
                      tweet
                    )
                  )
                  if (!isNil(parent)) {
                    setParent(
                      assocPath(
                        ["data", "comments"],
                        parent.data.comments + 1,
                        parent
                      )
                    )
                  }
                }
                setComments(prepend({ id: post.id, data: post }, comments))
              },
        }}
      />
    </ChakraProvider>
  )
}

export default StatusPage
