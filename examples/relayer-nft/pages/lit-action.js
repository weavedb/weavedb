import LitJsSdk from "@lit-protocol/sdk-browser"
import SDK from "weavedb-client"
import SDK2 from "weavedb-sdk"
import { ethers } from "ethers"
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
      sdk = _sdk
      setNFTs(await _sdk.get("nft", ["tokenID", "desc"]))
    })()
  }, [])

  const Header = () => (
    <Flex justify="center" width="500px" p={3}>
      <Box flex={1}>
        {posting
          ? "posting..."
          : "Mint NFT and post a Message with your tokenID!"}
      </Box>
      <Box
        as="a"
        target="_blank"
        sx={{ textDecoration: "underline" }}
        href={`https://goerli.etherscan.io/token/${nftContractAddr}#writeContract`}
      >
        mint
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

  const Post = () => {
    const [message, setMessage] = useState("")
    const [tokenID, setTokenID] = useState("")
    return (
      <Flex justify="center" width="500px" mb={5}>
        <Input
          disabled={posting}
          w="100px"
          placeholder="tokenID"
          sx={{ borderRadius: "3px 0 0 3px" }}
          value={tokenID}
          onChange={e => {
            if (!Number.isNaN(+e.target.value)) {
              setTokenID(e.target.value)
            }
          }}
        />
        <Input
          disabled={posting}
          flex={1}
          placeholder="Message"
          sx={{ borderRadius: "0" }}
          value={message}
          onChange={e => {
            setMessage(e.target.value)
          }}
        />
        <Button
          sx={{ borderRadius: "0 3px 3px 0" }}
          onClick={async () => {
            if (!posting) {
              if (tokenID === "") {
                alert("enter your tokenID")
                return
              }
              if (/^\s*$/.test(message)) {
                alert("enter message")
                return
              }
              setPosting(true)
              try {
                const provider = new ethers.providers.Web3Provider(
                  window.ethereum,
                  "any"
                )
                await provider.send("eth_requestAccounts", [])
                const addr = await provider.getSigner().getAddress()

                const params = await sdk.sign(
                  "set",
                  { tokenID: +tokenID, text: message },
                  "nft",
                  tokenID,
                  {
                    wallet: addr,
                    jobID: "nft-lit-action",
                  }
                )

                const res = await fetch("/api/lit-action", {
                  method: "POST",
                  body: JSON.stringify(params),
                }).then(v => v.json())
                console.log(res)
                if (!res.success) {
                  alert("Something went wrong")
                } else {
                  setMessage("")
                  setTokenID("")
                  setNFTs(
                    compose(
                      reverse,
                      sortBy(prop("tokenID")),
                      values,
                      assoc(res.tx.docID, res.tx.doc),
                      indexBy(prop("tokenID"))
                    )(nfts)
                  )
                }
              } catch (e) {
                alert("something went wrong")
              }
              setPosting(false)
            }
          }}
        >
          Post
        </Button>
      </Flex>
    )
  }

  const Messages = () => (
    <Box>
      <Flex bg="#EDF2F7" w="500px">
        <Flex justify="center" p={2} w="75px">
          tokenID
        </Flex>
        <Flex justify="center" p={2} w="100px">
          Owner
        </Flex>
        <Box p={2} flex={1}>
          Message
        </Box>
      </Flex>
      {map(v => (
        <Flex
          sx={{ ":hover": { bg: "#EDF2F7" } }}
          w="500px"
          as="a"
          target="_blank"
          href={`https://goerli.etherscan.io/token/${nftContractAddr}?a=${v.owner}`}
        >
          <Flex justify="center" p={2} w="75px">
            {v.tokenID}
          </Flex>
          <Flex justify="center" p={2} w="100px">
            {v.owner.slice(0, 5)}...{v.owner.slice(-3)}
          </Flex>
          <Box p={2} flex={1}>
            {v.text}
          </Box>
        </Flex>
      ))(nfts)}
    </Box>
  )

  return (
    <ChakraProvider>
      <Flex direction="column" align="center" fontSize="12px">
        <Header />
        <Post />
        <Messages />
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
