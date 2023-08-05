import { Image, Box, Flex } from "@chakra-ui/react"
import Link from "next/link"
import { isNil, map } from "ramda"
import { initNDB, login, logout } from "../lib/db"
import { useEffect, useState } from "react"
function Header({
  conf,
  link,
  title,
  func,
  user,
  setUser,
  identity,
  setIdentity,
  setEditUser,
  setEditStatus,
  setReplyTo,
  type = "default",
}) {
  const [isNotification, setIsNotification] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!isNil(user)) {
        const ndb = await initNDB()
        const items = await ndb.cget(
          "notifications",
          ["to", "==", user.address],
          ["viewed", "==", false],
          ["from", "!=", user.address],
          ["date", "desc"],
          1
        )
        setIsNotification(items.length > 0)
      } else {
        setIsNotification(false)
      }
    })()
  }, [user])

  const [userMenu, setUserMenu] = useState(false)
  const tabs = [
    { key: "edit", name: "Edit" },
    { key: "preview", name: "Preview" },
    { key: "post", name: "Post" },
  ]

  return (
    <Flex
      fontSize="18px"
      py={2}
      px={4}
      align="center"
      sx={{
        borderBottom: "1px solid #ccc",
      }}
      fontSize="14px"
    >
      <Link
        href={link ?? (!isNil(user) ? `/u/${user.handle}` : "/")}
        onClick={e => {
          if (!isNil(func)) {
            e.preventDefault()
            func()
          }
        }}
      >
        <Flex
          align="center"
          sx={{
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          <Box as="i" className="fas fa-arrow-left" mr={4} />
          <Box fontWeight="bold">{title ?? user?.name ?? "Witter"}</Box>
        </Flex>
      </Link>
      <Box flex={1} />
      {isNil(user) ? (
        <Box
          onClick={async () => {
            const { user, identity } = await login()
            if (!isNil(identity)) {
              setIdentity(identity)
              if (isNil(user)) {
                setEditUser(true)
              } else {
                setUser(user)
              }
            }
          }}
          mx={2}
          sx={{
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          Sign In
        </Box>
      ) : (
        <>
          {type === "default" ? (
            <Link href="/new">
              <Box
                onClick={async () => {
                  //if (!isNil(setReplyTo)) setReplyTo(null)
                  //setEditStatus(true)
                }}
                mx={2}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                New Post
              </Box>
            </Link>
          ) : (
            <>
              {map(v => {
                return (
                  <Box
                    onClick={async () => conf.setTab(v.key)}
                    mx={2}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                      textDecoration: v.key === conf.tab ? "underline" : "",
                    }}
                  >
                    {v.name}
                  </Box>
                )
              })(tabs)}
            </>
          )}
          <Link href="/notifications">
            <Box mx={2} sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}>
              <Flex
                bg={isNotification ? "#7A40B1" : "#999"}
                boxSize="30px"
                sx={{ borderRadius: "50%" }}
                justify="center"
                align="center"
              >
                <Box as="i" className="fas fa-bell" color="white" />
              </Flex>
            </Box>
          </Link>
          {!userMenu ? null : (
            <>
              <Box mx={2} color="#ccc">
                |
              </Box>
              <Box
                onClick={async () => {
                  if (confirm("Would you like to sign out?")) {
                    setUser(null)
                    logout()
                  }
                }}
                mx={2}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                Sign Out
              </Box>
            </>
          )}
          <Image
            onClick={() => setUserMenu(!userMenu)}
            src={user.image ?? "/images/default-icon.png"}
            boxSize="30px"
            ml={2}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
              borderRadius: "50%",
            }}
          />
        </>
      )}
    </Flex>
  )
}
export default Header
