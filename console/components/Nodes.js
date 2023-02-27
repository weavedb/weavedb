import { Box, Flex } from "@chakra-ui/react"
import { isNil, map } from "ramda"
import { inject } from "roidjs"
import { read, _remove, setupWeaveDB } from "../lib/weavedb"

export default inject(
  ["loading", "temp_current_all", "temp_current", "loading_node", "tx_logs"],
  ({
    setContracts,
    setNewWhitelistUser,
    isNodeOwner,
    setNumLimit,
    setAllow,
    setLimit,
    nodes,
    whitelist,
    setAddWhitelist,
    setEditWhitelist,
    contracts,
    nodeUser,
    isWhitelisted,
    setAddNode,
    setNode,
    node,
    removeGRPCNode,
    setAddNodeOwner,
    setAddContract,
    updateGRPCNode,
    $,
    set,
    fn,
  }) => (
    <>
      <Flex flex={1} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Nodes
          <Box flex={1} />
          <Box
            onClick={() => setAddNode(true)}
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
            {map(v => (
              <Flex
                onClick={async () => {
                  set(v.rpc, "loading_node")
                  let prevnode = node
                  try {
                    setNode(v)
                    const db = await fn(setupWeaveDB)({
                      contractTxId: v.contract,
                      rpc: v.rpc,
                      temp: true,
                    })
                    const start = Date.now()
                    const stats = await fn(read)({
                      db,
                      m: "node",
                      q: { op: "stats" },
                      arr: false,
                    })
                    const queryTime = Date.now() - start
                    const newNode = {
                      queryTime,
                      contract: stats.contractTxId,
                      rpc: v.rpc,
                      owners: stats.owners,
                    }
                    setNode(newNode)
                    await updateGRPCNode(newNode)
                  } catch (e) {
                    console.log(e)
                    setNode(prevnode)
                    alert("couldn't connect with the node")
                  }
                  set(null, "loading_node")
                }}
                bg={!isNil(node) && node.rpc === v.rpc ? "#ddd" : ""}
                py={2}
                px={3}
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
              >
                <Box mr={3} flex={1}>
                  {v.rpc}
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
                    if (!confirm("Would you like to remove the node?")) {
                      return
                    }
                    if (isNil($.loading)) {
                      set("remove_node", "loading")
                      removeGRPCNode(v)
                      set(null, "loading")
                    }
                  }}
                >
                  <Box as="i" className="fas fa-trash" />
                </Box>
              </Flex>
            ))(nodes || [])}
          </Box>
        </Box>
      </Flex>
      <Flex flex={2} sx={{ border: "1px solid #555" }} direction="column">
        <Flex py={2} px={3} color="white" bg="#333" h="35px">
          Your Contracts (
          {isNil(nodeUser)
            ? "-"
            : `${contracts.length} / ${
                isNil(nodeUser.limit) ? "unlimited" : nodeUser.limit
              }`}
          )
          <Box flex={1} />
          {isNil($.temp_current_all) || !isWhitelisted ? null : (
            <Box
              onClick={() => {
                if (
                  !isNil(nodeUser.limit) &&
                  nodeUser.limit <= contracts.length
                ) {
                  alert("You have reached the limit")
                  return
                }
                setAddContract(true)
              }}
              sx={{
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              <Box as="i" className="fas fa-plus" />
            </Box>
          )}
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
            {isNil(node) ? (
              <Flex justify="center" align="center" height="100%">
                Please select a node.
              </Flex>
            ) : isNil($.temp_current_all) ? (
              <Flex justify="center" align="center" height="100%">
                Please connect a wallet.
              </Flex>
            ) : !isWhitelisted ? (
              <Flex justify="center" align="center" height="100%">
                You are not whitelisted for this node.
              </Flex>
            ) : contracts.length === 0 ? (
              <Flex justify="center" align="center" height="100%">
                Add a contract.
              </Flex>
            ) : (
              <Box height="500px" sx={{ overflowY: "auto" }}>
                {map(v => (
                  <Flex p={2} px={3}>
                    <Box flex={1}>{v.txid}</Box>
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
                        if (confirm("Would you like to remove the contract?")) {
                          const res = await fn(_remove)({
                            contractTxId: node.contract,
                            txid: v.txid,
                            rpc: node.rpc,
                          })
                          if (!res[0]?.[0]?.success) {
                            alert("something went wrong")
                          } else {
                            const db = await fn(setupWeaveDB)({
                              contractTxId: node.contract,
                              rpc: node.rpc,
                            })
                            const addr = /^0x.+$/.test($.temp_current_all.addr)
                              ? $.temp_current_all.addr.toLowerCase()
                              : $.temp_current_all.addr
                            setContracts(
                              await fn(read)({
                                db,
                                m: "get",
                                q: ["contracts", ["address", "=", addr], true],
                              })
                            )
                          }
                        }
                      }}
                    >
                      <Box as="i" className="fas fa-trash" />
                    </Box>
                  </Flex>
                ))(contracts)}
              </Box>
            )}
          </Box>
        </Box>
      </Flex>
      <Flex flex={2} sx={{ border: "1px solid #555" }} direction="column">
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
            {isNil(node) ? (
              <Flex justify="center" align="center" height="100%">
                Please select a node.
              </Flex>
            ) : $.loading_node === node.rpc ? (
              <Flex justify="center" align="center" height="100%">
                <Box
                  color="#6441AF"
                  as="i"
                  className="fas fa-spin fa-circle-notch"
                  fontSize="50px"
                />
              </Flex>
            ) : (
              <>
                <Flex align="flex-start" p={2} px={3}>
                  <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    Contract
                  </Box>
                  <Box flex={1}>
                    <Box
                      as="a"
                      target="_blank"
                      href={`https://sonar.warp.cc/?#/app/contract/${node.contract}`}
                      color="#6441AF"
                      sx={{ textDecoration: "underline" }}
                    >
                      {node.contract}
                    </Box>
                  </Box>
                </Flex>
                <Flex align="flex-start" p={2} px={3}>
                  <Box mr={2} px={3} bg="#ddd" sx={{ borderRadius: "3px" }}>
                    Read Query Speed
                  </Box>
                  <Box flex={1}>{node.queryTime} ms</Box>
                </Flex>
                <Flex align="flex-start" p={2} px={3}>
                  <Box
                    mr={2}
                    px={3}
                    bg={isNodeOwner ? "#6441AF" : "#ddd"}
                    color={isNodeOwner ? "white" : "#333"}
                    sx={{ borderRadius: "3px" }}
                  >
                    Admin
                  </Box>
                  <Box flex={1}>
                    {map(v => <Box>{v}</Box>)(node.owners || [])}
                  </Box>
                  {!isNodeOwner ? null : (
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
                        if (!isNodeOwner) {
                          alert(`Sign in with the owner account.`)
                          return
                        }
                        setAddNodeOwner(true)
                      }}
                    >
                      <Box as="i" className="fas fa-edit" />
                    </Box>
                  )}
                </Flex>
                {!isNodeOwner ? null : (
                  <>
                    <Flex align="center" p={2} px={3}>
                      <Flex
                        sx={{ borderBottom: "1px solid #333" }}
                        w="100%"
                        pb={1}
                      >
                        <Box flex={1} sx={{ borderRadius: "3px" }}>
                          Whitelist
                        </Box>
                        <Box
                          color="#333"
                          sx={{
                            cursor: "pointer",
                            ":hover": {
                              opacity: 0.75,
                              color: "#6441AF",
                            },
                          }}
                          mr="3px"
                          onClick={async e => {
                            setNewWhitelistUser("")
                            setAddWhitelist(true)
                          }}
                        >
                          <Box as="i" className="fas fa-plus" />
                        </Box>
                      </Flex>
                    </Flex>
                    <Flex direction="column" align="center">
                      {map(v => (
                        <Flex w="100%" px={3} py={2}>
                          <Flex sx={{ wordBreak: "break-all" }} flex={1}>
                            {v.address}
                          </Flex>
                          <Flex justify="center" mr={2} w="30px">
                            {!v.allow ? 0 : isNil(v.limit) ? "∞" : v.limit}
                          </Flex>
                          <Box
                            w="13.5px"
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
                              if (!isNodeOwner) {
                                alert(`Sign in with the owner account.`)
                                return
                              }
                              setNewWhitelistUser(v.address)
                              setAllow(v.allow)
                              setLimit(!isNil(v.limit))
                              setNumLimit(
                                !isNil(v.limit) ? v.limit.toString() : "5"
                              )
                              setEditWhitelist(true)
                              setAddWhitelist(true)
                            }}
                          >
                            <Box as="i" className="fas fa-edit" />
                          </Box>
                        </Flex>
                      ))(whitelist || [])}
                    </Flex>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      </Flex>
    </>
  )
)
