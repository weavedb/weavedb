import Link from "next/link"
import Jdenticon from "react-jdenticon"
import { Image, Box, Flex } from "@chakra-ui/react"
import dayjs from "dayjs"
import {
  last,
  map,
  isNil,
  reject,
  propEq,
  pluck,
  concat,
  compose,
  mergeRight,
  indexBy,
  prop,
  uniq,
} from "ramda"
import Footer from "./Footer"

export default function Posts({
  limit,
  posts,
  user,
  userMap,
  sdk,
  setPosts,
  toast,
  setEdit,
  next,
  setNext,
  setUserMap,
  pageUser,
}) {
  return (
    <Box flex={1}>
      {isNil(user) || (!isNil(pageUser) && pageUser.uid !== user.id) ? null : (
        <Flex
          align="center"
          w="100%"
          bg="white"
          height="75px"
          mt={[0, null, 6]}
          mb={[2, null, 6]}
          p={4}
          sx={{ border: "1px solid #ddd", borderRadius: "5px" }}
        >
          <Box boxSize="30px">
            <Jdenticon size="30" value={user?.id ?? "weavedb"} />
          </Box>
          <Flex
            ml={4}
            bg="#eee"
            px={4}
            py={2}
            align="center"
            w="100%"
            sx={{
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
            onClick={() => setEdit(true)}
          >
            <Box as="i" mr={2} className="fas fa-edit" />
            What's happening?
          </Flex>
        </Flex>
      )}

      {map(v => {
        const _user = userMap[v.user] || { handle: "" }
        return (
          <Flex
            align="flex-start"
            w="100%"
            bg="white"
            my={[2, null, 6]}
            p={4}
            sx={{ border: "1px solid #ddd", borderRadius: "5px" }}
          >
            <Box boxSize="30px" my={4} as="a" href={`/u/${_user.handle}`}>
              <Jdenticon size="30" value={_user?.uid ?? "weavedb"} />
            </Box>
            <Box px={4} pt={2} align="left" w="100%">
              <Flex fontSize="16px">
                <Link href={`/u/${_user.handle}`}>
                  <Box>{_user.name}</Box>
                </Link>
                <Box flex={1} />
                <Box>
                  {isNil(user) || v.user !== user.id ? null : (
                    <Box
                      className="fas fa-ellipsis-h"
                      sx={{
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={async () => {
                        if (
                          !isNil(user) &&
                          v.user === user.id &&
                          confirm("Would you like to delete the post?")
                        ) {
                          const tx = await sdk.delete(
                            "posts",
                            `${v.user}:${v.id}`,
                            user
                          )
                          if (tx.success) {
                            setPosts(reject(propEq("id", v.id)), posts)
                            toast({
                              description: "Deleted!",
                              status: "warning",
                              duration: 3000,
                              isClosable: true,
                              position: "bottom-right",
                            })
                          } else {
                            toast({
                              description: "Something went wrong...",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                              position: "bottom-right",
                            })
                          }
                        }
                      }}
                    />
                  )}
                </Box>
              </Flex>
              <Flex fontSize="12px">
                <Box mr={2}>
                  <Box target="_blank">{_user.handle.slice(0, 10)}</Box>
                </Box>
                <Box as="span" color="#999">
                  {dayjs(v.date).format("MMM DD")}
                </Box>
              </Flex>
              <Box sx={{ lineHeight: "180%" }} fontSize="16px" my={4}>
                {v.body}
              </Box>
            </Box>
          </Flex>
        )
      })(posts)}
      {isNil(next) ? null : (
        <Flex
          bg="#8B5CF6"
          color="white"
          justify="center"
          p={2}
          sx={{
            borderRadius: "3px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
          onClick={async () => {
            const _posts = !isNil(pageUser)
              ? await sdk.cget(
                  "posts",
                  ["user", "==", `${pageUser.uid}`],
                  ["date", "desc"],
                  ["startAfter", next],
                  limit
                )
              : await sdk.cget(
                  "posts",
                  ["date", "desc"],
                  ["startAfter", next],
                  limit
                )
            setPosts(concat(posts, pluck("data", _posts)))
            setUserMap(
              compose(
                mergeRight(userMap),
                indexBy(prop("uid"))
              )(
                await sdk.get("users", [
                  "uid",
                  "in",
                  compose(uniq, pluck("user"), pluck("data"))(_posts),
                ])
              )
            )
            if (_posts.length >= limit) {
              setNext(last(_posts))
            } else {
              setNext(null)
            }
          }}
        >
          Load More...
        </Flex>
      )}
      <Footer />
    </Box>
  )
}
