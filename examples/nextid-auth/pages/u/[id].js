import { useRouter } from "next/router"
import lf from "localforage"
import { useEffect, useState } from "react"
import { useToast } from "@chakra-ui/react"

import {
  assoc,
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
import { connectWithWeaveDB } from "../../lib/nextid"

import Posts from "../../components/Posts"
import Header from "../../components/Header"
import SignIn from "../../components/SignIn"
import Profile from "../../components/Profile"
import EditUser from "../../components/EditUser"
import EditPost from "../../components/EditPost"

const contractTxId = process.env.NEXT_PUBLIC_CONTRACT_TX_ID
const limit = 10
let sdk

export default function Home() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [pageUser, setPageUser] = useState(null)
  const [edit, setEdit] = useState(false)
  const [editUser, setEditUser] = useState(false)
  const [body, setBody] = useState("")
  const [name, setName] = useState("")
  const [posts, setPosts] = useState("")
  const [userMap, setUserMap] = useState({})
  const [next, setNext] = useState(null)
  const [isModal, setIsModal] = useState(false)

  const toast = useToast()

  useEffect(() => {
    ;(async () => {
      if (!isNil(router?.query?.id)) {
        sdk = await connectWithWeaveDB(contractTxId)
        setUser((await lf.getItem("user")) || null)
        const handle = `${router.query.id}`
        const wuser = await sdk.get("users", ["uid", "==", handle])
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
      <Flex
        direction="column"
        align="center"
        fontSize="12px"
        bg="#eee"
        flex={1}
      >
        <Header
          {...{
            setIsModal,
            sdk,
            userMap,
            setUser,
            setUserMap,
            setEditUser,
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
      <SignIn {...{ isModal, setIsModal, userMap, setUserMap, setUser, sdk }} />
    </ChakraProvider>
  )
}
