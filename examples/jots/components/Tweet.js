import Link from "next/link"

import {
  concat,
  last,
  prepend,
  mergeLeft,
  assoc,
  clone,
  assocPath,
  addIndex,
  map,
  isNil,
  difference,
  pluck,
  keys,
  indexBy,
  prop,
} from "ramda"

import Embed from "./Embed"
import { Flex, Box } from "@chakra-ui/react"
import { initDB } from "../lib/db"
import { useState, useEffect } from "react"
import EditRepost from "./EditRepost"
import EditStatus from "./EditStatus"

function Tweet({
  buttons = true,
  nested = false,
  _setComments,
  _comments,
  reposts,
  isLast,
  delTweet,
  reposted = false,
  setRetweet,
  user = {},
  likes = {},
  setLikes,
  _tweet,
  setTweet,
  body,
  tweet,
  users,
  tweets = {},
  isLink = true,
  list = true,
  reply = false,
  repost = null,
  parent,
  disabled = false,
  main = false,
  setEditRepost,
  setShowLikes,
  setShowReposts,
  isComment,
  _isNext,
}) {
  const limit = 10
  const [comments, setComments] = useState([])
  const [isNext, setIsNext] = useState(null)
  const [show, setShow] = useState(true)
  const [editRepost2, setEditRepost2] = useState(null)
  const [editStatus2, setEditStatus2] = useState(false)
  const [replyTo2, setReplyTo2] = useState(null)
  const [repost2, setRepost2] = useState(null)
  const [reposts2, setReposts2] = useState({})

  useEffect(() => {
    setIsNext(null)
    setComments([])
  }, [tweet])

  useEffect(() => {
    ;(async () => {
      const db = await initDB()
      const ids = difference(pluck("id")(comments), keys(likes))
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
    })()
  }, [comments])

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        const db = await initDB()
        const ids = difference(pluck("id")(comments), keys(reposts2))
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
          setReposts2(mergeLeft(new_reposts, reposts2))
        }
      }
    })()
  }, [comments, user])

  const content = (
    <Embed
      {...{
        buttons,
        isComment:
          isNil(parent) && (_isNext || !isLast || tweet.comments > 0)
            ? isComment
            : false,
        delTweet,
        setShowReposts,
        setShowLikes,
        setEditRepost,
        main: isNil(parent) ? main : false,
        disabled: isNil(parent) ? disabled : false,
        isLink: isNil(parent) ? isLink : true,
        reposted,
        setRetweet,
        user,
        likes,
        _tweet,
        setLikes,
        setTweet,
        body,
        tweet,
        users,
        tweets,
        list,
        reply,
        repost,
        parent,
      }}
    />
  )

  const embed =
    isLink || !isNil(parent) ? (
      <Link href={`/s/${tweet.id}`}>{content}</Link>
    ) : (
      content
    )

  const pr = isNil(parent) ? null : (
    <Embed
      {...{
        buttons,
        isComment: isComment && (_isNext || !isLast || tweet.comments > 0),
        delTweet,
        setShowReposts,
        setShowLikes,
        setEditRepost,
        main,
        user,
        disabled,
        isLink,
        embed,
        likes,
        reposted: false,
        users,
        tweets,
        setLikes,
        setTweet,
        likes,
        reposted,
        setRetweet,
        tweet: parent,
        repost: null,
        reply: false,
      }}
    />
  )

  return (
    <>
      <Box sx={{ position: "relative" }}>
        {isNil(parent) ? (
          embed
        ) : isLink ? (
          <Link href={`/s/${parent.id}`}>{pr}</Link>
        ) : (
          pr
        )}
        {addIndex(map)((v, i) => {
          return (
            <Tweet
              {...{
                setTweet: () => {
                  let _comments = clone(comments)
                  for (let v2 of _comments) {
                    if (v2.id === v.id) {
                      v2.data.likes += 1
                    }
                  }
                  setComments(_comments)
                },
                _setComments: setComments,
                _comments: comments,
                setEditRepost: setEditRepost2,
                reposts,
                isLast: comments.length - 1 === i,
                setRetweet,
                reply,
                reposted: reposts2[v.id],
                tweet: v.data,
                users,
                user,
                isComment: show ? true : !(comments.length - 1 === i),
                _isNext: isNext,
                likes,
                setLikes,
                isLink,
                disabled,
                nested: true,
              }}
            />
          )
        })(comments)}
        {!nested && isLast && show && isComment && tweet.comments > 0 ? (
          <Flex
            mt={2}
            fontSize="14px"
            sx={{ borderBottom: "1px #ccc solid" }}
            pb={main ? 3 : 2}
            onClick={async () => {
              const db = await initDB()
              let args = [
                "posts",
                ["reply_to", "==", tweet.id],
                ["date", "asc"],
              ]
              if (isNext) args.push(["startAfter", last(comments)])
              const _comments = await db.cget(...args, limit)
              setComments(concat(comments, _comments))
              setShow(_comments.length === limit)
              setIsNext(_comments.length === limit)
            }}
          >
            <Box w="58px" />
            <Box
              mx={[0, null, null, 4]}
              sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
            >
              Show replies
            </Box>
          </Flex>
        ) : null}
        {!isComment || tweet.comments === 0 ? null : (
          <Box
            bg="#ddd"
            w="2px"
            sx={{
              position: "absolute",
              top: 0,
              left: ["28px", null, null, "36px"],
              zIndex: -1,
            }}
            mb="13px"
            mt="20px"
            h="calc(100% - 33px)"
          />
        )}
      </Box>
      <EditRepost
        user={user}
        {...{
          setRepost: setRepost2,
          setReplyTo: setReplyTo2,
          setEditStatus: setEditStatus2,
          reposted: reposts2[editRepost2?.id],
          setEditRepost: setEditRepost2,
          editRepost: editRepost2,
          setRetweet: repost => {
            let _comments = clone(comments)
            for (let v of _comments) {
              if (v.id === repost.repost) v.data.reposts += 1
            }
            setComments(_comments)
            setReposts2(assoc(repost.repost, repost, reposts2))
          },
        }}
      />
      <EditStatus
        {...{
          tweet: tweet?.data,
          repost,
          setEditStatus: setEditStatus2,
          editStatus: editStatus2,
          user,
          repost: repost2,
          setPost: post => {
            let _comments = clone(comments)
            for (let v of _comments) {
              if (v.data.id === post.repost) v.data.reposts += 1
            }
            setComments(_comments)
            setReposts2(assoc(post.repost, post, reposts2))
          },
        }}
      />
    </>
  )
}

export default Tweet
