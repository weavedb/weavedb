import { Flex, Box } from "@chakra-ui/react"
import Link from "next/link"
import { Icon } from "@chakra-ui/react"
import { FaGithub, FaXTwitter, FaDiscord } from "react-icons/fa6"

export default function Footer() {
  return (
    <Flex justify="center" w="100%" bg="white">
      <Flex w="100%" maxW="1360px" p={4}>
        <Box flex={1} />
        <Flex justify="center" align="center">
          <Link target="_blonk" href="https://github.com/weavedb">
            <Icon fontSize="20px" as={FaGithub} mx={2} />
          </Link>
          <Link target="_blonk" href="https://x.com/weave_db">
            <Icon fontSize="20px" as={FaXTwitter} mx={2} />
          </Link>
          <Link target="_blonk" href="https://discord.com/invite/YMe3eqf69M">
            <Icon fontSize="20px" as={FaDiscord} mx={2} />
          </Link>
        </Flex>
      </Flex>
    </Flex>
  )
}
