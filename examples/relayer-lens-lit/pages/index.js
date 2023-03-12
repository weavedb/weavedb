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
  last,
} from "ramda"
import {
  Image,
  Button,
  Box,
  Flex,
  Input,
  ChakraProvider,
} from "@chakra-ui/react"
let sdk
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR
const lens = {
  contract: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
  pkp_address: "0xF810D4a6F0118E6a6a86A9FBa0dd9EA669e1CC2E".toLowerCase(),
  pkp_publicKey:
    "0x04e1d2e8be025a1b8bb10b9c9a5ae9f11c02dbde892fee28e5060e146ae0df58182bdba7c7e801b75b80185c9e20a06944556a81355f117fcc5bd9a4851ac243e7",
  ipfsId: "QmYq1RhS5A1LaEFZqN5rCBGnggYC9orEgHc9qEwnPfJci8",
  abi: require("../lib/lens.json"),
}

export default function Home() {
  const [nfts, setNFTs] = useState([])
  const [posting, setPosting] = useState(false)
  const [user, setUser] = useState(null)
  const [logging, setLogging] = useState(false)
  useEffect(() => {
    ;(async () => {
      sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
    })()
  }, [])
  const Header = () => (
    <Flex w="100%" justify="center" align="center" bg="white" color="#8B5CF6">
      <Flex justify="center" align="center" width="1000px" p={3} height="65px">
        <Box fontSize="20px">WeaveLens</Box>
        <Box flex={1}></Box>
        {isNil(user) ? (
          <Flex
            color="white"
            bg="#8B5CF6"
            justify="center"
            align="center"
            w="120px"
            h="35px"
            mx={4}
            sx={{
              cursor: "pointer",
              borderRadius: "3px",
              ":hover": { opacity: 0.75 },
            }}
            onClick={async () => {
              try {
                setLogging(true)
                const { identity, tx } = await sdk.createTempAddressWithLens()
                console.log(tx)
                const id = (
                  await sdk.getAddressLink(identity.address)
                ).address.split(":")[1]
                const provider = new ethers.providers.Web3Provider(
                  window.ethereum,
                  "any"
                )
                await provider.send("eth_requestAccounts", [])
                const signer = provider.getSigner()
                const contract = new ethers.Contract(
                  lens.contract,
                  lens.abi,
                  signer
                )
                const profile = await contract.getProfile(id)
                let _user = {
                  handle: profile.handle,
                }
                if (!isNil(profile.imageURI)) {
                  _user.image = `https://cloudflare-ipfs.com/ipfs/${last(
                    profile.imageURI.split("/")
                  )}`
                }
                setUser(_user)
              } catch (e) {
                alert("something went wrong")
                console.log(e)
              }
              setLogging(false)
            }}
          >
            {logging ? (
              <Box
                as="i"
                className="fas fa-circle-notch fa-spin"
                mr={3}
                fontSize="16px"
              />
            ) : (
              <Image src="/lens.webp" boxSize="20px" mr={3} />
            )}
            <Box fontWeight="bold">Sign In</Box>
          </Flex>
        ) : (
          <>
            <Image
              src={user.image}
              boxSize="35px"
              mx={2}
              title="Log Out"
              onClick={() => setUser(null)}
              sx={{
                borderRadius: "50%",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            />
          </>
        )}
      </Flex>
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
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <Flex
        direction="column"
        align="center"
        fontSize="12px"
        bg="#eee"
        height="100%"
        flex={1}
      >
        <Header />
        <Flex
          height="250px"
          color="white"
          bg="#8B5CF6"
          w="100%"
          fontSize="40px"
          justify="center"
          align="center"
        >
          A Fully Decentralized Social Dapp Demo
        </Flex>
        {isNil(user) ? (
          <Flex flex={1} />
        ) : (
          <Flex w="1000px" flex={1}>
            <Box w="350px">
              {!isNil(user) ? (
                <>
                  <Image
                    src={user.image}
                    boxSize="200px"
                    mx={2}
                    mt="-50px"
                    sx={{ borderRadius: "20px" }}
                  />
                  <Flex
                    justify="center"
                    fontWeight="bold"
                    fontSize="18px"
                    m={2}
                    color="#8B5CF6"
                    w="200px"
                  >
                    {user.handle}
                  </Flex>
                </>
              ) : null}
            </Box>
            <Box flex={1}>
              <Flex
                align="center"
                w="100%"
                bg="white"
                height="75px"
                my={6}
                p={4}
                sx={{ border: "1px solid #ddd", borderRadius: "5px" }}
              >
                <Image
                  src={user.image}
                  boxSize="30px"
                  sx={{ borderRadius: "50%" }}
                />
                <Flex
                  ml={4}
                  bg="#eee"
                  px={4}
                  py={2}
                  align="center"
                  w="100%"
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                  onClick={() => alert("coming soon")}
                >
                  <Box as="i" mr={2} className="fas fa-edit" />
                  What's happening?
                </Flex>
              </Flex>
              <Flex
                align="flex-start"
                w="100%"
                bg="white"
                my={6}
                p={4}
                sx={{ border: "1px solid #ddd", borderRadius: "5px" }}
              >
                <Image
                  my={4}
                  src="/weavedb.jpg"
                  boxSize="30px"
                  sx={{ borderRadius: "50%" }}
                />
                <Box px={4} pt={2} align="left" w="100%">
                  <Box fontSize="16px">WeaveDB</Box>
                  <Flex fontSize="12px">
                    <Box mr={2}>@weave_db</Box>
                    <Box as="span" color="#999">
                      Mar 11
                    </Box>
                  </Flex>
                  <Box sx={{ lineHeight: "180%" }} fontSize="16px" my={4}>
                    This is a fully decentralized cross-chain dapp demo using
                    Lit Protocol, Lens Protocol and WeaveDB.
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Flex>
        )}
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
