export const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    throw new ContractError(msg)
  } else {
    throw msg
  }
}
