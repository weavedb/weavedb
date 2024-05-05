module.exports = {
  inc: n => {
    return { __op: "inc", n }
  },
  ts: () => {
    return { __op: "ts" }
  },
  del: () => {
    return { __op: "del" }
  },
  data: key => {
    return { __op: "data", key }
  },

  signer: () => {
    return { __op: "signer" }
  },

  ts: () => {
    return { __op: "ts" }
  },

  ms: () => {
    return { __op: "ms" }
  },

  del: () => {
    return { __op: "del" }
  },

  inc: n => {
    return { __op: "inc", n }
  },

  union: (...args) => {
    return { __op: "arrayUnion", arr: args }
  },

  remove: (...args) => {
    return { __op: "arrayRemove", arr: args }
  },
}
