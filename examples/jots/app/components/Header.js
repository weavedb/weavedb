import { Image, Box, Flex } from "@chakra-ui/react"
import { useRouter } from "next/router"
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
  setEditPost,
  setReplyTo,
  type = "default",
  wide = false,
}) {
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

  const [userMenu, setUserMenu] = useState(false)
  const tabs = [
    { key: "edit", name: "Edit" },
    { key: "preview", name: "Preview" },
    { key: "post", name: "Post" },
  ]

  return (
    <Flex
      bg="white"
      w="100%"
      justify="center"
      height="50px"
      sx={{
        zIndex: 99,
        position: "fixed",
        top: 0,
        left: 0,
        borderBottom: !wide ? "" : "1px solid #ccc",
      }}
    >
      <Flex
        fontSize="14px"
        w="100%"
        maxW="760px"
        align="center"
        py={2}
        px={4}
        sx={{
          borderBottom: wide ? "" : "1px solid #ccc",
          borderX: wide ? "" : "1px solid #ccc",
        }}
      >
        <Box
          onClick={e => {
            if (!isNil(func)) {
              e.preventDefault()
              func()
            } else {
              router.back()
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
            <Box fontSize="18px" fontWeight="bold">
              {title ?? user?.name ?? "Jots Testnet"}
            </Box>
          </Flex>
        </Box>
        <Box flex={1} />
        <Link href={`/`}>
          <Box
            display={["none", "block"]}
            mx={2}
            sx={{
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            Home
          </Box>
        </Link>
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
              <Box
                display={["none", "block"]}
                onClick={() => setEditPost(true)}
                mx={2}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                New Post
              </Box>
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
              <Box
                mx={2}
                display={["none", "block"]}
                sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
              >
                <Flex
                  bg={count > 0 ? "#1D9BF0" : "#999"}
                  boxSize="30px"
                  sx={{ borderRadius: "50%", position: "relative" }}
                  justify="center"
                  align="center"
                >
                  <Box as="i" className="fas fa-bell" color="white" />
                  {count > 0 ? (
                    <Box
                      fontSize="10px"
                      sx={{
                        borderRadius: "3px",
                        position: "absolute",
                        bottom: "-5px",
                        left: "22px",
                      }}
                      px={1}
                      bg="crimson"
                      color="white"
                    >
                      {count}
                    </Box>
                  ) : null}
                </Flex>
              </Box>
            </Link>
            <Flex align="center" sx={{ position: "relative" }}>
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
              {!userMenu ? null : (
                <Flex
                  py={2}
                  bg="#333"
                  color="white"
                  sx={{
                    border: "white 1px solid",
                    borderRadius: "7px",
                    width: "175px",
                    position: "absolute",
                    right: 0,
                    top: "55px",
                    zIndex: 1000,
                  }}
                  direction="column"
                >
                  <Link href={`/u/${user.handle}`}>
                    <Box
                      display={["none", "block"]}
                      py={2}
                      px={4}
                      sx={{
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={() => setUserMenu(false)}
                    >
                      Profile
                    </Box>
                  </Link>
                  <Box
                    onClick={async () => {
                      if (confirm("Would you like to sign out?")) {
                        setUser(null)
                        logout()
                        setUserMenu(false)
                      }
                    }}
                    py={2}
                    px={4}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                  >
                    Sign Out
                  </Box>
                  {isNil(process.env.NEXT_PUBLIC_EXPLORER) ? null : (
                    <>
                      <Box as="hr" m={2} />
                      <Link
                        href={process.env.NEXT_PUBLIC_EXPLORER}
                        target="_blank"
                      >
                        <Box
                          py={2}
                          px={4}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                          onClick={() => setUserMenu(false)}
                        >
                          WeaveDB Explorer
                        </Box>
                      </Link>
                    </>
                  )}
                </Flex>
              )}
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  )
}
export default Header
