import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"
import dynamic from "next/dynamic"
import SDK from "weavedb-client"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Jdenticon from "react-jdenticon"
import {
  dissoc,
  path,
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

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })
import dayjs from "dayjs"
dayjs.extend(require("dayjs/plugin/relativeTime"))

export default function Home() {
  const [account, setAccount] = useState(null)
  const [posting, setPosting] = useState(false)
  const [initSDK, setInitSDK] = useState(false)
  const [articles, setArticles] = useState([])
  const [note, setNote] = useState(null)
  const [_title, _setTitle] = useState("")
  const [_message, _setMessage] = useState("")
  useEffect(() => {
    ;(async () => {
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
      if (initSDK && !isNil(account)) {
        setArticles(await sdk.cget("bundlr", true))
      } else {
        setArticles([])
      }
    })()
  }, [initSDK, account])

  const Header = () => (
    <Flex align="center" justify="center" width="600px" py={3}>
      <Box flex={1} pl={2}>
        {posting
          ? "posting..."
          : isNil(account)
          ? "Upload public notes to Arweave!"
          : account}
      </Box>
      {isNil(account) ? (
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
            const wallet = window.arweaveWallet
            await wallet.connect([
              "SIGNATURE",
              "ACCESS_PUBLIC_KEY",
              "ACCESS_ADDRESS",
            ])
            let addr = await wallet.getActiveAddress()
            setAccount(addr)
          }}
        >
          Connect Arweave Wallet
        </Box>
      ) : (
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
          onClick={async () => setAccount(null)}
        >
          Disconnect
        </Box>
      )}
    </Flex>
  )

  const Footer = () => (
    <Flex w="100%" justify="center" p={4} bg="#1E1930" color="#F893F6">
      <Flex>
        <Box
          as="a"
          target="_blank"
          href={`https://sonar.warp.cc/?#/app/contract/${contractTxId}`}
          sx={{ textDecoration: "underline" }}
        >
          Contract Transactions
        </Box>
      </Flex>
    </Flex>
  )

  const Post = ({ _title, _message }) => {
    const [title, setTitle] = useState(_title || "")
    const [value, setValue] = useState(_message || "")
    return (
      <>
        <Flex justify="center" width="600px" mb={5}>
          <Input
            bg="white"
            color="#4C2471"
            disabled={posting}
            w="100px"
            placeholder="title"
            sx={{ borderRadius: "3px 0 0 3px" }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            flex={1}
          />
          <Button
            color="rgb(78,38,115)"
            sx={{ borderRadius: "0 3px 3px 0" }}
            onClick={async () => {
              if (
                !posting &&
                confirm(
                  "Your note will be public and stored permanently on Arweave."
                )
              ) {
                if (/^\s*$/.test(title)) {
                  alert("enter title")
                  return
                }
                if (/^\s*$/.test(value)) {
                  alert("enter body")
                  return
                }
                setPosting(true)
                try {
                  const wallet = window.arweaveWallet
                  await wallet.connect([
                    "SIGNATURE",
                    "ACCESS_PUBLIC_KEY",
                    "ACCESS_ADDRESS",
                  ])
                  const conf = {
                    ar: wallet,
                    jobID: "bundlr",
                  }
                  const params = !isNil(note)
                    ? await sdk.sign(
                        "update",
                        { title },
                        "bundlr",
                        note.id,
                        conf
                      )
                    : await sdk.sign("add", { title }, "bundlr", conf)
                  const res = await fetch("/api/bundlr", {
                    method: "POST",
                    body: JSON.stringify({ params, body: value }),
                  }).then(v => v.json())
                  if (!res.success) {
                    alert("Something went wrong")
                  } else {
                    let new_note = {
                      data: res.tx.doc,
                      id: res.tx.docID,
                    }
                    _setMessage(value)
                    _setTitle(new_note.data.title)
                    setNote(new_note)
                    setArticles(
                      compose(
                        reverse,
                        sortBy(path(["data", "date"])),
                        values,
                        assoc(res.tx.docID, new_note),
                        indexBy(prop("id"))
                      )(articles)
                    )
                  }
                } catch (e) {
                  alert("something went wrong")
                }
                setPosting(false)
              }
            }}
          >
            {isNil(note) ? "Publish" : "Update"}
          </Button>
          {isNil(note) ? null : (
            <Button
              ml={2}
              sx={{
                bg: "SlateBlue",
                color: "white",
                borderRadius: "3px",
              }}
              onClick={async () => {
                if (
                  !posting &&
                  confirm("This will only unlink your note from WeaveDB.")
                ) {
                  setPosting(true)
                  try {
                    const wallet = window.arweaveWallet
                    await wallet.connect([
                      "SIGNATURE",
                      "ACCESS_PUBLIC_KEY",
                      "ACCESS_ADDRESS",
                    ])
                    const conf = {
                      ar: wallet,
                      jobID: "bundlr",
                    }
                    const res = await sdk.delete("bundlr", note.id, conf)
                    if (!res.success) {
                      alert("Something went wrong")
                    } else {
                      _setMessage("")
                      _setTitle("")
                      setArticles(
                        compose(
                          reverse,
                          sortBy(path(["data", "date"])),
                          values,
                          dissoc(note.id),
                          indexBy(prop("id"))
                        )(articles)
                      )
                      setNote(null)
                    }
                  } catch (e) {
                    alert("something went wrong")
                  }
                  setPosting(false)
                }
              }}
            >
              Unlink
            </Button>
          )}
        </Flex>
        <Flex w="600px" mb={5}>
          <MDEditor
            value={value}
            onChange={setValue}
            style={{ width: "100%" }}
          />
        </Flex>
      </>
    )
  }

  const Messages = () => (
    <Box mb={5}>
      {map(doc => {
        const v = doc.data
        const selected = !isNil(note) && note.id === doc.id
        return (
          <>
            <Flex
              p={2}
              bg={selected ? "white" : "#4C2471"}
              color={selected ? "#4C2471" : "white"}
              m={4}
              sx={{
                borderRadius: "10px",
                boxShadow: "10px 10px 14px 1px rgb(0 0 0 / 20%)",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
              w="600px"
              onClick={async () => {
                if (!isNil(note) && note.id === doc.id) {
                  setNote(null)
                  _setTitle("")
                  _setMessage("")
                } else {
                  try {
                    const note = await fetch(
                      `https://arweave.net/${v.id}`
                    ).then(v => v.json())
                    if (!isNil(note)) {
                      setNote(doc)
                      _setTitle(v.title)
                      _setMessage(note.body)
                    }
                  } catch (e) {}
                }
              }}
            >
              <Flex justify="center" py={2} px={4}>
                <Flex direction="column">
                  <Flex
                    bg="white"
                    sx={{ borderRadius: "50%", bg: "#4C2471" }}
                    p={2}
                  >
                    <Jdenticon size="30px" value={v.author} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex p={2} flex={1} mx={2} fontSize="16px" direction="column">
                <Box flex={1}>{v.title}</Box>
                <Flex fontSize="12px" color="#F893F6">
                  <Box>{v.id}</Box>
                  <Box flex={1} />
                  <Box>{dayjs(v.date).fromNow()}</Box>
                </Flex>
              </Flex>
            </Flex>
          </>
        )
      })(articles)}
    </Box>
  )

  return (
    <>
      <style jsx global>{`
        html,
        #__next,
        body {
          height: 100%;
        }
        body.chakra-ui-light {
          color: white;
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
      <ChakraProvider>
        <Flex
          direction="column"
          minHeight="100%"
          justify="center"
          align="center"
        >
          <Flex direction="column" align="center" fontSize="12px" flex={1}>
            <Header />
            {isNil(account) ? null : (
              <>
                <Post {...{ _title, _message }} />
                <Messages />
              </>
            )}
          </Flex>
          <Footer />
        </Flex>
      </ChakraProvider>
    </>
  )
}
