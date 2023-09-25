const db = {
  inc: n => {
    return { __op: "inc", n }
  },
  ts: () => {
    return { __op: "ts" }
  },
}

const offchain = {
  rules: {
    posts: [
      [
        "add:status",
        [
          [
            "update()",
            {
              id: "$id",
              owner: "$signer",
              likes: 0,
              reposrts: 0,
              quotes: 0,
              comments: 0,
              date: "$ts",
              reply: false,
              quote: false,
              reply_to: "",
              repost: "",
              type: "status",
              parents: [],
            },
          ],
          ["fields()", ["*description", "mentions", "hashes", "image"]],
          ["allow()", true],
        ],
      ],
      [
        "add:article",
        [
          ["=$is_job", ["equals", "article", "$request.auth.jobID"]],
          [
            "update()",
            {
              id: "$id",
              owner: "$signer",
              likes: 0,
              reposrts: 0,
              quotes: 0,
              comments: 0,
              date: "$ts",
              reply: false,
              quote: false,
              reply_to: "",
              repost: "",
              type: "article",
              parents: [],
            },
          ],
          [
            "fields()",
            [
              "*title",
              "*body",
              "cover",
              "*description",
              "mentions",
              "hashes",
              "image",
            ],
          ],
          ["allowifall()", ["$is_job"]],
        ],
      ],
      [
        "update:del_post",
        [
          ["fields()", []],
          ["=$isOwner", ["equals", "$signer", "$old.owner"]],
          ["=$post", ["get()", ["posts", "$id"]]],
          ["update()", { date: { _op: "del" } }],
          ["allowifall()", ["o$post", "o$post.date", "$isOwner"]],
        ],
      ],
      [
        "add:repost",
        [
          ["fields()", ["*repost"]],
          ["=$post", ["get()", ["posts", "$new.repost"]]],
          ["denyifany()", ["x$post", "x$post.date"]],
          [
            "=$repost",
            [
              "get()",
              [
                "posts",
                ["quote", "==", false],
                ["owner", "==", "$signer"],
                ["repost", "==", "$new.repost"],
              ],
            ],
          ],
          ["=$no_repost", ["o", ["equals", 0], ["length"], "$repost"]],
          ["denyifany()", ["!$no_repost"]],
          [
            "update()",
            {
              id: "$id",
              owner: "$signer",
              likes: 0,
              reposrts: 0,
              quotes: 0,
              comments: 0,
              date: "$ts",
              reply: false,
              quote: false,
              reply_to: "",
              type: "status",
              parents: [],
            },
          ],
          ["allow()", true],
        ],
      ],
      [
        "add:quote",
        [
          ["fields()", ["*repost", "*description", "cover"]],
          ["=$post", ["get()", ["posts", "$new.repost"]]],
          ["denyifany()", ["x$post", "x$post.date"]],
          [
            "update()",
            {
              id: "$id",
              owner: "$signer",
              likes: 0,
              reposrts: 0,
              quotes: 0,
              comments: 0,
              date: "$ts",
              reply: false,
              quote: true,
              reply_to: "",
              type: "status",
              parents: [],
            },
          ],
          ["allow()", true],
        ],
      ],
      [
        "add:reply",
        [
          ["fields()", ["*reply_to", "*description", "cover"]],
          ["=$post", ["get()", ["posts", "$new.reply_to"]]],
          ["denyifany()", ["x$post", "x$post.date"]],
          [
            "update()",
            {
              id: "$id",
              owner: "$signer",
              likes: 0,
              reposrts: 0,
              quotes: 0,
              comments: 0,
              date: "$ts",
              reply: true,
              quote: false,
              repost: "",
              type: "status",
              parents: ["append", "$new.reply_to", "$post.parents"],
            },
          ],
          ["allow()", true],
        ],
      ],
      [
        "update:edit",
        [
          ["fields()", ["title", "description", "cover", "body"]],
          ["=$is_job", ["equals", "article", "$request.auth.jobID"]],
          ["=$post", ["get()", ["posts", "$id"]]],
          ["=$is_article", ["equals", "article", "$old.type"]],
          ["denyifany()", ["x$post", "x$post.date"]],
          ["=$isOwner", ["equals", "$signer", "$old.owner"]],
          ["allowifall()", ["$isOwner", "$is_article", "$is_job"]],
        ],
      ],
    ],
    users: [
      [
        "*",
        [
          ["=$user", ["get()", ["users", "$signer"]]],
          ["=$isOwner", ["includes", "$signer", "$contract.owners"]],
          ["=$keys", ["keys", "$old"]],
        ],
      ],
      [
        "set:reg_owner",
        [
          ["=$is_user_owner", ["equals", "$signer", "$id"]],
          ["fields()", []],
          [
            "update()",
            {
              address: "$id",
              followers: 0,
              following: 0,
              invited_by: "$signer",
            },
          ],
          ["allowifall()", ["$isOwner", "x$user", "$is_user_owner"]],
        ],
      ],
      [
        "update:give_invites",
        [
          ["fields()", ["*invites"]],
          ["=$invited_user", ["get()", ["users", "$id"]]],
          ["allowifall()", ["$isOwner", "o$invited_user"]],
        ],
      ],
      [
        "set:invite_user",
        [
          ["fields()", []],
          ["denyifany()", ["x$user"]],
          ["=$invited", ["defaultTo", 0, "$user.invited"]],
          ["=$invites", ["defaultTo", 0, "$user.invites"]],
          ["=$have_invites", ["gt", "$invites", "$invited"]],
          ["=$invited_user", ["get()", ["users", "$id"]]],
          [
            "update()",
            {
              address: "$id",
              followers: 0,
              following: 0,
              invited_by: "$signer",
            },
          ],
          ["allowifall()", ["x$invited_user", "$have_invites"]],
        ],
      ],
      [
        "update:profile",
        [
          [
            "fields()",
            [
              "name",
              "description",
              "handle",
              "hashes",
              "mentions",
              "image",
              "cover",
            ],
          ],
          ["=$setHandle", ["includes", "handle", "$keys"]],
          ["denyifall()", ["$setHandle", "o$old.handle"]],
          [
            "=$huser",
            [
              "if",
              "$setHandle",
              ["get()", ["users", ["handle", "==", "$new.handle"]]],
            ],
          ],
          [
            "=$available",
            ["if", "$setHandle", ["o", ["equals", 0], ["length"], "$huser"]],
          ],
          ["=$handleOK", ["or", "!$setHandle", "$available"]],
          ["=$is_user_signer", ["equals", "$signer", "$id"]],
          ["allowifall()", ["$is_user_signer", "$handleOK"]],
        ],
      ],
    ],
    follows: [
      [
        "*",
        [
          ["split()", [":", "$id", ["=$from_id", "=$to_id"]]],
          ["=$is_from_signer", ["equals", "$from_id", "$signer"]],
          ["=$from", ["get()", ["users", "$from_id"]]],
          ["=$to", ["get()", ["users", "$to_id"]]],
          ["=$follow", ["get()", ["follows", "$id"]]],
        ],
      ],
      [
        "set:follow",
        [
          ["fields()", []],
          ["denyifany()", ["x$from", "x$to", "o$follow"]],
          ["update()", { from: "$from_id", to: "$to_id", date: "$ts" }],
          ["allowifall()", ["$is_from_signer"]],
        ],
      ],
      [
        "delete:unfollow",
        [
          ["fields()", []],
          ["denyifany()", ["x$from", "x$to", "x$follow"]],
          ["allowifall()", ["$is_from_signer"]],
        ],
      ],
    ],
    likes: [
      [
        "set:like",
        [
          ["split()", [":", "$id", ["=$aid", "=$user"]]],
          ["=$like", ["get()", ["likes", "$id"]]],
          ["=$isOwner", ["equals", "$signer", "$user"]],
          ["denyifany()", ["o$like", "!$isOwner"]],
          ["update()", { aid: "$aid", user: "$user", date: "$ts" }],
          ["allow()", true],
        ],
      ],
    ],
  },
  schemas: {
    posts: {
      type: "object",
      required: ["owner", "id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-z]{32,32}$" },
        owner: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        date: { type: "number", multipleOf: 1 },
        updated: { type: "number", multipleOf: 1 },
        description: { type: "string", maxLength: 280 },
        title: { type: "string", minLength: 1, maxLength: 100 },
        type: { type: "string" },
        reply_to: { type: "string" },
        repost: { type: "string" },
        reply: { type: "boolean" },
        quote: { type: "boolean" },
        parents: {
          type: "array",
          items: { type: "string", pattern: "^[0-9a-zA-Z]{32,32}$" },
        },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        pt: { type: "number" },
        ptts: { type: "number", multipleOf: 1 },
        last_like: { type: "number", multipleOf: 1 },
        likes: { type: "number", multipleOf: 1 },
        reposts: { type: "number", multipleOf: 1 },
        quotes: { type: "number", multipleOf: 1 },
        comments: { type: "number", multipleOf: 1 },
      },
    },
    users: {
      type: "object",
      required: ["address", "invited_by"],
      properties: {
        address: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        invited_by: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        name: { type: "string", minLength: 1, maxLength: 50 },
        handle: { type: "string", minLength: 3, maxLength: 15 },
        image: { type: "string" },
        cover: { type: "string" },
        description: { type: "string", maxLength: 280 },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        followers: { type: "number", multipleOf: 1 },
        following: { type: "number", multipleOf: 1 },
        invites: { type: "number", multipleOf: 1 },
        invited: { type: "number", multipleOf: 1 },
      },
    },
    timeline: {
      type: "object",
      required: ["rid", "aid", "date", "broadcast"],
      properties: {
        date: { type: "number", multipleOf: 1 },
        rid: { type: "string" },
        aid: { type: "string", pattern: "^[0-9a-z]{32,32}$" },
        braodcast: {
          type: "array",
          items: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        },
      },
    },
    follows: {
      type: "object",
      required: ["date", "from", "to"],
      properties: {
        date: { type: "number", multipleOf: 1 },
        from: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        to: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        last: { type: "number", multipleOf: 1 },
      },
    },
    likes: {
      type: "object",
      required: ["date", "user", "aid"],
      properties: {
        date: { type: "number", multipleOf: 1 },
        user: { type: "string", pattern: "^[0-9a-zA-Z]{42,42}$" },
        aid: { type: "string", pattern: "^[0-9a-z]{32,32}$" },
      },
    },
  },
  indexes: {
    posts: [
      [["quote"], ["owner"], ["repost"]],
      [
        ["repost", "asc"],
        ["quote", "asc"],
        ["date", "desc"],
      ],
      [
        ["repost", "asc"],
        ["quote", "asc"],
        ["date", "desc"],
      ],
      [["owner"], ["type"], ["date", "desc"]],
      [["owner"], ["reply_to"], ["date", "desc"]],
      [["reply_to"], ["date", "desc"]],
      [["reply_to"], ["repost"], ["date", "desc"]],
      [["reply_to"], ["date", "asc"]],
      [["owner"], ["reply"], ["date", "desc"]],
      [["owner"], ["repost"]],
      [
        ["hashes", "array"],
        ["date", "desc"],
      ],
      [
        ["hashes", "array"],
        ["pt", "desc"],
      ],
      [
        ["type", "asc"],
        ["pt", "desc"],
        ["date", "desc"],
      ],
    ],
    users: [
      [
        ["hashes", "array"],
        ["followers", "desc"],
      ],
    ],
    likes: [
      [["user"], ["aid"]],
      [
        ["aid", "asc"],
        ["date", "desc"],
      ],
      [["user"], ["date", "desc"]],
    ],
    follows: [
      [["from"], ["date", "desc"]],
      [["from"], ["to"]],
      [["to"], ["from"]],
      [["to"], ["date", "desc"]],
      [
        ["to", "asc"],
        ["last", "desc"],
      ],
    ],
    timeline: [
      [
        ["broadcast", "array"],
        ["date", "desc"],
      ],
    ],
  },
  relayerJobs: {
    profile: {
      schema: {
        type: "object",
        required: [],
        properties: {
          image: { type: "string" },
          cover: { type: "string" },
        },
      },
    },
    article: {
      schema: {
        type: "object",
        required: [],
        properties: {
          body: { type: "string" },
          cover: { type: "string" },
        },
      },
    },
  },
  triggers: {
    posts: [
      {
        key: "del_timeline",
        on: "update",
        func: [
          ["=$is_delete", ["isNil", "$data.after.date"]],
          ["=$tl", ["get()", "tl", ["timeline", "$data.after.id"]]],
          ["=$is_timeline", [["complement", ["isNil"]], "$tl"]],
          [
            "when",
            ["both", ["always", "$is_delete"], ["always", "$is_timeline"]],
            ["toBatch()", ["delete", "timeline", "$data.after.id"]],
            "$data",
          ],
        ],
      },
      {
        key: "timeline",
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
              "toBatch()",
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
            [["complement", ["isNil"]], "$following"],
            ["update()", [{ last: db.ts() }, "follows", "$docid"]],
          ],
        ],
      },
      {
        key: "inc_reposts",
        on: "create",
        func: [
          [
            "unless",
            ["pathEq", ["after", "repost"], ""],
            [
              "toBatch()",
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
              "toBatch()",
              ["update", { quotes: db.inc(1) }, "posts", "$data.after.repost"],
            ],
            "$data",
          ],
        ],
      },
      {
        key: "inc_comments",
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
        on: "delete",
        func: [
          ["update()", [{ followers: db.inc(-1) }, "users", "$data.before.to"]],
          [
            "update()",
            [{ following: db.inc(-1) }, "users", "$data.before.from"],
          ],
        ],
      },
    ],
    likes: [
      {
        key: "inc_like",
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
        on: "create",
        func: [
          [
            "update()",
            [{ invited: db.inc(1) }, "users", "$data.after.invited_by"],
          ],
        ],
      },
    ],
  },
}

const notifications = {
  indexes: {
    notifications: [
      [
        ["to", "asc"],
        ["viewed", "asc"],
        ["date", "desc"],
      ],
      [
        ["to", "asc"],
        ["date", "desc"],
      ],
      [
        ["to", "asc"],
        ["viewed", "asc"],
        ["date", "desc"],
      ],
    ],
  },
  triggers: {
    notifications: [
      {
        key: "inc_count",
        on: "create",
        func: [
          [
            "unless",
            ["pathEq", ["after", "to"], "$data.after.from"],
            [
              "toBatch()",
              ["upsert", { count: db.inc(1) }, "counts", "$data.after.to"],
            ],
            "$data",
          ],
        ],
      },
      {
        key: "dec_count",
        on: "update",
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
              "toBatch()",
              ["upsert", { count: db.inc(-1) }, "counts", "$data.after.to"],
            ],
            "$data",
          ],
        ],
      },
    ],
  },
}

module.exports = { offchain, notifications }
