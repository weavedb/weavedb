import Link from "next/link"
import { Image, Box, Flex } from "@chakra-ui/react"
import { inject } from "roidjs"
import { useEffect, useState } from "react"
import { checkTempAddress, setupWeaveDB, signIn, signOut } from "/lib/main"
import { isNil } from "ramda"

const Header = inject(
  [
    "next",
    "temp_current",
    "temp_wallet",
    "initWDB",
    "signing_in",
    "posts",
    "user",
    "user_map",
  ],
  ({ $, set, fn }) => {
    useEffect(() => {
      fn(setupWeaveDB)({ network: "Mainnet" })
    }, [])

    useEffect(() => {
      if ($.initWDB) fn(checkTempAddress)({})
    }, [$.initWDB])

    const ConnectWallet = () => (
      <Flex
        py={2}
        px={[3, 4, 6]}
        bg="#0090FF"
        fontSize="14px"
        color="white"
        sx={{
          borderRadius: "25px",
          cursor: "pointer",
          ":hover": { opacity: 0.75 },
        }}
        justifyContent="center"
        onClick={async () => {
          if (isNil($.temp_current)) {
            if (isNil(window.arweaveWallet)) {
              alert("ArConnect is not installed")
              return
            }
            set(true, "signing_in")
            await fn(signIn)({})
            set(false, "signing_in")
          } else {
            if (confirm("Would you like to sign out?")) {
              fn(signOut)()
            }
          }
        }}
      >
        {isNil($.temp_current) ? (
          "Sign In"
        ) : (
          <Flex align="center">
            <Image boxSize="25px" src="/arconnect.png" mr={[2, 3]} />
            {`${$.temp_current.slice(0, 5)}`}
          </Flex>
        )}
      </Flex>
    )

    return (
      <Flex
        color="#0090FF"
        bg="#eee"
        width="100%"
        height="56px"
        sx={{
          zIndex: 10,
          position: "fixed",
          top: 0,
          left: 0,
          borderBottom: "1px solid #001626",
        }}
        align="center"
      >
        <Link href="/">
          <Flex
            align="center"
            w="230px"
            sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
          >
            <Image
              boxSize="45px"
              src="/logo.png"
              sx={{ borderRadius: "50%" }}
              mx={3}
            />
            The Wall EXM
          </Flex>
        </Link>
        <Flex flex={1} justify="center">
          {isNil($.user) ? null : (
            <Box justify="center" display={["none", null, "flex"]}>
              Welcome,
              <Link href={`/${$.user.address}`}>
                <Box
                  mx={2}
                  as="span"
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                >
                  {$.user.name}
                </Box>
              </Link>
              !
            </Box>
          )}
        </Flex>
        <Flex justify="center" align="center" justifySelf="flex-end" px={5}>
          <ConnectWallet />
        </Flex>
      </Flex>
    )
  }
)
export default Header
