const db = {
  inc: n => {
    return { __op: "inc", n }
  },
  ts: () => {
    return { __op: "ts" }
  },
}

const offchain = {
  schemas: {
    posts: {
      type: "object",
      required: ["owner", "id"],
      properties: {
        id: { type: "string" },
        owner: { type: "string" },
        date: { type: "number" },
        description: { type: "string" },
        title: { type: "string" },
        type: { type: "string" },
        repost: { type: "string" },
        reply_to: { type: "string" },
        reply: { type: "boolean" },
        quote: { type: "boolean" },
        parents: { type: "array", items: { type: "string" } },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        pt: { type: "number" },
        ptts: { type: "number" },
        last_like: { type: "number" },
        likes: { type: "number" },
        reposts: { type: "number" },
        quotes: { type: "number" },
        comments: { type: "number" },
      },
    },
    users: {
      type: "object",
      required: ["address", "invited_by"],
      properties: {
        address: { type: "string" },
        invited_by: { type: "string" },
        name: { type: "string" },
        image: { type: "string" },
        cover: { type: "string" },
        description: { type: "string" },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        followers: { type: "number" },
        following: { type: "number" },
        invites: { type: "number" },
      },
    },
    timeline: {
      type: "object",
      required: ["rid", "aid", "date", "broadcast"],
      properties: {
        date: { type: "number" },
        rid: { type: "string" },
        aid: { type: "string" },
        braodcast: { type: "array", items: { type: "string" } },
      },
    },
    follows: {
      type: "object",
      required: ["date", "from", "to"],
      properties: {
        date: { type: "number" },
        from: { type: "string" },
        to: { type: "string" },
        last: { type: "number" },
      },
    },
    likes: {
      type: "object",
      required: ["date", "user", "aid"],
      properties: {
        date: { type: "number" },
        user: { type: "string" },
        aid: { type: "string" },
      },
    },
  },
  indexes: {
    posts: [
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
        ["date", "asc"],
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
        key: "timeline",
        on: "create",
        func: [
          ["let", "batches", []],
          [
            "let",
            "aid",
            [
              "when",
              ["isEmpty"],
              ["always", { var: "data.after.id" }],
              { var: "data.after.repost" },
            ],
          ],
          [
            "let",
            "receive_id",
            [
              [
                "ifElse",
                [
                  "either",
                  ["propSatisfies", ["isNil"], "description"],
                  ["propSatisfies", ["isNil"], "repost"],
                ],
                ["always", { var: "aid" }],
                ["prop", "id"],
              ],
              { var: "data.after" },
            ],
          ],
          [
            "let",
            "rid",
            [
              [
                "ifElse",
                ["propSatisfies", ["isEmpty"], "repost"],
                ["always", ""],
                ["prop", "id"],
              ],
              { var: "data.after" },
            ],
          ],
          [
            "get",
            "followers",
            [
              "follows",
              ["to", "==", { var: "data.after.owner" }],
              ["last", "desc"],
            ],
          ],
          [
            "get",
            "received",
            ["timeline", ["aid", "==", { var: "receive_id" }]],
          ],
          [
            "let",
            "receivers",
            [
              ["compose", ["flatten"], ["pluck", "broadcast"]],
              { var: "received" },
            ],
          ],
          ["let", "new_receivers", ["pluck", "from", { var: "followers" }]],
          [
            "let",
            "to",
            ["difference", { var: "new_receivers" }, { var: "receivers" }],
          ],
          [
            "do",
            [
              "when",
              [
                "both",
                ["pathEq", ["after", "reply_to"], ""],
                [
                  "compose",
                  ["complement", ["isEmpty"]],
                  ["always", { var: "to" }],
                ],
              ],
              [
                "pipe",
                ["var", "batches"],
                [
                  "append",
                  [
                    "[]",
                    "set",
                    {
                      rid: { var: "rid" },
                      aid: { var: "aid" },
                      date: { var: "data.after.date" },
                      broadcast: { var: "to" },
                    },
                    "timeline",
                    { var: "data.after.id" },
                  ],
                ],
                ["let", "batches"],
              ],
              { var: "data" },
            ],
          ],
          ["batch", { var: "batches" }],
        ],
      },
      {
        key: "last",
        on: "create",
        func: [
          [
            "let",
            "aid",
            [
              "when",
              ["isEmpty"],
              ["always", { var: "data.after.repost" }],
              { var: "data.after.reply_to" },
            ],
          ],
          ["if", ["equals", "", { var: "aid" }], ["break"]],
          ["get", "post", ["posts", { var: "aid" }]],
          [
            "let",
            "docid",
            ["join", ":", [{ var: "data.after.owner" }, { var: "post.owner" }]],
          ],
          ["update", [{ last: db.ts() }, "follows", { var: "docid" }]],
        ],
      },
      {
        key: "inc_reposts",
        on: "create",
        func: [
          ["let", "batches", []],
          [
            "do",
            [
              "unless",
              ["pathEq", ["after", "repost"], ""],
              [
                "pipe",
                ["var", "batches"],
                [
                  "append",
                  [
                    "[]",
                    "update",
                    { reposts: db.inc(1) },
                    "posts",
                    { var: "data.after.repost" },
                  ],
                ],
                ["let", "batches"],
              ],
              { var: "data" },
            ],
          ],
          [
            "do",
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
                "pipe",
                ["var", "batches"],
                [
                  "append",
                  [
                    "[]",
                    "update",
                    { quotes: db.inc(1) },
                    "posts",
                    { var: "data.after.repost" },
                  ],
                ],
                ["let", "batches"],
              ],
              { var: "data" },
            ],
          ],
          ["batch", { var: "batches" }],
        ],
      },
      {
        key: "inc_comments",
        on: "create",
        func: [
          ["let", "batches", []],
          [
            "do",
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
                ["let", "batches"],
              ],
              { var: "data.after.parents" },
            ],
          ],
          ["batch", { var: "batches" }],
        ],
      },
    ],
    follows: [
      {
        key: "follow",
        on: "create",
        func: [
          [
            "update",
            [{ followers: db.inc(1) }, "users", { var: `data.after.to` }],
          ],
          [
            "update",
            [{ following: db.inc(1) }, "users", { var: `data.after.from` }],
          ],
          [
            "let",
            "docid",
            [
              "join",
              ":",
              [{ var: "data.after.from" }, { var: "data.after.to" }],
            ],
          ],
          ["update", [{ last: db.ts() }, "follows", { var: "docid" }]],
        ],
      },
      {
        key: "unfollow",
        on: "delete",
        func: [
          [
            "update",
            [{ followers: db.inc(-1) }, "users", { var: `data.before.to` }],
          ],
          [
            "update",
            [{ following: db.inc(-1) }, "users", { var: `data.before.from` }],
          ],
          [
            "let",
            "docid",
            [
              "join",
              ":",
              [{ var: "data.after.from" }, { var: "data.after.to" }],
            ],
          ],
        ],
      },
    ],
    likes: [
      {
        key: "inc_like",
        on: "create",
        func: [
          ["get", "art", ["posts", { var: "data.after.aid" }]],
          [
            "let",
            "week",
            ["subtract", { var: "block.timestamp" }, 60 * 60 * 24 * 7],
          ],
          [
            "let",
            "new_pt",
            [
              "add",
              1,
              [
                "multiply",
                ["defaultTo", 0, { var: "art.pt" }],
                [
                  "subtract",
                  1,
                  [
                    "divide",
                    [
                      "subtract",
                      { var: "block.timestamp" },
                      ["defaultTo", { var: "week" }, { var: "art.ptts" }],
                    ],
                    { var: "week" },
                  ],
                ],
              ],
            ],
          ],
          [
            "update",
            [
              {
                likes: db.inc(1),
                pt: { var: "new_pt" },
                ptts: db.ts(),
                last_like: db.ts(),
              },
              "posts",
              { var: `data.after.aid` },
            ],
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
          ["let", "batches", []],
          [
            "do",
            [
              "unless",
              ["pathEq", ["after", "to"], { var: "data.after.from" }],
              [
                "pipe",
                ["var", "batches"],
                [
                  "append",
                  [
                    "[]",
                    "upsert",
                    { count: db.inc(1) },
                    "counts",
                    { var: "data.after.to" },
                  ],
                ],
                ["let", "batches"],
              ],
              { var: "data" },
            ],
          ],
          ["batch", { var: "batches" }],
        ],
      },
      {
        key: "dec_count",
        on: "update",
        func: [
          ["let", "batches", []],
          [
            "do",
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
                      { var: "data.after.from" },
                    ],
                    ["pathEq", ["after", "viewed"], true],
                    ["pathEq", ["before", "viewed"], false],
                  ],
                ],
              ],
              [
                "pipe",
                ["var", "batches"],
                [
                  "append",
                  [
                    "[]",
                    "upsert",
                    { count: db.inc(-1) },
                    "counts",
                    { var: "data.after.to" },
                  ],
                ],
                ["let", "batches"],
              ],
              { var: "data" },
            ],
          ],
          ["batch", { var: "batches" }],
        ],
      },
    ],
  },
}

module.exports = { offchain, notifications }
