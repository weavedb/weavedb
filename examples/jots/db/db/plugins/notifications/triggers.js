const db = require("../../../scripts/lib/ops")

module.exports = {
  notifications: [
    {
      key: "inc_count",
      on: "create",
      version: 2,
      func: [
        [
          "unless",
          ["pathEq", ["after", "to"], "$data.after.from"],
          [
            "toBatch",
            ["upsert", { count: db.inc(1) }, "counts", "$data.after.to"],
          ],
          "$data",
        ],
      ],
    },
    {
      key: "dec_count",
      on: "update",
      version: 2,
      func: [
        [
          "when",
          [
            [
              "allPass",
              [
                "[]",
                [
                  ["complement", ["pathEq"]],
                  ["after", "to"],
                  "$data.after.from",
                ],
                ["pathEq", ["after", "viewed"], true],
                ["pathEq", ["before", "viewed"], false],
              ],
            ],
          ],
          [
            "toBatch",
            ["upsert", { count: db.inc(-1) }, "counts", "$data.after.to"],
          ],
          "$data",
        ],
      ],
    },
  ],
}
