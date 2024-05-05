import { Box, Flex, Image } from "@chakra-ui/react"
import Link from "next/link"
import { useRouter } from "next/router"
export default function Header() {
  const router = useRouter()
  return (
    <Flex
      justify="center"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        borderBottom: "1px solid #eee",
      }}
      height="50px"
      align="center"
      w="100%"
      px={6}
      bg="#fff"
      justify="center"
    >
      <Flex w="100%" maxW="1400px" fontSize="14px">
        <Link href="/">
          <Flex
            as="span"
            mx={2}
            align="center"
            fontWeight="bold"
            fontSize="20px"
          >
            <Image boxSize="24px" src="/logo.png" mr={3} />
            WeaveDB Scan
          </Flex>
        </Link>
        <Box flex={1} />
        <Flex
          bg="#763AAC"
          align="center"
          mx={2}
          px={4}
          color="white"
          sx={{
            borderRadius: "5px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
          onClick={() => {
            router.push("/node/alpha")
          }}
        >
          ALPHA
        </Flex>
        <Flex mx={2} align="center">
          |
        </Flex>
        <Flex
          align="center"
          mx={2}
          sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
          onClick={() => {
            alert("Coming Soon")
          }}
        >
          Sign In
        </Flex>
      </Flex>
    </Flex>
  )
}
