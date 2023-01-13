import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"
import dynamic from "next/dynamic"
import SDK from "weavedb-client"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
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
const nftContractAddr = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDR

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
        setArticles(await sdk.cget("bundlr-test", true))
      }
    })()
  }, [initSDK, account])

  const Header = () => (
    <Flex align="center" justify="center" width="600px" py={3}>
      <Box flex={1}>
        {posting
          ? "posting..."
          : isNil(account)
          ? "Upload public notes to Arweave!"
          : account}
      </Box>
      {isNil(account) ? (
        <Box
          bg="#333"
          px={6}
          py={2}
          color="white"
          sx={{
            border: "1px solid #333",
            borderRadius: "5px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
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
          Connect
        </Box>
      ) : (
        <Box
          white="#333"
          px={6}
          py={2}
          bg="white"
          sx={{
            border: "1px solid #333",
            borderRadius: "5px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
          onClick={async () => setAccount(null)}
        >
          Disconnect
        </Box>
      )}
    </Flex>
  )

  const Footer = () => (
    <Flex justify="center" width="600px" p={3}>
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

  const Post = ({ _title, _message }) => {
    const [title, setTitle] = useState(_title || "")
    const [value, setValue] = useState(_message || "")
    return (
      <>
        <Flex justify="center" width="600px" mb={5}>
          <Input
            disabled={posting}
            w="100px"
            placeholder="title"
            sx={{ borderRadius: "3px 0 0 3px" }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            flex={1}
          />
          <Button
            sx={{ borderRadius: "0 3px 3px 0" }}
            onClick={async () => {
              if (!posting) {
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
                    jobID: "bundlr-test",
                  }
                  const params = !isNil(note)
                    ? await sdk.sign(
                        "update",
                        { title },
                        "bundlr-test",
                        note.id,
                        conf
                      )
                    : await sdk.sign("add", { title }, "bundlr-test", conf)
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
          {true || isNil(note) ? null : (
            <Button
              ml={2}
              sx={{ bg: "salmon", color: "white", borderRadius: "3px" }}
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
                      jobID: "bundlr-test",
                    }
                    const res = await sdk.delete("bundlr-test", note.id, conf)
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
                          dissoc(res.tx.docID),
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
    <Box>
      {map(doc => {
        const v = doc.data
        return (
          <Flex
            bg={!isNil(note) && note.id === doc.id ? "#EDF2F7" : ""}
            sx={{ ":hover": { bg: "#EDF2F7" }, cursor: "pointer" }}
            w="600px"
            align="center"
            onClick={async () => {
              if (!isNil(note) && note.id === doc.id) {
                setNote(null)
                _setTitle("")
                _setMessage("")
              } else {
                try {
                  const note = await fetch(`https://arweave.net/${v.id}`).then(
                    v => v.json()
                  )
                  if (!isNil(note)) {
                    setNote(doc)
                    _setTitle(v.title)
                    _setMessage(note.body)
                  }
                } catch (e) {}
              }
            }}
          >
            <Box p={2} flex={1}>
              {v.title}
            </Box>
            <Flex justify="center" p={2} w="100px" fontSize="10px">
              {dayjs(v.date).fromNow()}
            </Flex>
          </Flex>
        )
      })(articles)}
    </Box>
  )

  return (
    <ChakraProvider>
      <Flex direction="column" align="center" fontSize="12px">
        <Header />
        <Post {...{ _title, _message }} />
        <Messages />
        <Footer />
      </Flex>
    </ChakraProvider>
  )
}
