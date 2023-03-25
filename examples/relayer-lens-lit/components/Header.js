import { Image, Box, Flex } from "@chakra-ui/react"
import lf from "localforage"
import { last, assoc, isNil } from "ramda"
import Link from "next/link"

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
  return (
    <>
      <Flex w="100%" justify="center" align="center" bg="white" color="#8B5CF6">
        <Flex
          justify="center"
          align="center"
          width="1000px"
          p={3}
          height="65px"
        >
          <Link href="/">
            <Box fontSize="20px">WeaveLens</Box>
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
                  const { identity, tx } = await sdk.createTempAddressWithLens()
                  if (tx.success) {
                    const uid = identity.linkedAccount
                    let _user = {
                      id: uid.split(":")[1] * 1,
                      handle: identity.profile.handle,
                      ...identity,
                      image: !isNil(identity.profile.imageURI)
                        ? `https://cloudflare-ipfs.com/ipfs/${last(
                            identity.profile.imageURI.split("/")
                          )}`
                        : null,
                    }
                    setUserMap(assoc(uid, _user, userMap))
                    setUser(_user)
                    await lf.setItem("user", _user)
                    const wuser = await sdk.get("users", uid)
                    if (isNil(wuser)) {
                      setEditUser(true)
                    } else {
                      setUserMap(assoc(uid, wuser, userMap))
                    }
                  } else {
                    alert("Something went wrong. Please try again.")
                  }
                } catch (e) {
                  alert(
                    "Something went wrong. You probably don't have a Lens Profile or your wallet is not connected to this domain."
                  )
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
              ) : (
                <Image src="/lens.webp" boxSize="20px" mr={3} />
              )}
              <Box fontWeight="bold">Sign In</Box>
            </Flex>
          ) : (
            <>
              <Image
                src={user.image}
                boxSize="35px"
                mx={2}
                title="Log Out"
                onClick={() => {
                  if (confirm("Would you like to sign out?")) {
                    setUser(null)
                    lf.removeItem("user")
                  }
                }}
                sx={{
                  borderRadius: "50%",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              />
            </>
          )}
        </Flex>
      </Flex>
      <Flex
        height="250px"
        color="white"
        bg="#8B5CF6"
        w="100%"
        fontSize="40px"
        justify="center"
        align="center"
      >
        A Fully Decentralized Social Dapp Demo
      </Flex>
    </>
  )
}
