import { Image, Box, Flex, Input } from "@chakra-ui/react"
import { assoc, isNil } from "ramda"

export default function EditUser({
  editUser,
  setEditUser,
  setName,
  name,
  user,
  sdk,
  userMap,
  pageUser,
  setUserMap,
  setPageUser,
  toast,
}) {
  return !editUser ? null : (
    <Flex
      bg="rgba(0,0,0,.5)"
      align="center"
      justify="center"
      w="100%"
      h="100%"
      sx={{
        zIndex: 100,
        position: "fixed",
        top: 0,
        left: 0,
        cursor: "pointer",
      }}
      onClick={() => {
        if (!isNil(userMap[`lens:${user.id}`])) {
          if (!isNil(user)) setEditUser(false)
        }
      }}
    >
      <Box
        wrap="wrap"
        p={4}
        justify="center"
        bg="white"
        sx={{ borderRadius: "10px", cursor: "default" }}
        onClick={e => e.stopPropagation()}
        maxW="700px"
        width="100%"
        m={4}
      >
        <Flex align="center">
          <Image
            mr={4}
            src={user.image}
            boxSize="40px"
            sx={{ borderRadius: "50%" }}
          />
          <Input
            flex={1}
            placeholder="Enter your name."
            value={name}
            onChange={e => setName(e.target.value)}
            sx={{ border: "1px solid #ddd" }}
          />
        </Flex>
        <Flex justify="flex-end" mt={4} align="center">
          <Flex
            color="white"
            bg={name.length > 100 ? "#999" : "#8B5CF6"}
            justify="center"
            align="center"
            w="120px"
            h="35px"
            sx={{
              cursor: name.length > 100 ? "default" : "pointer",
              borderRadius: "3px",
              ":hover": { opacity: 0.75 },
            }}
            onClick={async e => {
              if (/^\s*$/.test(name)) return alert("Enter your name")
              if (name.length > 100) {
                return alert("Name cannot be more than 100 characters.")
              }
              const uid = `lens:${user.id}`
              const new_user = {
                image: user.image,
                name,
                uid,
                handle: user.handle,
              }
              const tx = await sdk.set(new_user, "users", uid, {
                wallet: `lens:${user.id}`,
                privateKey: user.privateKey,
              })
              if (tx.success) {
                setName("")
                setEditUser(false)
                setUserMap(assoc(uid, new_user, userMap))
                if (!isNil(setPageUser))
                  setPageUser(assoc("name", name, pageUser))
                toast({
                  description: "Updated!",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                  position: "bottom-right",
                })
              } else {
                console.log(tx)
                toast({
                  description: "Something went wrong...",
                  status: "erorr",
                  duration: 3000,
                  isClosable: true,
                  position: "bottom-right",
                })
              }
            }}
          >
            Update
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}
