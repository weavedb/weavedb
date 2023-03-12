import { Image, Box, Flex } from "@chakra-ui/react"
import { isNil } from "ramda"
export default function Profile({ pageUser, user, setName, setEditUser }) {
  const isUser =
    !isNil(user) && `lens:${user.id}` === pageUser.uid ? "pointer" : "default"
  return (
    <Box w="350px">
      {isNil(pageUser) ? (
        <>
          <Image
            src="/weavedb.jpg"
            boxSize="200px"
            mx={2}
            mt="-50px"
            sx={{ borderRadius: "20px" }}
          />
          <Flex
            justify="center"
            fontSize="18px"
            m={2}
            color="#8B5CF6"
            w="200px"
          >
            Built with WeaveDB
          </Flex>
          <Flex justify="center" fontSize="12px" mx={2} color="#999" w="200px">
            <Box as="a" href={`https://weavedb.dev`} target="_blank">
              weavedb.dev
            </Box>
          </Flex>
        </>
      ) : (
        <Box w="350px">
          <>
            <Image
              src={pageUser.image}
              boxSize="200px"
              mx={2}
              mt="-50px"
              sx={{
                borderRadius: "20px",
                cursor: isUser ? "pointer" : "default",
              }}
              onClick={() => {
                if (isUser) {
                  setName(pageUser.name)
                  setEditUser(true)
                }
              }}
            />
            <Flex
              justify="center"
              fontSize="18px"
              m={2}
              color="#8B5CF6"
              w="200px"
            >
              {pageUser.name}
            </Flex>
            <Flex
              justify="center"
              fontSize="12px"
              mx={2}
              color="#999"
              w="200px"
            >
              <Box
                as="a"
                href={`https://lenster.xyz/u/${pageUser.handle}`}
                target="_blank"
              >
                {pageUser.handle}
              </Box>
            </Flex>
          </>
        </Box>
      )}
    </Box>
  )
}
