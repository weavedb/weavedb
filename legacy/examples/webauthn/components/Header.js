import { useEffect, useState } from "react"
import { Image, Box, Flex } from "@chakra-ui/react"
import lf from "localforage"
import { last, assoc, isNil } from "ramda"
import Link from "next/link"
import Jdenticon from "react-jdenticon"

export default function Header({
  sdk,
  userMap,
  setLogging,
  setUser,
  setUserMap,
  setEditUser,
  logging,
  user,
}) {
  const [_identity, setIdentity] = useState(null)
  useEffect(() => {
    ;(async () => {
      setIdentity((await lf.getItem("webauthn")) || null)
    })()
  }, [])
  return (
    <>
      <Flex w="100%" justify="center" align="center" bg="white" color="#8B5CF6">
        <Flex
          justify="center"
          align="center"
          maxW="1000px"
          width="100%"
          p={3}
          height="65px"
        >
          <Link href="/">
            <Box fontSize="20px" pl={3}>
              WeaveDB WebAuthn
            </Box>
          </Link>
          <Box flex={1}></Box>
          {isNil(user) ? (
            <Flex
              color="white"
              bg="#8B5CF6"
              justify="center"
              align="center"
              w="120px"
              h="35px"
              mx={4}
              sx={{
                cursor: "pointer",
                borderRadius: "3px",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                try {
                  setLogging(true)
                  const { identity, tx } =
                    await sdk.createTempAddressWithWebAuthn(_identity)
                  if (tx.success) {
                    const uid = identity.id
                    let _user = {
                      id: identity.linkedAccount,
                      handle: identity.id.slice(7),
                      ...identity,
                    }
                    setUserMap(assoc(uid, _user, userMap))
                    setUser(_user)
                    await lf.setItem("user", _user)
                    const wuser = await sdk.get("users", uid)
                    if (isNil(wuser)) {
                      setEditUser(true)
                    } else {
                      console.log(tx)
                      setUserMap(assoc(uid, wuser, userMap))
                    }
                    setIdentity(identity.webauthn)
                    setTimeout(
                      async () =>
                        await lf.setItem("webauthn", identity.webauthn),
                      0
                    )
                  } else {
                    alert("Something went wrong. Please try again.")
                  }
                } catch (e) {
                  alert("Something went wrong. Please try again.")
                  console.log(e)
                }
                setLogging(false)
              }}
            >
              {logging ? (
                <Box
                  as="i"
                  className="fas fa-circle-notch fa-spin"
                  mr={3}
                  fontSize="16px"
                />
              ) : null}
              <Box fontWeight="bold">Sign In</Box>
            </Flex>
          ) : (
            <>
              <Box
                mr={4}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                onClick={() => {
                  if (confirm("Would you like to sign out?")) {
                    setUser(null)
                    lf.removeItem("user")
                  }
                }}
              >
                Log Out
              </Box>
              <Link href={`/u/${user.handle}`}>
                <Box
                  boxSize="35px"
                  mx={2}
                  title={user.handle}
                  sx={{
                    borderRadius: "50%",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                >
                  <Jdenticon size="35" value={user.id} />
                </Box>
              </Link>
            </>
          )}
        </Flex>
      </Flex>
      <Flex
        height={["120px", null, "250px"]}
        color="white"
        bg="#8B5CF6"
        w="100%"
        p={6}
        fontSize={["25px", null, "40px"]}
        justify="center"
        align="center"
      >
        WeaveDB WebAuthn Demo
      </Flex>
    </>
  )
}
