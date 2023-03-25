import { useRouter } from "next/router"
import SDK from "weavedb-sdk"
import lf from "localforage"
import { useEffect, useState } from "react"
import { useToast } from "@chakra-ui/react"

import {
  assoc,
  map,
  isNil,
  last,
  pluck,
  compose,
  mergeRight,
  indexBy,
  prop,
  uniq,
} from "ramda"
import { Box, Flex, ChakraProvider } from "@chakra-ui/react"
let sdk
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
import Posts from "../../components/Posts"
import Header from "../../components/Header"
import Profile from "../../components/Profile"
import EditUser from "../../components/EditUser"
import EditPost from "../../components/EditPost"
const limit = 20

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pageUser, setPageUser] = useState(null)
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
      if (!isNil(router?.query?.id)) {
        sdk = new SDK({ contractTxId })
        await sdk.initializeWithoutWallet()
        setUser((await lf.getItem("user")) || null)
        const handle = `${router.query.id}.lens`
        const wuser = await sdk.get("users", ["handle", "==", handle])
        if (!isNil(wuser[0])) {
          setUserMap(assoc(wuser[0].uid, wuser[0], userMap))
          const _posts = await sdk.cget(
            "posts",
            ["user", "==", `${wuser[0].uid}`],
            ["date", "desc"],
            limit
          )

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
          setPageUser(wuser[0])
        }
      }
    })()
  }, [router])
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
        {isNil(pageUser) ? (
          <Flex flex={1} />
        ) : (
          <Flex w="1000px" flex={1}>
            <Profile {...{ pageUser, user, setName, setEditUser }} />
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
                pageUser,
              }}
            />
          </Flex>
        )}
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
          pageUser,
          setUserMap,
          setPageUser,
          toast,
        }}
      />
      <EditPost
        {...{ edit, setEdit, setBody, body, user, sdk, posts, toast, setPosts }}
      />
    </ChakraProvider>
  )
}
