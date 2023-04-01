import { Image, Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
import Jdenticon from "react-jdenticon"
export default function Profile({ pageUser, user, setName, setEditUser }) {
  const isUser = !isNil(user) && !isNil(pageUser) && user.id === pageUser.uid
  return (
    <Flex
      w={["100%", null, "350px"]}
      direction={["row", null, "column"]}
      align="center"
    >
      {isNil(pageUser) ? (
        <>
          <Image
            src="/weavedb.jpg"
            boxSize={["50px", null, "200px"]}
            mx={2}
            mt={["20px", null, "-50px"]}
            mb="20px"
            borderRadius={[0, null, "20px"]}
          />
          <Box>
            <Flex
              justify={["flex-start", null, "center"]}
              fontSize="18px"
              m={2}
              color="#8B5CF6"
              w={["100%", null, "200px"]}
            >
              Built with WeaveDB
            </Flex>
            <Flex
              justify={["flex-start", null, "center"]}
              fontSize="12px"
              mx={2}
              mb={3}
              color="#999"
              w={["100%", null, "200px"]}
            >
              <Box as="a" href={`https://weavedb.dev`} target="_blank">
                weavedb.dev
              </Box>
            </Flex>
          </Box>
        </>
      ) : (
        <>
          <Box
            mr={3}
            boxSize={["50px", null, "200px"]}
            mt={["20px", null, "-50px"]}
            mb="20px"
            bg="white"
            sx={{
              borderRadius: ["0", null, "20px"],
              cursor: isUser ? "pointer" : "default",
            }}
            onClick={() => {
              if (isUser) {
                setName(pageUser.name)
                setEditUser(true)
              }
            }}
          >
            <Box display={["block", null, "none"]}>
              <Jdenticon size="50" value={pageUser?.uid ?? "weavedb"} />
            </Box>
            <Box display={["none", null, "block"]}>
              <Jdenticon size="200" value={pageUser?.uid ?? "weavedb"} />
            </Box>
          </Box>
          <Box>
            <Flex
              justify={["flex-start", null, "center"]}
              fontSize="18px"
              m={2}
              color="#8B5CF6"
              w={["100%", null, "200px"]}
            >
              {pageUser.name}
            </Flex>
            <Flex
              justify={["flex-start", null, "center"]}
              fontSize="12px"
              mx={2}
              mb={3}
              color="#999"
              w={["100%", null, "200px"]}
            >
              <Box>{pageUser.handle.slice(0, 10)}</Box>
            </Flex>
          </Box>
        </>
      )}
    </Flex>
  )
}
