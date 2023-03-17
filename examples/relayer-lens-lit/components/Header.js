import { Image, Box, Flex } from "@chakra-ui/react"
import lf from "localforage"
import { utils, ethers } from "ethers"
import { last, assoc, isNil } from "ramda"
import Link from "next/link"
const lens = {
  contract: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
  pkp_address: "0xF810D4a6F0118E6a6a86A9FBa0dd9EA669e1CC2E".toLowerCase(),
  pkp_publicKey:
    "0x04e1d2e8be025a1b8bb10b9c9a5ae9f11c02dbde892fee28e5060e146ae0df58182bdba7c7e801b75b80185c9e20a06944556a81355f117fcc5bd9a4851ac243e7",
  ipfsId: "QmYq1RhS5A1LaEFZqN5rCBGnggYC9orEgHc9qEwnPfJci8",
  abi: require("../lib/lens.json"),
}

export default function Header({
  sdk,
  userMap,
  setLogging,
  setUser,
  setUserMap,
  setEditUser,
  logging,
  user,
}) {
  return (
    <>
      <Flex w="100%" justify="center" align="center" bg="white" color="#8B5CF6">
        <Flex
          justify="center"
          align="center"
          width="1000px"
          p={3}
          height="65px"
        >
          <Link href="/">
            <Box fontSize="20px">WeaveLens</Box>
          </Link>
          <Box flex={1}></Box>
          {isNil(user) ? (
            <Flex
              color="white"
              bg="#8B5CF6"
              justify="center"
              align="center"
              w="120px"
              h="35px"
              mx={4}
              sx={{
                cursor: "pointer",
                borderRadius: "3px",
                ":hover": { opacity: 0.75 },
              }}
              onClick={async () => {
                try {
                  setLogging(true)
                  const { identity, tx } = await sdk.createTempAddressWithLens()
                  if (tx.success) {
                    const id = (
                      await sdk.getAddressLink(identity.address)
                    ).address.split(":")[1]
                    const provider = new ethers.providers.Web3Provider(
                      window.ethereum,
                      "any"
                    )
                    const signer = provider.getSigner()
                    await provider.send("eth_requestAccounts", [])

                    const contract = new ethers.Contract(
                      lens.contract,
                      lens.abi,
                      signer
                    )
                    const profile = await sdk.repeatQuery(contract.getProfile, [
                      id,
                    ])
                    let _user = {
                      id: id * 1,
                      handle: profile.handle,
                      ...identity,
                    }
                    if (!isNil(profile.imageURI)) {
                      _user.image = `https://cloudflare-ipfs.com/ipfs/${last(
                        profile.imageURI.split("/")
                      )}`
                    }
                    const uid = `lens:${_user.id}`
                    setUserMap(assoc(uid, _user, userMap))
                    setUser(_user)
                    await lf.setItem("user", _user)
                    const wuser = await sdk.get("users", uid)
                    if (isNil(wuser)) {
                      setEditUser(true)
                    } else {
                      setUserMap(assoc(uid, wuser, userMap))
                    }
                  } else {
                    alert("Something went wrong. Please try again.")
                  }
                } catch (e) {
                  alert(
                    "Something went wrong. You probably don't have a Lens Profile or your wallet is not connected to this domain."
                  )
                  console.log(e)
                }
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
              ) : (
                <Image src="/lens.webp" boxSize="20px" mr={3} />
              )}
              <Box fontWeight="bold">Sign In</Box>
            </Flex>
          ) : (
            <>
              <Image
                src={user.image}
                boxSize="35px"
                mx={2}
                title="Log Out"
                onClick={() => {
                  if (confirm("Would you like to sign out?")) {
                    setUser(null)
                    lf.removeItem("user")
                  }
                }}
                sx={{
                  borderRadius: "50%",
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              />
            </>
          )}
        </Flex>
      </Flex>
      <Flex
        height="250px"
        color="white"
        bg="#8B5CF6"
        w="100%"
        fontSize="40px"
        justify="center"
        align="center"
      >
        A Fully Decentralized Social Dapp Demo
      </Flex>
    </>
  )
}
