import { Box, Flex, Image } from "@chakra-ui/react"
import sanitizeHtml from "sanitize-html"
import Link from "next/link"
import { mergeLeft, isNil } from "ramda"
import { deletePost, repostPost, likePost } from "../lib/db"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import GithubMarkdown from "../lib/GithubMarkdown"

export default function Article({
  delTweet,
  setShowReposts,
  setShowLikes,
  main = false,
  disabled = false,
  setEditRepost,
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
  noHeader = true,
}) {
  const isDeleted = !preview && isNil(post.date)
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
          if (!disabled && !preview && isNil(likes[post.id]) && !isNil(user)) {
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
          cursor: preview || isNil(user) ? "default" : "pointer",
          "hover:": {
            opacity: preview || isNil(user) ? 1 : 0.75,
          },
        }}
        onClick={async () => {
          if (!disabled && !preview && !isNil(user)) setEditRepost(post)
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
      {isDeleted ? null : (
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
      )}

      <Box fontSize="14px" className="markdown-body">
        {noHeader || isDeleted || isNil(post.cover) ? null : (
          <Flex justify="center" mb={4}>
            <Image src={post.cover} />
          </Flex>
        )}
        {isDeleted ? (
          <Flex fontSize="16px" pt={3} mb={4} justify="center" mx={6}>
            <Box as="i" color="crimson">
              This post has been deleted by the owner
            </Box>
          </Flex>
        ) : noHeader || post.description === "" ? null : (
          <Flex fontSize="16px" mt={2} mb={4} justify="center" mx={6}>
            <i>{post.description}</i>
          </Flex>
        )}
        {main ? (
          <Flex
            sx={{
              borderTop: "1px #ccc solid",
              borderBottom: "1px #ccc solid",
            }}
            py={3}
            fontSize="14px"
            px={4}
          >
            <Box>
              <b>{post.comments ?? 0}</b> Comments
            </Box>
            <Box
              sx={{
                cursor:
                  !disabled && post.reposts - post.quotes > 0
                    ? "pointer"
                    : "default",
                ":hover":
                  !disabled && post.reposts - post.quotes > 0
                    ? { textDecoration: "underline", color: "#333" }
                    : {},
              }}
              onClick={() => {
                if (!disabled && post.reposts - post.quotes > 0)
                  setShowReposts(true)
              }}
              ml={6}
              color="#333"
            >
              <b>{(post.reposts ?? 0) - (post.quotes ?? 0)}</b> Reposts
            </Box>
            {disabled || post.quotes === 0 ? (
              <Box ml={6} color="#333" sx={{ cursor: "default" }}>
                <b>{post.quotes ?? 0}</b> Quotes
              </Box>
            ) : (
              <Link href={`/s/${post.id}/quotes`}>
                <Box
                  ml={6}
                  color="#333"
                  sx={{
                    ":hover": { textDecoration: "underline", color: "#333" },
                  }}
                >
                  <b>{post.quotes ?? 0}</b> Quotes
                </Box>
              </Link>
            )}

            <Box
              onClick={() => {
                if (!disabled && post.likes > 0) setShowLikes(true)
              }}
              ml={6}
              sx={{
                cursor: !disabled && post.likes > 0 ? "pointer" : "default",
                ":hover":
                  !disabled && post.likes > 0
                    ? { textDecoration: "underline", color: "#333" }
                    : {},
              }}
            >
              <b>{post.likes ?? 0}</b> Likes
            </Box>
            <Box flex={1} />
            {!isDeleted && !preview && user?.address === puser?.address ? (
              <Box display={["none", "flex"]}>
                <Link href={`/s/${post.id}/edit`}>
                  <Box
                    sx={{
                      cursor: "pointer",
                      ":hover": { textDecoration: "underline", color: "#333" },
                    }}
                    color="#333"
                    ml={6}
                  >
                    Edit
                  </Box>
                </Link>
                <Box
                  onClick={async () => {
                    if (confirm("Would you like to delete this post?")) {
                      const { post: _post } = await deletePost({ tweet: post })
                      delTweet(_post)
                    }
                  }}
                  ml={6}
                  sx={{
                    cursor: "pointer",
                    ":hover": { textDecoration: "underline" },
                  }}
                >
                  Delete
                </Box>
              </Box>
            ) : null}
          </Flex>
        ) : null}
        {!isDeleted && !preview && user?.address === puser?.address ? (
          <Box
            display={["flex", "none"]}
            fontSize="14px"
            mt={2}
            pr={4}
            justifyContent="flex-end"
          >
            <Link href={`/s/${post.id}/edit`}>
              <Box
                sx={{
                  cursor: "pointer",
                  ":hover": { textDecoration: "underline", color: "#333" },
                }}
                color="#333"
                ml={6}
              >
                Edit
              </Box>
            </Link>
            <Box
              onClick={async () => {
                if (confirm("Would you like to delete this post?")) {
                  const { post: _post } = await deletePost({ tweet: post })
                  delTweet(_post)
                }
              }}
              ml={6}
              sx={{
                cursor: "pointer",
                ":hover": { textDecoration: "underline" },
              }}
            >
              Delete
            </Box>
          </Box>
        ) : null}
        {isDeleted ? null : (
          <Box
            my={4}
            fontSize="16px"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
        {isDeleted || preview ? null : (
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
