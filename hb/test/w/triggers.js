const inc_invited = {
  key: "inc_invited",
  on: "create",
  fn: [
    ["update()", [{ invited: { _$: ["inc"] } }, "users", "$after.invited_by"]],
  ],
}

const follow = {
  key: "follow",
  on: "create",
  fn: [
    ["update()", [{ followers: { _$: ["inc"] } }, "users", "$after.to"]],
    ["update()", [{ following: { _$: ["inc"] } }, "users", "$after.from"]],
    ["update()", [{ last: { _$: "ts" } }, "follows", "$doc"]],
  ],
}

const unfollow = {
  key: "unfollow",
  on: "delete",
  fn: [
    ["update()", [{ followers: { _$: ["dec"] } }, "users", "$before.to"]],
    ["update()", [{ following: { _$: ["dec"] } }, "users", "$before.from"]],
  ],
}

const inc_likes = {
  key: "inc_like",
  on: "create",
  fn: [
    ["=$art", ["get()", ["posts", "$after.aid"]]],
    ["=$week", ["subtract", "$ts", 60 * 60 * 24 * 7]],
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
              ["subtract", "$ts", ["defaultTo", "$week", "$art.ptts"]],
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
          likes: { _$: ["inc"] },
          pt: "$new_pt",
          ptts: { _$: "ts" },
          last_like: { _$: "ts" },
        },
        "posts",
        "$after.aid",
      ],
    ],
  ],
}

const timeline = {
  key: "timeline",
  on: "create",
  fn: [
    ["=$aid", ["when", ["isEmpty"], ["always", "$after.id"], "$after.repost"]],
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
          ["prop", "$doc"],
        ],
        "$after",
      ],
    ],
    [
      "=$rid",
      [
        [
          "ifElse",
          ["propSatisfies", ["isEmpty"], "repost"],
          ["always", ""],
          ["prop", "$doc"],
        ],
        "$after",
      ],
    ],
    [
      "=$followers",
      ["get()", ["follows", ["to", "==", "$after.owner"], ["last", "desc"]]],
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
        ["both", ["pathEq", ["reply_to"], ""], ["always", "$to_not_empty"]],
        "$after",
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
            date: "$after.date",
            broadcast: "$to",
          },
          "timeline",
          "$after.id",
        ],
      ],
      "$after",
    ],
  ],
}

const del_timeline = {
  key: "del_timeline",
  on: "update",
  fn: [
    ["=$is_delete", ["isNil", "$after.date"]],
    ["=$tl", ["get()", ["timeline", "$after.id"]]],
    [
      "when",
      ["both", ["always", "$is_delete"], ["always", "o$tl"]],
      ["toBatch", ["delete", "timeline", "$after.id"]],
      "$after",
    ],
  ],
}

const inc_comments = {
  key: "inc_comments",
  on: "create",
  fn: [
    [
      "when",
      [
        "both",
        ["complement", ["isNil"]],
        ["o", [["complement", ["equals"]], ""], ["var", "after.reply_to"]],
      ],
      [
        "pipe",
        [
          "map",
          [
            [
              "append",
              ["__"],
              ["[]", "update", { comments: { _$: ["inc"] } }, "posts"],
            ],
          ],
        ],
        ["let", "batch"],
      ],
      "$after.parents",
    ],
  ],
}

const last = {
  key: "last",
  on: "create",
  fn: [
    [
      "=$aid",
      ["when", ["isEmpty"], ["always", "$after.repost"], "$after.reply_to"],
    ],
    ["if", ["equals", "", "$aid"], ["break"]],
    ["=$post", ["get()", ["posts", "$aid"]]],
    ["=$docid", ["wdb160()", ["$after.owner", "$post.owner"]]],
    ["=$following", ["get()", ["follows", "$docid"]]],
    [
      "if",
      "o$following",
      ["update()", [{ last: { _$: "ts" } }, "follows", "$docid"]],
    ],
  ],
}

const inc_reposts = {
  key: "inc_reposts",
  on: "create",
  fn: [
    [
      "unless",
      ["pathEq", ["repost"], ""],
      [
        "toBatch",
        ["update", { reposts: { _$: ["inc"] } }, "posts", "$after.repost"],
      ],
      "$after",
    ],
    [
      "when",
      [
        "both",
        [["complement", ["pathEq"]], ["repost"], ""],
        [["complement", ["pathSatisfies"]], ["isNil"], ["description"]],
      ],
      [
        "toBatch",
        ["update", { quotes: { _$: ["inc"] } }, "posts", "$after.repost"],
      ],
      "$data",
    ],
  ],
}

const calc_pt = {
  key: "calc_pt",
  on: "create,update",
  fields: ["calc_pt"],
  fn: [
    ["=$week", ["subtract", "$ts", 60 * 60 * 24 * 7]],
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
          ["subtract", "$ts"],
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
              { pt: "new_pt", ptts: { _$: "%ts" } },
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
}

const del_pt = {
  key: "del_pt",
  on: "create,update",
  fields: ["del_pt"],
  fn: [
    ["=$week", ["subtract", "$ts", 60 * 60 * 24 * 7]],
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
              { last_like: { _$: "del" }, pt: 0, ptts: { _$: "del" } },
              "posts",
            ],
          ],
        ],
        "$posts",
      ],
    ],
    ["toBatchAll()", "$toB"],
  ],
}

export default {
  users: [inc_invited],
  follows: [follow, unfollow],
  likes: [inc_likes],
  posts: [timeline, del_timeline, inc_comments, last, inc_reposts],
  crons: [calc_pt, del_pt],
}
