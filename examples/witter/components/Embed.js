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

const Embed = ({
  setShowReposts,
  setShowLikes,
  setEditRepost,
  main = false,
  disabled = false,
  embed,
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
}) => {
  const puser = users[tweet.owner ?? tweet.user] ?? {}
  const renderer = new PlainTextRenderer()
  marked.setOptions({ sanitize: false })
  let metadata = []
  if (!isNil(repost) && isNil(parent)) {
    metadata.push(
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
    )
  }
  if (reply && !isNil(tweets[tweet.reply_to]?.title)) {
    metadata.push(
      <Flex align="center" fontSize="12px" ml={metadata.length == 0 ? 0 : 6}>
        <Box as="i" className="far fa-comment" mr={2} />
        <Box mr={1}>reply to</Box>
        <Box fontWeight="bold">{tweets[tweet.reply_to].title}</Box>
      </Flex>
    )
  }
  const content = (
    <>
      <Flex
        p={2}
        align="center"
        sx={{
          cursor: isLink ? "pointer" : "default",
          ":hover": { opacity: isLink ? 0.75 : 1 },
        }}
      >
        {!isNil(parent) ? null : (
          <Box
            display={["none", null, null, "block"]}
            w="58px"
            alignSelf="flex-start"
          >
            <Link
              href={`/u/${puser.handle}`}
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={puser.image ?? "/images/default-icon.png"}
                boxSize="50px"
                m={1}
                sx={{ borderRadius: "50%" }}
              />
            </Link>
          </Box>
        )}
        <Box my={1} mx={2} flex={1}>
          <Flex
            align={[
              !isNil(tweet.title) ? "flex-start" : "center",
              null,
              null,
              "center",
            ]}
          >
            {!isNil(parent) ? null : (
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
            )}
            <Box flex={1}>
              {metadata.length === 0 ? null : <Flex>{metadata}</Flex>}
              {isNil(tweet.title) ? null : (
                <Flex align="center">
                  <Box
                    fontSize={["16px", null, null, "20px"]}
                    fontWeight="bold"
                  >
                    {tweet.title}
                  </Box>
                </Flex>
              )}
              <Flex fontSize="14px" color="#666" align="center">
                <Link
                  href={`/u/${puser.handle}`}
                  onClick={e => {
                    e.stopPropagation()
                  }}
                >
                  <Flex align="center">
                    {isNil(parent) ? null : (
                      <Link
                        href={`/u/${puser.handle}`}
                        onClick={e => {
                          e.stopPropagation()
                        }}
                      >
                        <Image
                          my={1}
                          src={puser.image ?? "/images/default-icon.png"}
                          boxSize="20px"
                          mr={2}
                          sx={{ borderRadius: "50%" }}
                        />
                      </Link>
                    )}
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
          <Box
            fontSize="14px"
            mt={2}
            className="markdown-body"
            pl={!isNil(parent) ? 0 : [10, null, null, 0]}
          >
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
              tweet.description ?? tweet.body
            )}
          </Box>
          {isNil(embed) ? null : (
            <Box
              mt={4}
              mb={main ? 2 : 0}
              sx={{
                ":hover": { opacity: 0.75 },
                border: "1px solid #ccc",
                borderRadius: "10px",
              }}
            >
              {embed}
            </Box>
          )}
        </Box>
        {isNil(embed) && !isNil(tweet.cover) ? (
          <Box
            sx={{
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundImage: tweet.cover,
            }}
            boxSize="100px"
            mx={4}
          />
        ) : (
          <Box mr={2} />
        )}
      </Flex>
      {!main ? null : (
        <Flex
          sx={{
            borderTop: "1px #ccc solid",
            borderBottom: "1px #ccc solid",
          }}
          py={3}
          fontSize="14px"
          pr={4}
          ml="70px"
        >
          <Box ml={4}>
            <b>{tweet.comments ?? 0}</b> Comments
          </Box>
          <Box
            ml={6}
            color="#333"
            sx={{
              cursor: "pointer",
              ":hover": { textDecoration: "underline" },
            }}
            onClick={() => setShowReposts(true)}
          >
            <b>{(tweet.reposts ?? 0) - (tweet.quotes ?? 0)}</b> Reposts
          </Box>
          <Link href={`/s/${tweet.id}/quotes`}>
            <Box
              ml={6}
              color="#333"
              sx={{ ":hover": { textDecoration: "underline" } }}
            >
              <b>{tweet.quotes ?? 0}</b> Quotes
            </Box>
          </Link>
          <Box
            onClick={() => setShowLikes(true)}
            ml={6}
            color="#333"
            sx={{
              cursor: "pointer",
              ":hover": { textDecoration: "underline" },
            }}
          >
            <b>{tweet.likes ?? 0}</b> Likes
          </Box>
          <Box flex={1} />
          {user?.address === puser.address ? (
            <>
              <Box ml={6}>Delete</Box>
            </>
          ) : null}
        </Flex>
      )}
      {!isNil(parent) ? null : (
        <Flex
          ml={[10, null, null, 0]}
          sx={{
            borderBottom: isNil(parent) ? "1px solid #ccc" : "0px",
          }}
          pt={main ? 3 : 0}
          pb={main ? 3 : 2}
        >
          <Box w="75px" />
          <Box>
            <Box as="i" className="far fa-comment" mr={2} />
            {tweet.comments}
          </Box>
          <Box
            ml={10}
            color={reposted ? "#00BA7C" : ""}
            sx={{
              cursor: isNil(user) ? "default" : "pointer",
              ":hover": {
                opacity: disabled || isNil(user) ? 1 : 0.75,
              },
            }}
            onClick={async e => {
              if (!disabled) {
                e.preventDefault()
                if (!disabled && !isNil(user)) setEditRepost(tweet)
              }
            }}
          >
            <Box as="i" className="fas fa-retweet" mr={2} />
            {tweet.reposts}
          </Box>
          <Box
            ml={10}
            color={!isNil(likes[tweet.id]) ? "#F91880" : ""}
            sx={{
              cursor:
                !isNil(likes[tweet.id]) || isNil(user) ? "default" : "pointer",
              ":hover": {
                opacity:
                  disabled || !isNil(likes[tweet.id]) || isNil(user) ? 1 : 0.75,
              },
            }}
            onClick={async e => {
              if (!disabled) {
                e.preventDefault()
                if (isNil(likes[tweet.id]) && !isNil(user)) {
                  const { like } = await likePost({ user, tweet })
                  setLikes(mergeLeft({ [tweet.id]: like }, likes))
                  setTweet()
                }
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
      )}
    </>
  )
  return content
}

export default Embed
