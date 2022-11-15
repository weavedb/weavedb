export const err = (msg = `The wrong query`) => {
  throw new Error(msg)
}

export const clone = state => JSON.parse(JSON.stringify(state))

export const wrapResult = result => ({ result: { ...result, success: true } })
