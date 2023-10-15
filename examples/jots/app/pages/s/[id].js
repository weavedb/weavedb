import showdown from "showdown"
const converter = new showdown.Converter()
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { Box, Flex, ChakraProvider, Image } from "@chakra-ui/react"
import Link from "next/link"
import {
  addIndex,
  dissocPath,
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
import Footer from "../../components/Footer"
import Alpha from "../../components/Alpha"
import SDK from "weavedb-client"
import { initDB, checkUser, getUsers } from "../../lib/db"
import EditUser from "../../components/EditUser"
import EditRepost from "../../components/EditRepost"
import EditPost from "../../components/EditPost"
import EditStatus from "../../components/EditStatus"
import Likes from "../../components/Likes"
import Reposts from "../../components/Reposts"
const limit = 10

function StatusPage() {
  const router = useRouter()
  const [parent, setParent] = useState(null)
  const [embed, setEmbed] = useState(null)
  const [tweet, setTweet] = useState(null)
  const [users, setUsers] = useState({})
  const [likes, setLikes] = useState({})
  const [comments, setComments] = useState([])
  const [user, setUser] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editRepost, setEditRepost] = useState(null)
  const [editPost, setEditPost] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [repost, setRepost] = useState(null)
  const [reposted, setReposted] = useState(false)
  const [reposts, setReposts] = useState({})
  const [isNextComment, setIsNextComment] = useState(false)
  const [tweets, setTweets] = useState({})
  const [showLikes, setShowLikes] = useState(false)
  const [showReposts, setShowReposts] = useState(false)
  const [noHeader, setNoHeader] = useState(false)
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
          if (!isNil(post.data.repost) && post.data.repost !== "") {
            let _embed = await db.cget("posts", post.data.repost)
            setEmbed(_embed)
            if (!isNil(_embed)) {
              _users.push(_embed.data.owner)
            }
          } else {
            setEmbed(null)
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
              let url = post.data.body
              if (/hideaki-97c59/.test(url)) setNoHeader(true)
              const json = await fetch(url, { mode: "cors" }).then(v =>
                v.json()
              )
              const format = json.type ?? json.format ?? "md"
              let body = json.content ?? json.body
              if (format === "md") body = converter.makeHtml(body)
              setTweet(assocPath(["data", "content"], body)(post))
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
  const isDeleted = !isNil(tweet) && isNil(tweet.data.date)
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
          title: isNil(tweet?.data?.title)
            ? tweet?.data?.reply_to !== ""
              ? "Reply"
              : "Status"
            : "Article",
          wide: true,
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
      {isNil(user?.handle) && process.env.NEXT_PUBLIC_MODE === "closed" ? (
        <Alpha />
      ) : (
        <>
          {isNil(tweet) ? null : (
            <Flex justify="center" minH="100%" pb={["50px", 0]} pt="50px">
              <Box flex={1}></Box>
              <Box w="100%" maxW="760px" minH="100%">
                {isNil(parent) ? null : (
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
                      tweet: parent.data,
                      users,
                      reply: true,
                    }}
                  />
                )}
                {tweet.data.reply_to !== "" || isNil(tweet.data.title) ? (
                  <Tweet
                    {...{
                      setShowReposts,
                      setShowLikes,
                      parent: isNil(embed) ? null : tweet.data,
                      setEditRepost,
                      main: true,
                      user,
                      likes,
                      setLikes,
                      isLink: false,
                      reposted: reposts[tweet.data.id],
                      delTweet: post => {
                        setTweet(dissocPath(["data", "date"], tweet))
                      },
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
                      tweet: isNil(embed) ? tweet.data : embed.data,
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
                        noHeader,
                        setShowReposts,
                        setShowLikes,
                        main: true,
                        setEditRepost,
                        reposted: reposts[tweet.data.id],
                        likes,
                        setLikes,
                        delTweet: post => {
                          setTweet(dissocPath(["data", "date"], tweet))
                        },
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
                      post={tweet.data}
                      user={user}
                      puser={users[tweet.data.owner]}
                    />
                  </Box>
                )}
                {isDeleted || isNil(user) ? null : (
                  <Flex
                    p={4}
                    onClick={() => {
                      setReplyTo(tweet.data.id)
                      setRepost(null)
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
                {addIndex(map)((v, i) => (
                  <>
                    <Tweet
                      {...{
                        reposts,
                        isLast: true,
                        isComment: true,
                        setEditRepost,
                        user,
                        likes,
                        setLikes,
                        reposted: reposts[v.id],
                        delTweet: post => {},
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
                        tweet: v,
                        users,
                        reply: true,
                      }}
                    />
                  </>
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
          {isNil(tweet) ? null : (
            <EditRepost
              user={user}
              {...{
                setRepost,
                setReplyTo,
                setEditStatus,
                reposted: reposts[editRepost?.id],
                setEditRepost,
                editRepost,
                setRetweet: repost => {
                  if (editRepost.id === tweet.data.id) {
                    setTweet(
                      assocPath(
                        ["data", "reposts"],
                        tweet.data.reposts + 1,
                        tweet
                      )
                    )
                    setReposts(mergeLeft({ [tweet.data.id]: repost }, reposts))
                  } else {
                    let _comments = clone(comments)
                    for (let v of _comments) {
                      if (v.id === repost.repost) v.data.reposts += 1
                    }
                    setComments(_comments)
                    setReposts(assoc(repost.repost, repost, reposts))
                  }
                },
              }}
            />
          )}
          {showLikes ? <Likes {...{ setShowLikes, post: tweet.data }} /> : null}
          {showReposts ? (
            <Reposts {...{ setShowReposts, post: tweet.data }} />
          ) : null}
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
              users,
              setEditStatus,
              editStatus,
              user,
              replyTo,
              setPost: isNil(replyTo)
                ? null
                : post => {
                    if (isNil(repost)) {
                      if (post.repost === tweet.data.id) {
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
                      setComments(
                        prepend({ id: post.id, data: post }, comments)
                      )
                    } else {
                      if (post.repost === tweet.data.id) {
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
                        let _comments = clone(comments)
                        for (let v of _comments) {
                          if (v.data.id === post.repost) {
                            v.data.reposts += 1
                          }
                        }
                        setComments(_comments)
                      }
                    }
                  },
            }}
          />
        </>
      )}
      <EditUser {...{ setEditUser, editUser, identity, setUser, user }} />
      <Footer {...{ user, setEditPost }} />
    </ChakraProvider>
  )
}

export default StatusPage
