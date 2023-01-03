import SDK from "weavedb-client"
import Jdenticon from "react-jdenticon"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import {
  append,
  pluck,
  trim,
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
import lf from "localforage"
let sdk, lit
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR
import LitJsSdk from "@lit-protocol/sdk-browser"
import moment from "moment"
export default function Home() {
  const [messages, setMessages] = useState([])
  const [authSig, setAuthSig] = useState(null)
  const [userTokenIDs, setUserTokenIDs] = useState([])
  const [posting, setPosting] = useState(false)
  const [initSDK, setInitSDK] = useState(false)

  useEffect(() => {
    ;(async () => {
      setAuthSig(await lf.getItem("lit-authSig"))
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      sdk = _sdk
      setInitSDK(true)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!isNil(authSig) && initSDK) {
        const query = `
{
  user (id: "${authSig.address}"){
    id
    tokens{
     id
    }
  }
}`

        const data = await fetch(
          "https://api.thegraph.com/subgraphs/name/ocrybit/weavedb-relayer-nft-demo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ query }),
          }
        ).then(r => r.json())
        const tokenIDs = compose(
          map(v => +v),
          pluck("id")
        )(data.data.user.tokens)
        setUserTokenIDs(tokenIDs)
        const res = await sdk.get(
          "lit_messages",
          ["tokenIDs", "array-contains-any", tokenIDs],
          ["date", "desc"]
        )
        lit = new LitJsSdk.LitNodeClient()
        await lit.connect()
        let _messages = []
        for (const msg of res) {
          const {
            evmContractConditions,
            encryptedSymmetricKey,
            encryptedData,
          } = msg.lit
          const symmetricKey = await lit.getEncryptionKey({
            evmContractConditions,
            toDecrypt: LitJsSdk.uint8arrayToString(
              new Uint8Array(encryptedSymmetricKey),
              "base16"
            ),
            chain: "goerli",
            authSig,
          })
          const dataURItoBlob = dataURI => {
            var byteString = window.atob(dataURI.split(",")[1])
            var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
            var ab = new ArrayBuffer(byteString.length)
            var ia = new Uint8Array(ab)
            for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }

            var blob = new Blob([ab], { type: mimeString })

            return blob
          }
          const decryptedString = await LitJsSdk.decryptString(
            dataURItoBlob(encryptedData),
            symmetricKey
          )
          _messages.push(assoc("text", decryptedString, msg))
        }
        setMessages(_messages)
      }
    })()
  }, [authSig, initSDK])

  const Header = () => (
    <>
      <Flex justify="center" width="600px" py={3} align="center">
        {!isNil(authSig) ? (
          <>
            <Flex
              flex={1}
              align="center"
              as="a"
              target="_blank"
              href={`https://goerli.etherscan.io/address/${authSig.address}`}
              sx={{ ":hover": { opacity: 0.75 } }}
            >
              <Box mr={3}>
                <Jdenticon size="30px" value={authSig.address} />
              </Box>
              <Box flex={1}>{isNil(authSig) ? "" : authSig.address}</Box>
            </Flex>
            <Flex
              bg="#1E1930"
              color="#F893F6"
              p={3}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
              }}
              onClick={async () => {
                LitJsSdk.disconnectWeb3()
                setAuthSig(null)
                await lf.removeItem("lit-authSig")
                setUserTokenIDs([])
              }}
            >
              Disconnect
            </Flex>
          </>
        ) : (
          <>
            <Box flex={1} />
            <Box
              bg="#1E1930"
              color="#F893F6"
              p={3}
              sx={{
                borderRadius: "5px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
              }}
              onClick={async () => {
                lit = new LitJsSdk.LitNodeClient()
                await lit.connect()
                const authSig = await LitJsSdk.checkAndSignAuthMessage({
                  chain: "goerli",
                })
                setAuthSig(authSig)
                await lf.setItem("lit-authSig", authSig)
              }}
            >
              Connect with Lit Protocol
            </Box>
          </>
        )}
      </Flex>
      <Flex justify="center" width="600px">
        <Box flex={1}>Your Token: {userTokenIDs.join(",")}</Box>
      </Flex>
      <Flex justify="center" width="600px" py={3}>
        <Box flex={1}>
          {posting
            ? "posting..."
            : "Mint NFT and post encrypted group messages to tokenIDs! (e.g. 1,2,3)"}
        </Box>
        <Box
          as="a"
          target="_blank"
          sx={{ textDecoration: "underline" }}
          href={`https://goerli.etherscan.io/token/${nftContractAddr}#writeContract`}
        >
          Mint NFT
        </Box>
      </Flex>
    </>
  )

  const Footer = () => (
    <Flex w="100%" justify="center" p={4} bg="#1E1930" color="#F893F6">
      <Flex>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
        >
          Contract Transactions
        </Box>
      </Flex>
    </Flex>
  )

  const Post = () => {
    const [message, setMessage] = useState("")
    const [tokenIDs, setTokenIDs] = useState("")
    return (
      <Flex
        justify="center"
        width="600px"
        mb={5}
        sx={{ boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)" }}
      >
        <Input
          bg="white"
          color="#1E1930"
          disabled={posting}
          w="150px"
          placeholder="tokenIDs"
          sx={{ borderRadius: "3px 0 0 3px" }}
          value={tokenIDs}
          onChange={e => setTokenIDs(e.target.value)}
        />
        <Input
          bg="white"
          color="#1E1930"
          disabled={posting}
          flex={1}
          placeholder="Message"
          sx={{ borderRadius: "0" }}
          value={message}
          onChange={e => {
            setMessage(e.target.value)
          }}
        />
        <Flex
          px={4}
          align="center"
          justify="center"
          width="75px"
          bg="#1E1930"
          color="#F893F6"
          fontSize="16px"
          sx={{
            borderRadius: "0 3px 3px 0",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
          onClick={async () => {
            if (!posting) {
              setPosting(true)
              if (tokenIDs === "") {
                alert("enter your tokenID")
                return
              }
              if (/^\s*$/.test(message)) {
                alert("enter message")
                return
              }

              let isNaN = false
              const _tokenIDs = map(v => {
                if (Number.isNaN(+trim(v))) isNaN = true
                return +trim(v)
              })(tokenIDs.split(","))

              if (isNaN) {
                alert("Enter numbers")
                return
              }
              let evmContractConditions = [
                {
                  contractAddress: process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDR,
                  functionName: "isOwner",
                  functionParams: [":userAddress", JSON.stringify(_tokenIDs)],
                  functionAbi: {
                    inputs: [
                      {
                        internalType: "address",
                        name: "addr",
                        type: "address",
                      },
                      {
                        internalType: "uint256[]",
                        name: "tokens",
                        type: "uint256[]",
                      },
                    ],
                    name: "isOwner",
                    outputs: [
                      {
                        internalType: "bool",
                        name: "",
                        type: "bool",
                      },
                    ],
                    stateMutability: "view",
                    type: "function",
                  },
                  chain: "goerli",
                  returnValueTest: {
                    key: "",
                    comparator: "=",
                    value: "true",
                  },
                },
              ]
              lit = new LitJsSdk.LitNodeClient()
              await lit.connect()
              const authSig = await LitJsSdk.checkAndSignAuthMessage({
                chain: "goerli",
              })
              await lf.setItem("lit-authSig", authSig)
              const { encryptedString, symmetricKey } =
                await LitJsSdk.encryptString(message)
              const encryptedSymmetricKey = await lit.saveEncryptionKey({
                evmContractConditions,
                symmetricKey,
                authSig,
                chain: "goerli",
              })
              const blobToDataURI = blob => {
                return new Promise((resolve, reject) => {
                  var reader = new FileReader()

                  reader.onload = e => {
                    var data = e.target.result
                    resolve(data)
                  }
                  reader.readAsDataURL(blob)
                })
              }
              const encryptedData = await blobToDataURI(encryptedString)
              const packaged = {
                encryptedData,
                encryptedSymmetricKey: Array.from(encryptedSymmetricKey),
                evmContractConditions,
              }
              try {
                const provider = new ethers.providers.Web3Provider(
                  window.ethereum,
                  "any"
                )
                await provider.send("eth_requestAccounts", [])
                const addr = await provider.getSigner().getAddress()

                const params = await sdk.sign(
                  "add",
                  { date: sdk.ts() },
                  "lit_messages",
                  {
                    wallet: addr,
                    jobID: "lit",
                  }
                )
                const res = await fetch("/api/isOwner", {
                  method: "POST",
                  body: JSON.stringify({ params, lit: packaged }),
                }).then(v => v.json())
                if (res.success === false) {
                  alert("Something went wrong")
                } else {
                  setMessage("")
                  setTokenIDs("")
                  setMessages(
                    compose(
                      reverse,
                      sortBy(prop("date")),
                      append({
                        tokenIDs: _tokenIDs,
                        date: Math.round(Date.now() / 1000),
                        text: message,
                        owner: authSig.address,
                      })
                    )(messages)
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
        </Flex>
      </Flex>
    )
  }

  const Messages = () => (
    <Box>
      {map(v => (
        <Flex
          p={2}
          bg="#4C2471"
          color="white"
          m={4}
          sx={{
            borderRadius: "10px",
            boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
          }}
          w="600px"
        >
          <Flex justify="center" py={2} px={4}>
            <Flex direction="column">
              <Flex bg="white" sx={{ borderRadius: "50%" }} p={2}>
                <Jdenticon size="30px" value={v.owner} />
              </Flex>
              <Flex justify="center" mt={2} fontSize="12px">
                {v.owner.slice(0, 7)}
              </Flex>
            </Flex>
          </Flex>
          <Flex p={2} flex={1} mx={2} fontSize="16px" direction="column">
            <Box flex={1}>{v.text}</Box>
            <Flex fontSize="12px" color="#F893F6">
              <Box>To: {v.tokenIDs.join(", ")}</Box>
              <Box flex={1} />
              <Box>{moment(v.date * 1000).fromNow()}</Box>
            </Flex>
          </Flex>
        </Flex>
      ))(messages)}
    </Box>
  )

  return (
    <ChakraProvider>
      <style jsx global>{`
        html,
        #__next,
        body {
          color: white;
          height: 100%;
          background-image: radial-gradient(
            circle,
            #b51da6,
            #94259a,
            #75288c,
            #58277b,
            #3e2368
          );
        }
      `}</style>
      <Flex direction="column" minHeight="100%" justify="center" align="center">
        <Flex direction="column" align="center" fontSize="12px" flex={1}>
          <Header />
          {isNil(authSig) ? null : (
            <>
              <Post />
              <Messages />
            </>
          )}
        </Flex>
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
