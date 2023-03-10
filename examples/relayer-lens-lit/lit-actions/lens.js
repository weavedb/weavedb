const go = async () => {
  const tokenID = params.query.linkTo.split(":")[1]
  const address = params.caller
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  const query = {
    func: "relay",
    query: [
      typeof jobID === "undefined" ? "auth:lens" : jobID,
      params,
      { linkTo: "lens:" + tokenID },
    ],
  }
  const message = {
    nonce,
    query: JSON.stringify(query),
  }
  const data = {
    types: {
      EIP712Domain,
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain: {
      name: typeof name === "undefined" ? "weavedb" : name,
      version: typeof version === "undefined" ? "1" : version,
      verifyingContract: contractTxId,
    },
    primaryType: "Query",
    message,
  }
  const conditions = [
    {
      contractAddress: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
      standardContractType: "ERC721",
      chain: "polygon",
      method: "ownerOf",
      parameters: [tokenID],
      returnValueTest: {
        comparator: "=",
        value: address,
      },
    },
  ]
  if (
    !(await Lit.Actions.checkConditions({
      conditions,
      authSig,
      chain: "polygon",
    }))
  ) {
    return
  }
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
    message: JSON.stringify(data),
    publicKey,
    sigName: "sig1",
  })
}
go()
