import { Flex, Box, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { map } from "ramda"
import Link from "next/link"
import Header from "../components/Header"
import Main from "../components/Main"
import { useRouter } from "next/router"
import { FaAngleRight } from "react-icons/fa6"

export default function Home() {
  const router = useRouter()
  const [procs, setProcs] = useState([])
  useEffect(() => {
    void (async () => {
      if (router.query.url) {
        try {
          const hb = new HB({ url: router.query.url })
          const { body } = await hb.get({ path: "/status" })
          const { processes } = JSON.parse(body)
          setProcs(processes)
        } catch (e) {
          console.log(e)
        }
      }
    })()
  }, [router])
  return (
    <>
      <Header />
      <Main>
        <Flex justify="center" fontSize="14px">
          <Box w="100%">
            <Flex mt={4} mx={2} align="center">
              <Link href={`/`}>
                <Box css={{ textDecoration: "underline" }}>Nodes</Box>
              </Link>
              <Icon as={FaAngleRight} mx={2} />
              <Box>{router.query.url}</Box>
            </Flex>
            <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
              Databases
            </Box>
            {map(v => (
              <Link href={`/db/${v}?url=${router.query.url}`}>
                <Flex
                  px={2}
                  bg="white"
                  my={4}
                  w="100%"
                  css={{
                    cursor: "pointer",
                    _hover: { opacity: 0.75 },
                    borderRadius: "5px",
                  }}
                >
                  <Box p={2}>{v}</Box>
                  <Box flex={1} />
                </Flex>
              </Link>
            ))(procs)}
          </Box>
        </Flex>
      </Main>
    </>
  )
}
