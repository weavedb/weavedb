import { Box, Flex, ChakraProvider, Image } from "@chakra-ui/react"
import Link from "next/link"
import {
  mergeLeft,
  isNil,
  map,
  compose,
  pluck,
  filter,
  propEq,
  values,
} from "ramda"
import { marked } from "marked"
import GithubMarkdown from "../lib/GithubMarkdown"
import stripTags from "strip-tags"
import PlainTextRenderer from "marked-plaintext"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)
import { repostPost, likePost } from "../lib/db"
function Tweet({
  reposted = false,
  setRetweet,
  user,
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
}) {
  const puser = users[tweet.user] ?? {}
  const renderer = new PlainTextRenderer()
  marked.setOptions({ sanitize: false })
  const content = (
    <>
      <Flex
        p={2}
        align="center"
        sx={{
          borderBottom: "1px solid #ccc",
          cursor:
            (reply && !isNil(tweet.reploy_to)) ||
            (isLink && !isNil(tweet.title))
              ? "pointer"
              : "default",
          ":hover": {
            opacity:
              (reply && !isNil(tweet.reply_to)) ||
              (isLink && !isNil(tweet.title))
                ? 0.75
                : 1,
          },
        }}
      >
        <Box
          display={["none", null, null, "block"]}
          w="58px"
          alignSelf="flex-start"
        >
          <Link
            href={`/u/${puser.handle}`}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <Image
              src={puser.image ?? "/images/default-icon.png"}
              boxSize="50px"
              m={1}
              sx={{ borderRadius: "50%" }}
            />
          </Link>
        </Box>
        <Box my={1} mx={2} flex={1}>
          <Flex
            align={[
              !isNil(tweet.title) ? "flex-start" : "center",
              null,
              null,
              "center",
            ]}
          >
            <Link
              href={`/u/${puser.handle}`}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <Image
                display={["block", null, null, "none"]}
                src={puser.image ?? "/images/default-icon.png"}
                boxSize={
                  !isNil(tweet.title)
                    ? !isNil(body)
                      ? "40px"
                      : "30px"
                    : "25px"
                }
                mr={3}
                sx={{ borderRadius: "50%" }}
              />
            </Link>
            <Box flex={1}>
              {reply && !isNil(tweets[tweet.reply_to]?.title) ? (
                <Flex align="center" fontSize="12px">
                  <Box as="i" className="far fa-comment" mr={2} />
                  <Box mr={1}>reply to</Box>
                  <Box fontWeight="bold">{tweets[tweet.reply_to].title}</Box>
                </Flex>
              ) : !isNil(repost) ? (
                <Flex align="center" fontSize="12px">
                  <Box as="i" className="fas fa-retweet" mr={2} />
                  <Box mr={1}>reposted by</Box>
                  <Link
                    href={`/u/${users[repost]?.handle}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <Box fontWeight="bold">{users[repost]?.name}</Box>
                  </Link>
                </Flex>
              ) : null}
              <Box fontSize={["16px", null, null, "20px"]} fontWeight="bold">
                {tweet.title}
              </Box>
              <Flex fontSize="14px" color="#666">
                <Link
                  href={`/u/${puser.handle}`}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  <Flex>
                    <Box color="#333" fontWeight="bold">
                      {puser.name}
                    </Box>
                    <Box ml={2}>@{puser.handle}</Box>
                  </Flex>
                </Link>
                <Box mx={1}>·</Box>
                <Box>{dayjs(tweet.date).fromNow(true)}</Box>
              </Flex>
            </Box>
          </Flex>
          <Box fontSize="14px" mt={2} className="markdown-body">
            {!isNil(body) ? (
              list ? (
                <Box>{marked(body, { renderer }).slice(0, 140)}</Box>
              ) : (
                <>
                  <Image src="https://picsum.photos/650/300" mb={4} />
                  <Box dangerouslySetInnerHTML={{ __html: marked(body) }} />
                </>
              )
            ) : (
              tweet.body
            )}
          </Box>
          <Flex mt={2}>
            {reply ? null : (
              <>
                <Box>
                  <Box as="i" className="far fa-comment" mr={2} />
                  {tweet.comments}
                </Box>
                <Box
                  ml={10}
                  color={reposted ? "#00BA7C" : ""}
                  sx={{
                    cursor: reposted || isNil(user) ? "default" : "pointer",
                    "hover:": {
                      opacity: reposted || isNil(user) ? 1 : 0.75,
                    },
                  }}
                  onClick={async () => {
                    if (!reposted && !isNil(user)) {
                      const { repost } = await repostPost({ user, tweet })
                      setRetweet(repost)
                    }
                  }}
                >
                  <Box as="i" className="fas fa-retweet" mr={2} />
                  {tweet.reposts}
                </Box>
              </>
            )}
            <Box
              ml={reply ? 0 : 10}
              color={!isNil(likes[tweet.id]) ? "#F91880" : ""}
              sx={{
                cursor:
                  !isNil(likes[tweet.id]) || isNil(user)
                    ? "default"
                    : "pointer",
                ":hover": {
                  opacity: !isNil(likes[tweet.id]) || isNil(user) ? 1 : 0.75,
                },
              }}
              onClick={async () => {
                if (isNil(likes[tweet.id]) && !isNil(user)) {
                  const { like } = await likePost({ user, tweet })
                  setLikes(mergeLeft({ [tweet.id]: like }, likes))
                  setTweet()
                }
              }}
            >
              <Box
                as="i"
                className={
                  !isNil(likes[tweet.id]) ? "fas fa-heart" : "far fa-heart"
                }
                mr={2}
              />
              {tweet.likes}
            </Box>
          </Flex>
        </Box>
        <Box
          sx={{
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundImage: tweet.cover,
          }}
          boxSize="100px"
          mx={4}
        />
      </Flex>
    </>
  )
  return isLink && !isNil(tweet.title) ? (
    <Link href={`/s/${tweet.id}`}>{content}</Link>
  ) : reply && !isNil(tweet.reply_to) ? (
    <Link href={`/s/${tweet.reply_to}`}>{content}</Link>
  ) : (
    content
  )
}

export default Tweet
