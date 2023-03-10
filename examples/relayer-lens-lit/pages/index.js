import SDK from "weavedb-client"
import SDK2 from "weavedb-sdk"
import LitJsSdk from "@lit-protocol/sdk-browser"
import { utils, ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  reverse,
  compose,
  sortBy,
  values,
  assoc,
  map,
  indexBy,
  prop,
  isNil,
} from "ramda"
import { Button, Box, Flex, Input, ChakraProvider } from "@chakra-ui/react"

let sdk
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR

export default function Home() {
  const [nfts, setNFTs] = useState([])
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    ;(async () => {
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      const _sdk2 = new SDK2({
        contractTxId,
      })
      await _sdk2.initializeWithoutWallet()
      sdk = _sdk2
    })()
  }, [])

  const Header = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box flex={1}></Box>
      <Box
        mx={4}
        sx={{ textDecoration: "underline" }}
        onClick={async () => {
          try {
            const { identity, tx } = await sdk.createTempAddressWithLens()
            console.log(tx)
          } catch (e) {
            alert("something went wrong")
            console.log(e)
          }
        }}
      >
        login
      </Box>
    </Flex>
  )

  const Footer = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
      >
        Contract Transactions
      </Box>
    </Flex>
  )

  return (
    <ChakraProvider>
      <Flex direction="column" align="center" fontSize="12px">
        <Header />
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
