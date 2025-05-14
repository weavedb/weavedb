module.exports = {
  points: [
    {
      key: "issue",
      version: 2,
      on: "create",
      func: [
        [
          "=$balance_id",
          ["join", ":", ["$data.after.owner", "$data.after.symbol"]],
        ],
        [
          "upsert()",
          [
            {
              balance: { __op: "inc", n: 0 },
              address: "$data.after.owner",
              symbol: "$data.after.symbol",
            },
            "balances",
            "$balance_id",
          ],
        ],
      ],
    },
  ],
  events: [
    {
      key: "mint",
      version: 2,
      on: "create",
      func: [
        [
          "=$balance_id",
          ["join", ":", ["$data.after.to", "$data.after.symbol"]],
        ],
        [
          "if",
          ["equals", "$data.after.op", "mint"],
          [
            "upsert()",
            [
              {
                balance: { __op: "inc", n: "$data.after.amount" },
                address: "$data.after.to",
                symbol: "$data.after.symbol",
              },
              "balances",
              "$balance_id",
            ],
          ],
        ],
      ],
    },
    {
      key: "transfer",
      version: 2,
      on: "create",
      func: [
        [
          "=$balance_id",
          ["join", ":", ["$data.after.to", "$data.after.symbol"]],
        ],
        [
          "=$balance_id2",
          ["join", ":", ["$data.after.from", "$data.after.symbol"]],
        ],
        [
          "if",
          ["equals", "$data.after.op", "transfer"],
          [
            "upsert()",
            [
              {
                balance: { __op: "inc", n: "$data.after.amount" },
                address: "$data.after.to",
                symbol: "$data.after.symbol",
              },
              "balances",
              "$balance_id",
            ],
          ],
        ],
        ["=$minus", ["negate", "$data.after.amount"]],
        [
          "if",
          ["equals", "$data.after.op", "transfer"],
          [
            "upsert()",
            [
              {
                balance: { __op: "inc", n: "$minus" },
                address: "$data.after.from",
                symbol: "$data.after.symbol",
              },
              "balances",
              "$balance_id2",
            ],
          ],
        ],
      ],
    },
  ],
}
