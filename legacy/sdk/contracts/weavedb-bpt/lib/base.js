const read = async (contract, param, SmartWeave) => {
  return (await SmartWeave.contracts.viewContractState(contract, param)).result
}

const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

module.exports = { read, err }
