import { Image, Box, Flex } from "@chakra-ui/react"
import { useRouter } from "next/router"
import Link from "next/link"
import { isNil, map } from "ramda"
import { initNDB, login, logout } from "../lib/db"
import { useEffect, useState } from "react"

function Footer({ user, setEditPost, setReplyTo, wide = false }) {
  const router = useRouter()
  const [count, setCount] = useState(0)

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        const ndb = await initNDB()
        const count = await ndb.get("counts", user.address)
        setCount(isNil(count) ? 0 : count.count)
      } else {
        setCount(0)
      }
    })()
  }, [user])

  return (
    <Box
      display={isNil(user) ? "none" : ["flex", "none"]}
      bg="white"
      w="100%"
      justify="center"
      height="50px"
      sx={{
        zIndex: 98,
        position: "fixed",
        bottom: 0,
        left: 0,
        borderTop: !wide ? "" : "1px solid #ccc",
      }}
    >
      <Flex
        fontSize="14px"
        w="100%"
        maxW="760px"
        align="center"
        py={2}
        sx={{
          borderTop: wide ? "" : "1px solid #ccc",
          borderX: wide ? "" : "1px solid #ccc",
        }}
      >
        {map(v => (
          <Flex
            justify="center"
            flex={1}
            mx={2}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
            onClick={() => {
              if (!isNil(v.func)) {
                v.func()
              } else {
                router.push(v.link)
              }
            }}
          >
            <Box
              fontSize="20px"
              as="i"
              className={v.icon}
              sx={{ position: "relative" }}
            >
              {v.count && count > 0 ? (
                <Box
                  fontSize="10px"
                  sx={{
                    borderRadius: "3px",
                    position: "absolute",
                    bottom: "-5px",
                    right: "-20px",
                    cursor: "pointer",
                    ":hover": {
                      opacity: 0.75,
                    },
                  }}
                  px={1}
                  py="2px"
                  bg="crimson"
                  color="white"
                >
                  {count}
                </Box>
              ) : null}
            </Box>
          </Flex>
        ))([
          { icon: "fas fa-home", link: "/" },
          { icon: "far fa-user", link: `/u/${user?.handle}` },
          { count: true, icon: "far fa-bell", link: "/notifications" },
          { icon: "fas fa-edit", func: () => setEditPost(true) },
        ])}
      </Flex>
    </Box>
  )
}
export default Footer
