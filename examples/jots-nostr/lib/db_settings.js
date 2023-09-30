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
    posts: [
      [
        "add:status",
        [
          [
            "mod()",
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
          ["allow()"],
        ],
      ],
      [
        "add:article",
        [
          ["=$is_job", ["equals", "article", "$request.auth.jobID"]],
          [
            "mod()",
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
          ["mod()", { date: db.del() }],
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
            "mod()",
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
          ["allow()"],
        ],
      ],
      [
        "add:quote",
        [
          ["fields()", ["*repost", "*description", "cover"]],
          ["=$post", ["get()", ["posts", "$new.repost"]]],
          ["denyifany()", ["x$post", "x$post.date"]],
          [
            "mod()",
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
          ["allow()"],
        ],
      ],
      [
        "add:reply",
        [
          ["fields()", ["*reply_to", "*description", "cover"]],
          ["=$post", ["get()", ["posts", "$new.reply_to"]]],
          ["denyifany()", ["x$post", "x$post.date"]],
          [
            "mod()",
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
          ["allow()"],
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
            "mod()",
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
            "mod()",
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
          ["=$isOwner", ["includes", "$signer", "$contract.owners"]],
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
          ["mod()", { from: "$from_id", to: "$to_id", date: "$ts" }],
          ["allowifany()", ["!$isOwner"]],
          ["allow()"],
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
          ["mod()", { aid: "$aid", user: "$user", date: "$ts" }],
          ["allow()"],
        ],
      ],
    ],
  },
  schemas: {
    posts: {
      type: "object",
      required: ["owner", "id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        owner: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        date: { type: "number", multipleOf: 1 },
        updated: { type: "number", multipleOf: 1 },
        description: { type: "string" },
        title: { type: "string", minLength: 1 },
        type: { type: "string" },
        reply_to: { type: "string" },
        repost: { type: "string" },
        reply: { type: "boolean" },
        quote: { type: "boolean" },
        parents: {
          type: "array",
          items: { type: "string", pattern: "^[0-9a-zA-Z]{64,64}$" },
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
      required: ["address"],
      properties: {
        address: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        invited_by: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        name: { type: "string", minLength: 1 },
        handle: { type: "string" },
        image: { type: "string" },
        cover: { type: "string" },
        description: { type: "string" },
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
        aid: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        braodcast: {
          type: "array",
          items: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        },
      },
    },
    follows: {
      type: "object",
      required: ["date", "from", "to"],
      properties: {
        date: { type: "number", multipleOf: 1 },
        from: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        to: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        last: { type: "number", multipleOf: 1 },
      },
    },
    likes: {
      type: "object",
      required: ["date", "user", "aid"],
      properties: {
        date: { type: "number", multipleOf: 1 },
        user: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        aid: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
      },
    },
  },
  indexes: {
    nostr_events: [
      [["id"], ["created_at", "desc"]],
      [["kind"], ["created_at", "desc"]],
      [["pubkey"], ["created_at", "desc"]],
      [["pubkey"], ["kind"], ["created_at", "desc"]],
      [["kind"], ["pubkey"], ["created_at", "desc"]],
    ],
    posts: [
      [["quote"], ["owner"], ["repost"]],
      [["repost"], ["quote"], ["date", "desc"]],
      [["repost"], ["quote"], ["date", "desc"]],
      [["owner"], ["type"], ["date", "desc"]],
      [["owner"], ["reply_to"], ["date", "desc"]],
      [["reply_to"], ["date", "desc"]],
      [["reply_to"], ["repost"], ["date", "desc"]],
      [["reply_to"], ["date"]],
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
      [["type"], ["pt", "desc"], ["date", "desc"]],
    ],
    users: [
      [
        ["hashes", "array"],
        ["followers", "desc"],
      ],
    ],
    likes: [
      [["user"], ["aid"]],
      [["aid"], ["date", "desc"]],
      [["user"], ["date", "desc"]],
    ],
    follows: [
      [["from"], ["date", "desc"]],
      [["from"], ["to"]],
      [["to"], ["from"]],
      [["to"], ["date", "desc"]],
      [["to"], ["last", "desc"]],
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
  crons: {
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
  },
  triggers: {
    nostr_events: [
      {
        key: "nostr_events",
        on: "create",
        version: 2,
        func: [
          [
            "if",
            ["equals", 1, "$data.after.kind"],
            [
              "[]",
              ["=$tags", ["defaultTo", [], "$data.after.tags"]],
              [
                "=$mentions",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "p"], 0]],
                    ["map", ["nth", 1]],
                  ],
                  "$tags",
                ],
              ],
              [
                "=$etags",
                [["filter", ["propSatisfies", ["equals", "e"], 0]], "$tags"],
              ],
              [
                "=$quote_tags",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "mention"], 3]],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$repost",
                [
                  "if",
                  ["isEmpty", "$quote_tags"],
                  "",
                  "else",
                  ["head", "$quote_tags"],
                ],
              ],
              ["=$no_quote", ["isEmpty", "$repost"]],
              ["=$quote", "!$no_quote"],
              [
                "set()",
                [
                  {
                    id: "$data.id",
                    owner: "$data.after.pubkey",
                    type: "status",
                    description: "$data.after.content",
                    date: "$data.after.created_at",
                    repost: "$repost",
                    reply_to: "",
                    reply: false,
                    quote: "$quote",
                    parents: [],
                    hashes: [],
                    mentions: "$mentions",
                    likes: 0,
                    reposts: 0,
                    quotes: 0,
                    comments: 0,
                  },
                  "posts",
                  "$data.id",
                ],
              ],
            ],
          ],
          [
            "if",
            ["equals", 0, "$data.after.kind"],
            [
              "[]",
              ["=$profile", ["parse()", "$data.after.content"]],
              ["=$old_profile", ["get()", ["users", "$data.id"]]],
              ["=$new_profile", { address: "$data.after.pubkey" }],
              [
                "if",
                "x$old_profile",
                [
                  "[]",
                  ["=$new_profile.followers", 0],
                  ["=$new_profile.following", 0],
                ],
              ],
              ["if", "o$profile.name", ["=$new_profile.name", "$profile.name"]],
              [
                "=$new_profile.description",
                ["defaultTo", "", "$profile.about"],
              ],
              [
                "if",
                "o$profile.picture",
                ["=$new_profile.image", "$profile.picture"],
              ],
              [
                "if",
                "o$profile.banner",
                ["=$new_profile.cover", "$profile.banner"],
              ],
              ["upsert()", ["$new_profile", "users", "$data.after.pubkey"]],
            ],
          ],
        ],
      },
    ],
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
        on: "update",
        func: [
          [
            "if",
            ["equals", 1, "$data.after.kind"],
            [
              "[]",
              ["=$tags", ["defaultTo", [], "$data.after.tags"]],
              [
                "=$mentions",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "p"], 0]],
                    ["map", ["nth", 1]],
                  ],
                  "$tags",
                ],
              ],
              [
                "=$etags",
                [["filter", ["propSatisfies", ["equals", "e"], 0]], "$tags"],
              ],
              [
                "=$quote_tags",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "mention"], 3]],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$repost",
                [
                  "if",
                  ["isEmpty", "$quote_tags"],
                  "",
                  "else",
                  ["head", "$quote_tags"],
                ],
              ],
              ["=$no_quote", ["isEmpty", "$repost"]],
              ["=$quote", "!$no_quote"],

              [
                "=$reply_tags",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "reply"], 3]],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$reply_to",
                [
                  "if",
                  ["isEmpty", "$reply_tags"],
                  "",
                  "else",
                  ["last", "$reply_tags"],
                ],
              ],
              ["=$no_reply", ["isEmpty", "$reply_to"]],
              ["=$is_mark", "!$no_reply"],
              [
                "if",
                "$no_reply",
                [
                  "[]",
                  [
                    "=$reply_tags",
                    [
                      [
                        "pipe",
                        ["filter", ["propSatisfies", ["equals", "root"], 3]],
                        ["map", ["nth", 1]],
                      ],
                      "$etags",
                    ],
                  ],
                  [
                    "=$reply_to",
                    [
                      "if",
                      ["isEmpty", "$reply_tags"],
                      "",
                      "else",
                      ["last", "$reply_tags"],
                    ],
                  ],
                ],
              ],
              ["=$no_reply", ["isEmpty", "$reply_to"]],
              ["=$is_mark", "!$no_reply"],
              [
                "if",
                "$no_reply",
                [
                  "[]",
                  [
                    "=$reply_tags",
                    [
                      [
                        "pipe",
                        [
                          "filter",
                          [
                            "propSatisfies",
                            ["either", ["equals", ""], ["isNil"]],
                            3,
                          ],
                        ],
                        ["map", ["nth", 1]],
                      ],
                      "$etags",
                    ],
                  ],
                  [
                    "=$reply_to",
                    [
                      "if",
                      ["isEmpty", "$reply_tags"],
                      "",
                      "else",
                      ["last", "$reply_tags"],
                    ],
                  ],
                ],
              ],
              ["=$no_reply", ["isEmpty", "$reply_to"]],
              ["=$reply", "!$no_reply"],
              ["=$parents", []],
              [
                "if",
                "$is_mark",
                [
                  "=$parents",
                  [
                    [
                      "pipe",
                      [
                        "filter",
                        [
                          "propSatisfies",
                          ["includes", ["__"], ["[]", "root", "reply"]],
                          3,
                        ],
                      ],
                      ["map", ["nth", 1]],
                    ],
                    "$etags",
                  ],
                ],
                "elif",
                "$reply",
                [
                  "=$parents",
                  [
                    [
                      "pipe",
                      [
                        "filter",
                        [
                          "propSatisfies",
                          ["either", ["equals", ""], ["isNil"]],
                          3,
                        ],
                      ],
                      ["map", ["nth", 1]],
                    ],
                    "$etags",
                  ],
                ],
              ],
              [
                "set()",
                [
                  {
                    id: "$data.id",
                    owner: "$data.after.pubkey",
                    type: "status",
                    description: "$data.after.content",
                    date: "$data.after.created_at",
                    repost: "$repost",
                    reply_to: "$reply_to",
                    reply: "$reply",
                    quote: "$quote",
                    parents: "$parents",
                    hashes: [],
                    mentions: "$mentions",
                    likes: 0,
                    reposts: 0,
                    quotes: 0,
                    comments: 0,
                  },
                  "posts",
                  "$data.id",
                ],
              ],
            ],
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
  },
}

const notifications = {
  indexes: {
    notifications: [
      [["to"], ["viewed"], ["date", "desc"]],
      [["to"], ["date", "desc"]],
      [["to"], ["viewed"], ["date", "desc"]],
    ],
  },
  triggers: {
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
  },
}

module.exports = { offchain, notifications }
