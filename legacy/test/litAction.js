const go = async () => {
  let isOwner = false
  let err = null
  const data_str = JSON.stringify(data)
  LitActions.setResponse({ response: JSON.stringify({ data }) })
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
    message: data_str,
    publicKey,
    sigName,
  })
}

go()
