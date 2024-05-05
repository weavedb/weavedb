const { matchFilters } = require("nostr-tools")
const { WebSocketServer } = require("ws")
const { is, concat, isNil } = require("ramda")
let connCount = 0
let events = []
let subs = new Map()

let lastPurge = Date.now()

class Nostr {
  constructor(socket, server, db = "offchain") {
    this.db = db
    this.server = server
    this._socket = socket
    this._subs = new Set()
  }
  cleanup() {
    this._socket.close()

    for (const subId of this._subs) {
      this.removeSub(subId)
    }
  }
  addSub(subId, filters) {
    subs.set(subId, { instance: this, filters })
    this._subs.add(subId)
  }
  removeSub(subId) {
    subs.delete(subId)
    this._subs.delete(subId)
  }
  send(message) {
    this._socket.send(JSON.stringify(message))
  }
  handle(message) {
    try {
      message = JSON.parse(message)
    } catch (e) {
      this.send(["NOTICE", "", "Unable to parse message"])
    }

    let verb, payload
    try {
      ;[verb, ...payload] = message
    } catch (e) {
      this.send(["NOTICE", "", "Unable to read message"])
    }

    const handler = this[`on${verb}`]

    if (handler) {
      handler.call(this, ...payload)
    } else {
      this.send(["NOTICE", "", "Unable to handle message"])
    }
  }
  onCLOSE(subId) {
    this.removeSub(subId)
  }
  onREQ(subId, ...filters) {
    console.log("REQ", subId, ...filters)
    this.addSub(subId, filters)
    let done = 0
    for (const f of filters) {
      let query = ["nostr_events", ["created_at", "desc"]]
      let equals = []
      let ins = []

      for (let f2 of [
        ["id", "id"],
        ["authors", "pubkey"],
        ["kinds", "kind"],
      ]) {
        const f3 = f[f2[0]]
        if (!isNil(f3) && is(Array, f3) && f3.length > 0) {
          if (f3.length === 1) {
            equals.push([f2[1], "==", f3[0]])
          } else {
            ins.push([f2[1], "in", f3])
          }
          if (f2[0] === "id") break
        }
      }
      query = concat(query, equals)
      query = concat(query, ins)
      if (!isNil(f.since) && is(Number, f.since)) {
        query.push(["created_at", "<", f.since])
      }
      if (!isNil(f.until) && is(Number, f.until)) {
        query.push(["created_at", ">", f.until])
      }
      if (!isNil(f.limit) && is(Number, f.limit)) {
        query.push(f.limit > 1000 ? 1000 : f.limit)
      }
      this.server.queryNostr(
        { query, function: "get" },
        this.db,
        (err, res) => {
          try {
            if (isNil(err)) {
              for (const v of JSON.parse(res.result)) {
                this.send(["EVENT", subId, v])
              }
            }
          } catch (e) {
            console.log(e)
          }
          done++
          if (filters.length === done) {
            console.log("EOSE")
            this.send(["EOSE", subId])
          }
        }
      )
    }
    /*
    for (const event of events) {
      if (matchFilters(filters, event)) {
        console.log("match", subId, event)
        //this.send(["EVENT", subId, event])
      } else {
        console.log("miss", subId, event)
      }
    }*/
  }
  onEVENT(event) {
    events.push(event)
    console.log("EVENT", event, true)
    this.server.queryNostr(
      {
        query: { function: "nostr", query: event },
        function: "nostr",
      },
      this.db,
      (err, res) => {
        this.send(["OK", event.id])
        for (const [subId, { instance, filters }] of subs.entries()) {
          if (matchFilters(filters, event)) {
            console.log("match", subId, event)
            instance.send(["EVENT", subId, event])
          }
        }
      }
    )
  }
}

const nostr = ({ port = 4736, server, purge_interval, db = "offchain" }) => {
  if (purge_interval) {
    console.log("Purging events every", purge_interval, "seconds")
    setInterval(() => {
      lastPurge = Date.now()
      events = []
    }, purge_interval * 1000)
  }

  const pid = Math.random().toString().slice(2, 8)
  const wss = new WebSocketServer({ port })

  console.log("Running on port", port)

  wss.on("connection", socket => {
    connCount += 1

    console.log("Received connection", { pid, connCount })

    const relay = new Nostr(socket, server, db)

    if (purge_interval) {
      const now = Date.now()
      relay.send([
        "NOTICE",
        "",
        "Next purge in " +
          Math.round((purge_interval * 1000 - (now - lastPurge)) / 1000) +
          " seconds",
      ])
    }

    socket.on("message", msg => relay.handle(msg))
    socket.on("error", e => console.error("Received error on client socket", e))
    socket.on("close", () => {
      relay.cleanup()

      connCount -= 1

      console.log("Closing connection", { pid, connCount })
    })
  })
}

module.exports = { nostr }
