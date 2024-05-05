const db = require("../scripts/lib/ops")

module.exports = {
  calc_pt: {
    version: 2,
    span: 60 * 60 * 1,
    jobs: [
      ["=$week", ["subtract", "$block.timestamp", 60 * 60 * 24 * 7]],
      ["=$posts", ["get()", ["posts", ["ptts"], 500]]],
      [
        "=$toB",
        [
          "map",
          [
            "pipe",
            ["let", "art"],
            ["prop", "ptts"],
            ["defaultTo", "$week"],
            ["subtract", "$block.timestamp"],
            ["divide", ["__"], "$week"],
            ["subtract", 1],
            ["let", "num"],
            ["var", "art.pt"],
            ["defaultTo", 0],
            ["let", "pt"],
            ["var", ["pt", "num"]],
            ["apply", ["multiply"]],
            ["let", "new_pt"],
            [
              "var",
              [
                "%update",
                { pt: "new_pt", ptts: { __op: "%ts" } },
                "%posts",
                "art.id",
              ],
            ],
          ],
          "$posts",
        ],
      ],
      ["toBatchAll()", "$toB"],
    ],
  },
  del_pt: {
    version: 2,
    span: 60 * 60 * 1,
    jobs: [
      ["=$week", ["subtract", "$block.timestamp", 60 * 60 * 24 * 7]],
      ["=$posts", ["get()", ["posts", ["last_like", "<", "$week"], 500]]],
      [
        "=$toB",
        [
          "map",
          [
            "pipe",
            ["prop", "id"],
            [
              "append",
              ["__"],
              [
                "[]",
                "update",
                { last_like: db.del(), pt: 0, ptts: db.del() },
                "posts",
              ],
            ],
          ],
          "$posts",
        ],
      ],
      ["toBatchAll()", "$toB"],
    ],
  },
}
