import { Box, Flex, Image } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { postStatus } from "../lib/db"
import { last, map, isNil, assoc, path, concat } from "ramda"
import { useRouter } from "next/router"
import Link from "next/link"
import { initDB, checkUser, getUsers } from "../lib/db"

const limit = 10
export default function Reposts({ setShowReposts, post }) {
  const [users, setUsers] = useState([])
  const [reposts, setReposts] = useState([])
  const [isNext, setIsNext] = useState([])
  useEffect(() => {
    ;(async () => {
      const db = await initDB()
      const _reposts = await db.cget(
        "posts",
        ["repost", "==", post.id],
        ["quote", "==", false],
        ["date", "desc"],
        limit
      )
      setReposts(_reposts)
      setIsNext(_reposts.length >= limit)
    })()
  }, [])
  useEffect(() => {
    ;(async () => {
      await getUsers({
        ids: map(path(["data", "owner"]), reposts),
        users,
        setUsers,
      })
    })()
  }, [reposts])

  return (
    <Flex
      h="100%"
      w="100%"
      bg="rgba(0,0,0,0.5)"
      sx={{ position: "fixed", top: 0, left: 0, zIndex: 100 }}
      align="center"
      justify="center"
    >
      <Box
        onClick={e => e.stopPropagation()}
        bg="white"
        m={4}
        maxW="550px"
        width="100%"
        maxH="70%"
        sx={{ borderRadius: "5px", overflowY: "auto" }}
        fontSize="14px"
      >
        <Flex fontSize="18px" mx={4} my={2}>
          <Box fontWeight="bold" mx={2}>
            Reposted by
          </Box>
          <Box flex={1} />
          <Box
            onClick={() => setShowReposts(false)}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            <Box as="i" className="fas fa-times" />
          </Box>
        </Flex>
        {map(v => {
          const u = users[v.data.owner] ?? {}
          return isNil(u) ? null : (
            <Link href={`/u/${u.handle}`}>
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
        })(reposts)}
        {!isNext ? null : (
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
                const _reposts = await db.cget(
                  "posts",
                  ["repost", "==", post.id],
                  ["quote", "==", false],
                  ["date", "desc"],
                  ["startAfter", last(reposts)],
                  limit
                )
                setReposts(concat(reposts, _reposts))
                setIsNext(_reposts.length >= limit)
              }}
            >
              Load More
            </Flex>
          </Flex>
        )}
      </Box>
    </Flex>
  )
}
