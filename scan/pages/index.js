import { Flex, Box, Icon } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { HB } from "wao"
import { map } from "ramda"
import Link from "next/link"
import Header from "../components/Header"
import Main from "../components/Main"

export default function Home() {
  const [nodes, setNodes] = useState([
    { name: "ZKDB Demo", url: "https://db-demo.wdb.ae:10003" },
    { name: "Localhost", url: "http://localhost:6364" },
  ])

  return (
    <>
      <Header />
      <Main>
        <Flex justify="center" fontSize="14px">
          <Box w="100%">
            <Box mt={4} mb={2} px={2} fontWeight="bold" color="#777">
              Nodes
            </Box>
            {map(v => (
              <Link href={`/node?url=${v.url}`}>
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
                  <Box p={2}>{v.name}</Box>
                  <Box flex={1} />
                  <Box p={2}>{v.url}</Box>
                </Flex>
              </Link>
            ))(nodes)}
          </Box>
        </Flex>
      </Main>
    </>
  )
}
