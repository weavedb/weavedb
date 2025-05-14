const db = require("../scripts/lib/ops")

module.exports = {
  posts: [
    {
      key: "del_timeline",
      version: 2,
      on: "update",
      func: [
        ["=$is_delete", ["isNil", "$data.after.date"]],
        ["=$tl", ["get()", "tl", ["timeline", "$data.after.id"]]],
        [
          "when",
          ["both", ["always", "$is_delete"], ["always", "o$tl"]],
          ["toBatch", ["delete", "timeline", "$data.after.id"]],
          "$data",
        ],
      ],
    },
    {
      key: "timeline",
      version: 2,
      on: "create",
      func: [
        [
          "=$aid",
          [
            "when",
            ["isEmpty"],
            ["always", "$data.after.id"],
            "$data.after.repost",
          ],
        ],
        [
          "=$receive_id",
          [
            [
              "ifElse",
              [
                "either",
                ["propSatisfies", ["isNil"], "description"],
                ["propSatisfies", ["isNil"], "repost"],
              ],
              ["always", "$aid"],
              ["prop", "id"],
            ],
            "$data.after",
          ],
        ],
        [
          "=$rid",
          [
            [
              "ifElse",
              ["propSatisfies", ["isEmpty"], "repost"],
              ["always", ""],
              ["prop", "id"],
            ],
            "$data.after",
          ],
        ],
        [
          "=$followers",
          [
            "get()",
            ["follows", ["to", "==", "$data.after.owner"], ["last", "desc"]],
          ],
        ],
        ["=$received", ["get()", ["timeline", ["aid", "==", "$receive_id"]]]],
        [
          "=$receivers",
          [["compose", ["flatten"], ["pluck", "broadcast"]], "$received"],
        ],
        ["=$new_receivers", ["pluck", "from", "$followers"]],
        ["=$to", ["difference", "$new_receivers", "$receivers"]],
        ["=$to_not_empty", [["complement", ["isEmpty"]], "$to"]],
        [
          "=$set_timeline",
          [
            [
              "both",
              ["pathEq", ["after", "reply_to"], ""],
              ["always", "$to_not_empty"],
            ],
            "$data",
          ],
        ],
        [
          "when",
          ["always", "$set_timeline"],
          [
            "toBatch",
            [
              "set",
              {
                rid: "$rid",
                aid: "$aid",
                date: "$data.after.date",
                broadcast: "$to",
              },
              "timeline",
              "$data.after.id",
            ],
          ],
          "$data",
        ],
      ],
    },
    {
      key: "last",
      version: 2,
      on: "create",
      func: [
        [
          "=$aid",
          [
            "when",
            ["isEmpty"],
            ["always", "$data.after.repost"],
            "$data.after.reply_to",
          ],
        ],
        ["if", ["equals", "", "$aid"], ["break"]],
        ["=$post", ["get()", ["posts", "$aid"]]],
        ["=$docid", ["join", ":", ["$data.after.owner", "$post.owner"]]],
        ["=$following", ["get()", ["follows", "$docid"]]],
        [
          "if",
          "o$following",
          ["update()", [{ last: db.ts() }, "follows", "$docid"]],
        ],
      ],
    },
    {
      key: "inc_reposts",
      version: 2,
      on: "create",
      func: [
        [
          "unless",
          ["pathEq", ["after", "repost"], ""],
          [
            "toBatch",
            ["update", { reposts: db.inc(1) }, "posts", "$data.after.repost"],
          ],
          "$data",
        ],
        [
          "when",
          [
            "both",
            [["complement", ["pathEq"]], ["after", "repost"], ""],
            [
              ["complement", ["pathSatisfies"]],
              ["isNil"],
              ["after", "description"],
            ],
          ],
          [
            "toBatch",
            ["update", { quotes: db.inc(1) }, "posts", "$data.after.repost"],
          ],
          "$data",
        ],
      ],
    },
    {
      key: "inc_comments",
      version: 2,
      on: "create",
      func: [
        [
          "when",
          [
            "both",
            ["complement", ["isNil"]],
            [
              "o",
              [["complement", ["equals"]], ""],
              ["var", "data.after.reply_to"],
            ],
          ],
          [
            "pipe",
            [
              "map",
              [
                [
                  "append",
                  ["__"],
                  ["[]", "update", { comments: db.inc(1) }, "posts"],
                ],
              ],
            ],
            ["let", "batch"],
          ],
          "$data.after.parents",
        ],
      ],
    },
  ],
  follows: [
    {
      key: "follow",
      version: 2,
      on: "create",
      func: [
        ["update()", [{ followers: db.inc(1) }, "users", "$data.after.to"]],
        ["update()", [{ following: db.inc(1) }, "users", "$data.after.from"]],
        ["=$docid", ["join", ":", ["$data.after.from", "$data.after.to"]]],
        ["update()", [{ last: db.ts() }, "follows", "$docid"]],
      ],
    },
    {
      key: "unfollow",
      version: 2,
      on: "delete",
      func: [
        ["update()", [{ followers: db.inc(-1) }, "users", "$data.before.to"]],
        ["update()", [{ following: db.inc(-1) }, "users", "$data.before.from"]],
      ],
    },
  ],
  likes: [
    {
      key: "inc_like",
      version: 2,
      on: "create",
      func: [
        ["=$art", ["get()", ["posts", "$data.after.aid"]]],
        ["=$week", ["subtract", "$block.timestamp", 60 * 60 * 24 * 7]],
        [
          "=$new_pt",
          [
            "add",
            1,
            [
              "multiply",
              ["defaultTo", 0, "$art.pt"],
              [
                "subtract",
                1,
                [
                  "divide",
                  [
                    "subtract",
                    "$block.timestamp",
                    ["defaultTo", "$week", "$art.ptts"],
                  ],
                  "$week",
                ],
              ],
            ],
          ],
        ],
        [
          "update()",
          [
            {
              likes: db.inc(1),
              pt: "$new_pt",
              ptts: db.ts(),
              last_like: db.ts(),
            },
            "posts",
            "$data.after.aid",
          ],
        ],
      ],
    },
  ],
  users: [
    {
      key: "inc_invited",
      version: 2,
      on: "create",
      func: [
        [
          "update()",
          [{ invited: db.inc(1) }, "users", "$data.after.invited_by"],
        ],
      ],
    },
  ],
}
