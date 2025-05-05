import { of, pof } from "./monade.js"

const db = obj => {
  obj ??= { env: {}, state: {} }
  return of(obj, {
    to: {
      get: () => obj => {
        return obj.state
      },
    },
    map: {
      init: msg => obj => {
        obj.state = [
          { 0: { name: "__dirs__" }, 1: { name: "__config__" } },
          { id: msg.id, owner: msg.from },
        ]
        return obj
      },
      set: msg => obj => {
        const [op, ...rest] = msg.q
        const [data, dir, doc] = rest
        switch (op) {
          case "set":
            obj.state[dir] ??= {}
            obj.state[dir][doc] = data
            break
        }
        return obj
      },
    },
  })
}

export default db
