const go = async () => {
  for (const v of [
    lit_ipfsId,
    infura_key,
    params,
    params.jobID,
    publicKey,
    sigName,
  ]) {
    if (v === null || typeof v === "undefined") return
  }

  const abi = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ]

  let owner = "0x"
  const tokenID = params.query[0].tokenID
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://goerli.infura.io/v3/" + infura_key
    )
    owner = await new ethers.Contract(
      "0xfF2914F36A25B5E1732F4F62C840b1534Cc3cD68",
      abi,
      provider
    ).ownerOf(tokenID)
    const data = {
      extra: owner,
      jobID: params.jobID,
      lit_ipfsId,
      params,
    }

    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
      message: JSON.stringify(data),
      publicKey,
      sigName,
    })
    LitActions.setResponse({
      response: JSON.stringify({ message: data }),
    })
  } catch (e) {
    return
  }
}

go()
