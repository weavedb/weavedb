import { Image, Box, Flex } from "@chakra-ui/react"
import lf from "localforage"
import { last, assoc, isNil } from "ramda"
import Link from "next/link"
import Jdenticon from "react-jdenticon"

export default function Header({
  userMap,
  setUser,
  setUserMap,
  setEditUser,
  user,
  setIsModal,
}) {
  return (
    <>
      <Flex w="100%" justify="center" align="center" bg="white" color="#2265F1">
        <Flex
          justify="center"
          align="center"
          width="1000px"
          p={3}
          height="65px"
        >
          <Link href="/">
            <Box fontSize="20px">NextID x WeaveDB</Box>
          </Link>
          <Box flex={1}></Box>
          {isNil(user) ? (
            <Flex
              color="white"
              bg="#2265F1"
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
              onClick={() => setIsModal(true)}
            >
              <Box fontWeight="bold">Sign In</Box>
            </Flex>
          ) : (
            <Flex align="center">
              <Flex>
                <Link href={`/u/${user.handle}`}>
                  <Box mx={2}>{user.handle}</Box>
                </Link>
              </Flex>
              <Box
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
              >
                {isNil(user.image) ? (
                  <Jdenticon size="35" value={user.id} />
                ) : (
                  <Image
                    src={user.image}
                    boxSize="35px"
                    sx={{ borderRadius: "50%" }}
                  />
                )}
              </Box>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        height="250px"
        color="white"
        bg="#2265F1"
        w="100%"
        fontSize="40px"
        justify="center"
        align="center"
      >
        A Fully Decentralized Twitter Demo
      </Flex>
    </>
  )
}
