import SDK from "weavedb-client"
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
          "lit_message",
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
      <Flex justify="center" width="500px" p={3}>
        <Box flex={1}>{isNil(authSig) ? "" : authSig.address}</Box>
        {!isNil(authSig) ? (
          <Box
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={async () => {
              LitJsSdk.disconnectWeb3()
              setAuthSig(null)
              await lf.removeItem("lit-authSig")
              setUserTokenIDs([])
            }}
          >
            Disconnect
          </Box>
        ) : (
          <Box
            sx={{ cursor: "pointer", textDecoration: "underline" }}
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
            Connect
          </Box>
        )}
      </Flex>
      <Flex justify="center" width="500px" px={3}>
        <Box flex={1}>Your Token: {userTokenIDs.join(",")}</Box>
      </Flex>
      <Flex justify="center" width="500px" p={3}>
        <Box flex={1}>
          {posting
            ? "posting..."
            : "Mint NFT and post a group message with your tokenID!"}
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
    </>
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
    const [tokenIDs, setTokenIDs] = useState("")
    return (
      <Flex justify="center" width="500px" mb={5}>
        <Input
          disabled={posting}
          w="200px"
          placeholder="tokenIDs (e.g. 1,2,3)"
          sx={{ borderRadius: "3px 0 0 3px" }}
          value={tokenIDs}
          onChange={e => setTokenIDs(e.target.value)}
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
                  "lit_message",
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
                        date: Date.now(),
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
        </Button>
      </Flex>
    )
  }

  const Messages = () => (
    <Box>
      <Flex bg="#EDF2F7" w="500px">
        <Flex justify="center" p={2} w="75px">
          tokenIDs
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
            {v.tokenIDs.join(",")}
          </Flex>
          <Flex justify="center" p={2} w="100px">
            {v.owner.slice(0, 5)}...{v.owner.slice(-3)}
          </Flex>
          <Box p={2} flex={1}>
            {v.text}
          </Box>
        </Flex>
      ))(messages)}
    </Box>
  )

  return (
    <ChakraProvider>
      <Flex direction="column" align="center" fontSize="12px">
        <Header />
        {isNil(authSig) ? null : (
          <>
            <Post />
            <Messages />
          </>
        )}
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
