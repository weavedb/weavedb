import { useState, useEffect } from "react"
import Link from "next/link"
import DB from "weavedb-client"
import { Box, Flex, Image } from "@chakra-ui/react"
import { concat, last, isNil, map, includes } from "ramda"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Header from "components/Header"
import Footer from "components/Footer"
import { nodes } from "lib/nodes"
dayjs.extend(relativeTime)
let db = null
let to = null
export default function Home() {
  return (
    <>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <Header />
      <Box height="50px" />
      <Flex
        p={6}
        fontSize="12px"
        w="100%"
        minH="calc(100% - 50px)"
        bg="#F2F2F2"
        justify="center"
      >
        <Box w="100%" maxW="1400px">
          <Box px={2} mb={2} fontWeight="bold" color="#666" fontSize="16px">
            Rollup Nodes
          </Box>
          {map(v => {
            return (
              <Link href={`/node/${v.key}`}>
                <Box
                  w="100%"
                  bg="white"
                  py={2}
                  px={6}
                  sx={{ borderRadius: "10px", ":hover": { opacity: 0.75 } }}
                  mb={4}
                >
                  <Flex>
                    <Box flex={1}>
                      <Box sx={{ color: "#999" }}>Node Endopint</Box>
                      <Box sx={{ fontSize: "14px" }}>{v.endpoint}</Box>
                    </Box>
                    <Box
                      mx={4}
                      py={2}
                      sx={{ borderRight: "1px solid #ddd" }}
                    ></Box>
                    <Box flex={1}>
                      <Box sx={{ color: "#999" }}>Rollup Network</Box>
                      <Box sx={{ fontSize: "14px" }}>{v.network}</Box>
                    </Box>
                  </Flex>
                </Box>
              </Link>
            )
          })(nodes)}
          <Footer />
        </Box>
      </Flex>
    </>
  )
}
