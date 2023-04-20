import { Box, Flex } from "@chakra-ui/react"
import { inject } from "roidjs"
import { useState } from "react"
import {
  includes,
  uniq,
  concat,
  pluck,
  isNil,
  mapObjIndexed,
  values,
  compose,
  map,
} from "ramda"
import { read, setupWeaveDB } from "../lib/weavedb"
import { preset_rpcs } from "../lib/const"
export default inject(
  ["loading_contract", "tx_logs"],
  ({
    deployMode,
    setDeployMode,
    setEditGRPC,
    editGRPC,
    setPresetRPC,
    setNewRPCType,
    nodes,
    setNewHttp,
    setAddInstance,
    contractTxId,
    port,
    setState,
    setNetwork,
    setCurrentDB,
    setContractTxId,
    dbs,
    state,
    currentDB,
    setNewRPC2,
    setAddGRPC,
    network,
    owners,
    isOwner,
    setAddOwner,
    setAddSecure,
    setAddAlgorithms,
    setAddCanEvolve,
    setAddEvolve,
    _setContractTxId,
    removeDB,
    fn,
    $,
  }) => {
    const [loading, setLoading] = useState(null)
    return (
      <>
        <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
          <Flex py={2} px={3} color="white" bg="#333" h="35px">
            WeaveDB Instances
            <Box flex={1} />
            <Box
              onClick={() => setAddInstance(true)}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              <Box as="i" className="fas fa-plus" />
            </Box>
          </Flex>
          <Box flex={1} sx={{ position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                overflowY: "auto",
              }}
            >
              {compose(
                map(v => (
                  <Flex
                    onClick={async () => {
                      let isErr = false
                      if (contractTxId !== v.contractTxId) {
                        if (v.network === "Localhost" && isNil(port)) {
                          alert("not connected with localhost")
                          return
                        }
                        setLoading(v.contractTxId)
                        try {
                          const db = await fn(setupWeaveDB)({
                            network: v.network,
                            contractTxId: v.contractTxId,
                            port: port || 1820,
                            rpc: v.rpc,
                          })
                          let state = await fn(read)({
                            db,
                            m: "getInfo",
                            q: [],
                          })
                          if (isNil(state.version)) {
                            state.version = await fn(read)({
                              db,
                              m: "getVersion",
                              q: [true],
                            })
                          }
                          if (!isNil(state.version)) {
                            setState(null)
                            setNetwork(v.network)
                            setCurrentDB(v)
                            await _setContractTxId(
                              v.contractTxId,
                              v.network,
                              v.rpc,
                              null,
                              state
                            )
                          } else {
                            isErr = true
                          }
                        } catch (e) {
                          console.log(e)
                          isErr = true
                        }
                        if (isErr) {
                          alert(
                            "couldn't connect to the contract. Web Console is only compatible with v0.18 and above."
                          )
                          setEditGRPC(v)
                          setAddGRPC(true)
                        }
                        setLoading(null)
                      }
                    }}
                    p={2}
                    px={3}
                    bg={contractTxId === v.contractTxId ? "#ddd" : ""}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                  >
                    <Box
                      mr={2}
                      px={3}
                      w="80px"
                      textAlign="center"
                      bg={v.network === "Mainnet" ? "#6441AF" : "#333"}
                      color="white"
                      sx={{ borderRadius: "3px" }}
                    >
                      {v.network}
                    </Box>
                    <Box flex={1}>{v.contractTxId}</Box>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (
                          confirm(
                            "Would you like to remove the link to this instance?"
                          )
                        ) {
                          removeDB(v)
                          if (contractTxId === v.contractTxId) {
                            setState(null)
                            setNetwork("Mainnet")
                            setContractTxId(null)
                          }
                        }
                      }}
                    >
                      <Box
                        as="i"
                        className={
                          loading === v.contractTxId
                            ? "fas fa-spin fa-circle-notch"
                            : "fas fa-trash"
                        }
                      />
                    </Box>
                  </Flex>
                ))
              )(dbs)}
            </Box>
          </Box>
        </Flex>
        <Flex
          flex={1}
          h="100%"
          sx={{ border: "1px solid #555" }}
          direction="column"
        >
          <Flex py={2} px={3} color="white" bg="#333" h="35px">
            Settings
            <Box flex={1} />
          </Flex>
          <Box flex={1} sx={{ position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                overflowY: "auto",
              }}
            >
              {isNil(contractTxId) || isNil(currentDB) ? (
                <Flex justify="center" align="center" height="100%">
                  <Flex
                    py={2}
                    px={6}
                    mx={2}
                    w="150px"
                    bg={"#6441AF"}
                    color="white"
                    sx={{
                      borderRadius: "25px",
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                    justifyContent="center"
                    onClick={async () => {
                      setDeployMode("Connect")
                      setAddInstance(true)
                    }}
                  >
                    Connect with DB
                  </Flex>
                  <Flex
                    mx={2}
                    py={2}
                    px={6}
                    w="150px"
                    bg={"#6441AF"}
                    color="white"
                    sx={{
                      borderRadius: "25px",
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                    justifyContent="center"
                    onClick={async () => {
                      setDeployMode("Deploy")
                      setAddInstance(true)
                    }}
                  >
                    Deploy WeaveDB
                  </Flex>
                </Flex>
              ) : contractTxId === $.loading_contract ? (
                <Flex justify="center" align="center" height="100%">
                  <Box
                    color="#6441AF"
                    as="i"
                    className="fas fa-spin fa-circle-notch"
                    fontSize="50px"
                  />
                </Flex>
              ) : isNil(state) || isNil(state.auth) ? null : (
                <>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      gRPC Node
                    </Box>
                    <Box flex={1}>
                      {(currentDB.rpc || "") === ""
                        ? "None (Browser SDK)"
                        : currentDB.rpc}
                    </Box>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        const rpcs = compose(
                          uniq,
                          concat(preset_rpcs),
                          pluck("rpc")
                        )(nodes)
                        if (
                          !isNil(currentDB.rpc) &&
                          includes(currentDB.rpc)(rpcs)
                        ) {
                          setNewRPCType("preset")
                          setPresetRPC(currentDB.rpc)
                        }
                        setNewRPC2(
                          isNil(currentDB.rpc)
                            ? ""
                            : currentDB.rpc.replace(/^http[s]{0,1}:\/\//i, "")
                        )
                        setNewHttp(
                          /^http:\/\//.test(currentDB.rpc || "")
                            ? "http://"
                            : "https://"
                        )
                        setAddGRPC()
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      contractTxId
                    </Box>
                    <Box
                      as="a"
                      target="_blank"
                      color={network === "Mainnet" ? "#6441AF" : "#333"}
                      sx={{
                        textDecoration:
                          network === "Mainnet" ? "underline" : "none",
                      }}
                      href={
                        network === "Mainnet"
                          ? `https://sonar.warp.cc/?#/app/contract/${contractTxId}`
                          : null
                      }
                    >
                      {contractTxId}
                    </Box>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      Network
                    </Box>
                    {network}
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      DB Version
                    </Box>
                    {state.version || "-"}
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      EIP712 Name
                    </Box>
                    {state.auth.name}
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      EIP712 Version
                    </Box>
                    {state.auth.version}
                  </Flex>
                  <Flex align="flex-start" p={2} px={3}>
                    <Box
                      mr={2}
                      px={3}
                      bg={isOwner ? "#6441AF" : "#ddd"}
                      color={isOwner ? "white" : "#333"}
                      sx={{ borderRadius: "3px" }}
                    >
                      Owner
                    </Box>
                    <Box flex={1}>{map(v => <Box>{v}</Box>)(owners)}</Box>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (!isOwner) {
                          alert(`Sign in with the owner account.`)
                          return
                        }
                        setAddOwner(true)
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      secure
                    </Box>
                    <Flex flex={1}>{state.secure ? "true" : "false"}</Flex>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (!isOwner) {
                          alert(`Sign in with the owner account.`)
                          return
                        }
                        setAddSecure(true)
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      Authentication
                    </Box>
                    <Flex flex={1}>
                      {map(v => <Box mr={2}>{v}</Box>)(
                        state.auth.algorithms || []
                      )}
                    </Flex>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (!isOwner) {
                          alert(`Sign in with the owner account.`)
                          return
                        }
                        setAddAlgorithms(true)
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Flex
                      sx={{ borderBottom: "1px solid #333" }}
                      w="100%"
                      pb={1}
                    >
                      <Box sx={{ borderRadius: "3px" }}>Evolve</Box>
                    </Flex>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      canEvolve
                    </Box>
                    <Flex flex={1}>{state.canEvolve ? "true" : "false"}</Flex>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (!isOwner) {
                          alert(`Sign in with the owner account.`)
                          return
                        }
                        setAddCanEvolve(true)
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  </Flex>
                  <Flex align="center" p={2} px={3}>
                    <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                      evolve
                    </Box>
                    <Flex flex={1} align="center">
                      {isNil(state.evolve) ? "null" : state.evolve}
                      {state.isEvolving ? (
                        <Box
                          ml={1}
                          color="#6441AF"
                          sx={{ textDecoration: "underline" }}
                        >
                          (migration required!)
                        </Box>
                      ) : null}
                    </Flex>
                    <Box
                      color="#999"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          opacity: 0.75,
                          color: "#6441AF",
                        },
                      }}
                      onClick={async e => {
                        e.stopPropagation()
                        if (!isOwner) {
                          alert(`Sign in with the owner account.`)
                          return
                        }
                        setAddEvolve(true)
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  </Flex>
                  {(state.evolveHistory || []).length === 0 ? null : (
                    <Flex align="flex-start" p={2} px={3}>
                      <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                        evolve history
                      </Box>
                      <Box flex={1}>
                        {map(v => (
                          <Box>
                            {v.srcTxId} (v{v.newVersion})
                          </Box>
                        ))(state.evolveHistory)}
                      </Box>
                    </Flex>
                  )}
                  <Flex align="center" p={2} px={3}>
                    <Flex
                      sx={{ borderBottom: "1px solid #333" }}
                      w="100%"
                      pb={1}
                    >
                      <Box sx={{ borderRadius: "3px" }}>Plugin Contracts</Box>
                    </Flex>
                  </Flex>
                  <Flex direction="column" align="center">
                    {compose(
                      values,
                      mapObjIndexed((v, k, i) => (
                        <Flex w="100%" px={3} py={2}>
                          <Flex
                            mr={2}
                            px={3}
                            bg="#ddd"
                            sx={{ borderRadius: "3px" }}
                          >
                            {k}
                          </Flex>
                          <Box flex={1} mr={2}>
                            {v}
                          </Box>
                        </Flex>
                      ))
                    )(state.contracts || [])}
                  </Flex>
                </>
              )}
            </Box>
          </Box>
        </Flex>
      </>
    )
  }
)
