import { Box, Flex, Image } from "@chakra-ui/react"
import Link from "next/link"
import { mergeLeft, isNil } from "ramda"
import { repostPost, likePost } from "../lib/db"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import GithubMarkdown from "../lib/GithubMarkdown"

export default function Article({
  post,
  user,
  puser,
  preview = false,
  reposted = false,
  setRetweet,
  likes = {},
  setLikes,
  _tweet,
  setTweet,
  repost = null,
}) {
  const Like = () => {
    return (
      <Box
        ml={10}
        color={!isNil(likes[post.id]) ? "#F91880" : ""}
        sx={{
          cursor:
            preview || !isNil(likes[post.id]) || isNil(user)
              ? "default"
              : "pointer",
          ":hover": {
            opacity:
              preview || !isNil(likes[post.id]) || isNil(user) ? 1 : 0.75,
          },
        }}
        onClick={async () => {
          if (!preview && isNil(likes[post.id]) && !isNil(user)) {
            const { like } = await likePost({ user, tweet: post })
            setLikes(mergeLeft({ [post.id]: like }, likes))
            setTweet()
          }
        }}
      >
        <Box
          as="i"
          className={!isNil(likes[post.id]) ? "fas fa-heart" : "far fa-heart"}
          mr={2}
        />
        {post.likes ?? 0}
      </Box>
    )
  }
  const Comment = () => {
    return (
      <Box>
        <Box as="i" className="far fa-comment" mr={2} />
        {post.comments ?? 0}
      </Box>
    )
  }
  const Repost = () => {
    return (
      <Box
        ml={10}
        color={reposted ? "#00BA7C" : ""}
        sx={{
          cursor: preview || reposted || isNil(user) ? "default" : "pointer",
          "hover:": {
            opacity: preview || reposted || isNil(user) ? 1 : 0.75,
          },
        }}
        onClick={async () => {
          if (!preview && !reposted && !isNil(user)) {
            const { repost } = await repostPost({ user, tweet: post })
            setRetweet(repost)
          }
        }}
      >
        <Box as="i" className="fas fa-retweet" mr={2} />
        {post.reposts ?? 0}
      </Box>
    )
  }
  return (
    <Box my={1} mx={2} flex={1}>
      <GithubMarkdown />
      <Flex
        mb={4}
        align={[post.title !== "" ? "flex-start" : "center", null, "center"]}
      >
        <Box flex={1}>
          <Box
            as="h1"
            my={4}
            fontSize={["16px", "24px", , "32px"]}
            fontWeight="bold"
            lineHeight="120%"
          >
            {post.title}
          </Box>
          <Flex fontSize="14px" color="#666" align="center">
            {preview ? (
              <Image
                src={puser?.image ?? "/images/default-icon.png"}
                boxSize="40px"
                m={1}
                mr={3}
                sx={{ borderRadius: "50%" }}
              />
            ) : (
              <Link
                href={`/u/${puser?.handle}`}
                onClick={e => {
                  e.stopPropagation()
                }}
              >
                <Image
                  src={puser?.image ?? "/images/default-icon.png"}
                  boxSize="40px"
                  m={1}
                  mr={3}
                  sx={{ borderRadius: "50%" }}
                />
              </Link>
            )}
            <Box>
              {preview ? (
                <Box color="#333" fontWeight="bold">
                  {puser?.name}
                </Box>
              ) : (
                <Link
                  href={`/u/${puser?.handle}`}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  <Box color="#333" fontWeight="bold">
                    {puser?.name}
                  </Box>
                </Link>
              )}
              <Flex>
                {preview ? (
                  <Box>@{puser?.handle}</Box>
                ) : (
                  <Link
                    href={`/u/${puser?.handle}`}
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    <Box>@{puser?.handle}</Box>
                  </Link>
                )}
                <Box mx={1}>·</Box>
                <Box>
                  {preview ? "Preview" : dayjs(post.date).fromNow(true)}
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Flex>
      <Box fontSize="14px" className="markdown-body">
        {isNil(post.cover) ? null : (
          <Flex justify="center" mb={4}>
            <Image src={post.cover} />
          </Flex>
        )}

        {post.description === "" ? null : (
          <Flex fontSize="16px" mt={2} mb={4} justify="center">
            <i>{post.description}</i>
          </Flex>
        )}
        {!preview && !isNil(post.body) ? (
          <Flex
            sx={{
              borderTop: "1px #ccc solid",
              borderBottom: "1px #ccc solid",
            }}
            py={3}
            justify="center"
          >
            <Comment />
            <Repost />
            <Like />
          </Flex>
        ) : null}
        <Box
          my={4}
          fontSize="16px"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
        {preview ? null : (
          <Flex mt={2}>
            <Comment />
            <Repost />
            <Like />
          </Flex>
        )}
      </Box>
    </Box>
  )
}
