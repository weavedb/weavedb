import { Box, Flex, Image } from "@chakra-ui/react"
import Link from "next/link"
import { useRouter } from "next/router"
export default function Header() {
  const router = useRouter()
  return (
    <Flex px={2} mt={6} pt={4} sx={{ borderTop: "1px solid #ccc" }}>
      <Link target="_blank" href="https://weavedb.dev">
        WeaveDB © {new Date().getFullYear()}
      </Link>
    </Flex>
  )
}
