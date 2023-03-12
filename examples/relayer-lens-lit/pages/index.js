import SDK from "weavedb-client"
import lf from "localforage"
import { useEffect, useState } from "react"
import { useToast } from "@chakra-ui/react"
import {
  mergeRight,
  uniq,
  pluck,
  compose,
  assoc,
  map,
  indexBy,
  prop,
  isNil,
  last,
} from "ramda"
import { Box, Flex, ChakraProvider } from "@chakra-ui/react"
let sdk
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID

import Posts from "../components/Posts"
import Header from "../components/Header"
import Profile from "../components/Profile"
import EditUser from "../components/EditUser"
import EditPost from "../components/EditPost"

const limit = 20

export default function Home() {
  const [user, setUser] = useState(null)
  const [logging, setLogging] = useState(false)
  const [edit, setEdit] = useState(false)
  const [editUser, setEditUser] = useState(false)
  const [body, setBody] = useState("")
  const [name, setName] = useState("")
  const [posts, setPosts] = useState("")
  const [userMap, setUserMap] = useState({})
  const [next, setNext] = useState(null)
  const toast = useToast()
  useEffect(() => {
    ;(async () => {
      sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_WEAVEDB_RPC_WEB,
      })
      const _user = (await lf.getItem("user")) || null
      setUser(_user)
      if (!isNil(_user)) {
        const wuser = await sdk.get("users", `lens:${_user.id}`)
        setUserMap(assoc(`lens:${_user.id}`, wuser, userMap))
      }
      const _posts = await sdk.cget("posts", ["date", "desc"], limit)
      setPosts(pluck("data", _posts))
      if (_posts.length >= limit) setNext(last(_posts))
      setUserMap(
        compose(
          mergeRight(userMap),
          indexBy(prop("uid"))
        )(
          await sdk.get("users", [
            "uid",
            "in",
            compose(uniq, pluck("user"), pluck("data"))(_posts),
          ])
        )
      )
    })()
  }, [])
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
        flex={1}
      >
        <Header
          {...{
            sdk,
            userMap,
            setLogging,
            setUser,
            setUserMap,
            setEditUser,
            logging,
            user,
          }}
        />
        <Flex w="1000px" flex={1}>
          <Profile />
          <Posts
            {...{
              posts,
              user,
              userMap,
              sdk,
              setPosts,
              toast,
              setEdit,
              next,
              setNext,
              limit,
              setUserMap,
            }}
          />
        </Flex>
      </Flex>
      <EditUser
        {...{
          editUser,
          setEditUser,
          setName,
          name,
          user,
          sdk,
          userMap,
          setUserMap,
          toast,
        }}
      />
      <EditPost
        {...{ edit, setEdit, setBody, body, user, sdk, posts, toast, setPosts }}
      />
    </ChakraProvider>
  )
}
