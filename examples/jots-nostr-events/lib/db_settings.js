const db = {
  inc: n => {
    return { __op: "inc", n }
  },
  ts: () => {
    return { __op: "ts" }
  },
  del: () => {
    return { __op: "del" }
  },
}

const offchain = {
  rules: {
    nostr_events: [
      [
        "set:nostr_events",
        [
          ["=$event", ["get()", ["nostr_events", "$id"]]],
          ["if", "o$event", ["deny()"]],
          ["allow()"],
        ],
      ],
    ],
  },
  indexes: {
    nostr_events: [
      [["kind"], ["pubkey"], ["created_at", "desc"]],
      [["id"], ["created_at", "desc"]],
      [["kind"], ["created_at", "desc"]],
      [["pubkey"], ["created_at", "desc"]],
      [["pubkey"], ["kind"], ["created_at", "desc"]],
      [["kind"], ["pubkey"], ["created_at", "desc"]],
    ],
  },
}

module.exports = { offchain }
