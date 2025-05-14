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
      const _sdk = new SDK({
        contractTxId,
        rpc: process.env.NEXT_PUBLIC_RPC,
      })
      sdk = _sdk
      const _user = (await lf.getItem("user")) || null
      setUser(_user)
      if (!isNil(_user)) {
        const wuser = await _sdk.get("users", _user.id)
        if (!isNil(wuser)) {
          setUserMap(assoc(_user.id, wuser, userMap))
        } else {
          setEditUser(true)
        }
      }

      const _posts = await _sdk.cget("posts", ["date", "desc"], limit)
      setPosts(pluck("data", _posts))
      if (_posts.length >= limit) setNext(last(_posts))
      if (_posts.length > 0) {
        setUserMap(
          compose(
            mergeRight(userMap),
            indexBy(prop("uid"))
          )(
            await _sdk.get("users", [
              "uid",
              "in",
              compose(uniq, pluck("user"), pluck("data"))(_posts),
            ])
          )
        )
      }
    })()
  }, [])
  return (
    <ChakraProvider>
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
          background-color: #eee;
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
        <Flex
          direction={["column", null, "row"]}
          maxW="1000px"
          w="100%"
          flex={1}
          px={4}
        >
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
        {...{
          edit,
          setEdit,
          setBody,
          body,
          user,
          sdk,
          posts,
          toast,
          setPosts,
          userMap,
          setUserMap,
        }}
      />
    </ChakraProvider>
  )
}
