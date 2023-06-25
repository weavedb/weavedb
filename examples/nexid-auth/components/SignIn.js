import { BrowserProvider } from "ethers"
import { useState } from "react"
import { Input, Box, Flex } from "@chakra-ui/react"
import lf from "localforage"
import { last, assoc, isNil } from "ramda"
import Link from "next/link"
import Jdenticon from "react-jdenticon"
import {
  connectWithWeaveDB,
  createTempAddress,
  getPubKey,
  isOwner,
  signPayload,
  verifyProof,
} from "../lib/nextid"

export default function SignIn({
  isModal,
  setIsModal,
  userMap,
  setUserMap,
  setUser,
  sdk,
}) {
  const [nextID, setNextID] = useState(null)
  const [logging, setLogging] = useState(false)
  const [handle, setHandle] = useState("")
  const [statusID, setStatusID] = useState("")

  return !isModal ? null : (
    <Flex
      sx={{
        bg: "rgba(0,0,0,.5)",
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
      }}
      align="center"
      justify="center"
      onClick={() => setIsModal(false)}
    >
      <Box
        bg="white"
        w="500px"
        p={5}
        sx={{ borderRadius: "10px" }}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        {!isNil(nextID) ? (
          <>
            <Flex
              fontSize="10px"
              justify="flex-end"
              onClick={() => setNextID(null)}
              sx={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Cancel
            </Flex>
            <Box fontSize="12px" px={2}>
              <Box>
                To link{" "}
                <Box as="span" sx={{ textDecoration: "underline" }}>
                  {nextID.addr}
                </Box>
              </Box>
              <Box>
                tweet
                <Box
                  sx={{ textDecoration: "underline" }}
                  mx={1}
                  as="a"
                  color="#2265F1"
                  target="_blank"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    nextID.tweet
                  )}`}
                >
                  this
                </Box>
                via @{nextID.identity} and get the status ID.
              </Box>
            </Box>
            <Flex align="center" mt={3}>
              <Input
                h="35px"
                placeholder="Status ID"
                sx={{ borderRadius: "3px 0 0 3px" }}
                onChange={e => setStatusID(e.target.value)}
                value={statusID}
              />
              <Flex
                color="white"
                bg="#2265F1"
                justify="center"
                align="center"
                w="150px"
                h="35px"
                sx={{
                  cursor: "pointer",
                  borderRadius: "0 3px 3px 0",
                  ":hover": { opacity: 0.75 },
                }}
                onClick={async () => {
                  setLogging(true)
                  try {
                    if (/^\s*$/.test(statusID)) {
                      alert("specify status ID")
                      setLogging(false)
                      return
                    }
                    if (await verifyProof(statusID, nextID)) {
                      const signer = await new BrowserProvider(
                        window.ethereum
                      ).getSigner()
                      const { new_user, user_with_cred } =
                        await createTempAddress(nextID.identity, signer, sdk)
                      if (isNil(new_user)) {
                        alert("something went wrong!")
                      } else {
                        await lf.setItem("user", user_with_cred)
                        setUserMap(assoc(nextID.identity, new_user, userMap))
                        setUser(user_with_cred)
                        setLogging(false)
                        setIsModal(false)
                        setNextID(null)
                      }
                    }
                  } catch (e) {}
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
                ) : null}
                <Box fontWeight="bold">Verify</Box>
              </Flex>
            </Flex>
          </>
        ) : (
          <Flex align="center">
            <Input
              h="35px"
              placeholder="Twitter Handle"
              sx={{ borderRadius: "3px 0 0 3px" }}
              onChange={e => setHandle(e.target.value)}
              value={handle}
            />
            <Flex
              color="white"
              bg="#2265F1"
              justify="center"
              align="center"
              w="150px"
              h="35px"
              sx={{
                cursor: "pointer",
                borderRadius: "0 3px 3px 0",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                setLogging(true)
                try {
                  const identity = handle.toLowerCase()
                  if (window.ethereum) {
                    const { public_key, addr, signer } = await getPubKey(
                      identity
                    )
                    if (await isOwner(identity, public_key)) {
                      const { new_user, user_with_cred } =
                        await createTempAddress(identity, signer, sdk)
                      if (isNil(new_user)) {
                        alert("something went wrong!")
                        setLogging(false)
                        return
                      } else {
                        await lf.setItem("user", user_with_cred)
                        setUserMap(assoc(identity, new_user, userMap))
                        setUser(user_with_cred)
                        setLogging(false)
                        setIsModal(false)
                        return
                      }
                    }
                    const { signature, uuid, created_at, tweet } =
                      await signPayload(identity, public_key, signer)
                    setNextID({
                      addr,
                      identity,
                      signature,
                      uuid,
                      public_key,
                      created_at,
                      tweet,
                    })
                  }
                } catch (e) {}
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
              ) : null}
              <Box fontWeight="bold">Sign In</Box>
            </Flex>
          </Flex>
        )}
      </Box>
    </Flex>
  )
}
