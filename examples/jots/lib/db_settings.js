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
    posts: {
      let: {
        keys: ["keys", { var: "request.resource.data" }],
      },
      "let create": {
        "resource.newData.id": { var: "request.id" },
        "resource.newData.owner": { var: "request.auth.signer" },
        "resource.newData.likes": 0,
        "resource.newData.reposts": 0,
        "resource.newData.quotes": 0,
        "resource.newData.comments": 0,
        "resource.newData.date": [
          "multiply",
          1000,
          { var: "request.block.timestamp" },
        ],
        "request.method": [
          "ifelse",
          ["equals", "article", { var: "resource.newData.type" }],
          "_article",
          "_status",
        ],
      },
      "let _article": {
        isTitle: [["complement", ["isNil"]], { var: "resource.newData.title" }],
        "resource.newData.reply": false,
        "resource.newData.quote": false,
        "resource.newData.reply_to": "",
        "resource.newData.repost": "",
        "request.method": [
          "if",
          ["all", ["equals", true], [{ var: "isTitle" }]],
          "article",
        ],
      },
      "let _status": {
        noTitle: ["isNil", { var: "resource.newData.title" }],
        repost: ["defaultTo", "", { var: "resource.newData.repost" }],
        "request.method": [
          "ifelse",
          ["equals", "", { var: "repost" }],
          "_status2",
          "_repost",
        ],
      },

      "let _repost": {
        description: ["defaultTo", "", { var: "resource.newData.description" }],
        post: ["get", ["posts", { var: "resource.newData.repost" }]],
        exPost: [["complement", ["isNil"]], { var: "post" }],
        "resource.newData.reply": false,
        "resource.newData.quote": [
          ["complement", ["equals"]],
          "",
          { var: "description" },
        ],
        "resource.newData.reply_to": "",
        "request.method": [
          "ifelse",
          { var: "resource.newData.quote" },
          "_quote",
          "_repost2",
        ],
      },
      "let _quote": {
        "request.method": [
          "if",
          ["and", { var: "exPost" }, { var: "noTitle" }],
          "quote",
        ],
      },
      "let _repost2": {
        repost: [
          "get",
          [
            "posts",
            ["quote", "==", false],
            ["owner", "==", { var: "request.auth.signer" }],
            ["repost", "==", { var: "resource.newData.repost" }],
          ],
        ],
        noRepost: ["o", ["equals", 0], ["length"], { var: "repost" }],
        "resource.newData.noRepost": { var: "noRepost" },
        "request.method": [
          "if",
          [
            "all",
            ["equals", true],
            [{ var: "exPost" }, { var: "noTitle" }, { var: "noRepost" }],
          ],
          "repost",
        ],
      },
      "let _status2": {
        "resource.newData.repost": "",
        reply_to: ["defaultTo", "", { var: "resource.newData.reply_to" }],
        reply: [["complement", ["equals"]], "", { var: "reply_to" }],
        "request.method": ["ifelse", { var: "reply" }, "_reply", "_status3"],
      },
      "let _status3": {
        "resource.newData.reply": false,
        "resource.newData.quote": false,
        "resource.newData.reply_to": "",
        "request.method": [
          "if",
          ["all", ["equals", true], [{ var: "noTitle" }]],
          "status",
        ],
      },
      "let _reply": {
        post: ["get", ["posts", { var: "resource.newData.reply_to" }]],
        exPost: [["complement", ["isNil"]], { var: "post" }],
        "resource.newData.reply": true,
        "resource.newData.quote": false,
        "request.method": [
          "if",
          ["all", ["equals", true], [{ var: "noTitle" }, { var: "exPost" }]],
          "reply",
        ],
      },
      "let update": {
        isDataOwner: [
          "equals",
          { var: "request.auth.signer" },
          { var: "resource.data.owner" },
        ],
        deletable: [
          [
            "compose",
            ["equals", 0],
            ["length"],
            ["difference", { var: "keys" }],
          ],
          ["date"],
        ],
        exDate: [["complement", ["isNil"]], { var: "resource.data.date" }],
        deleted: ["isNil", { var: "resource.newData.date" }],
        "request.method": [
          "ifelse",
          [
            "all",
            ["equals", true],
            [{ var: "exDate" }, { var: "deleted" }, { var: "deletable" }],
          ],
          "delete_post",
          "_edit",
        ],
      },
      "let _edit": {
        valid: ["not", { var: "deleted" }],
        article: ["equals", "article", { var: "resource.data.type" }],
        editable: [
          [
            "compose",
            ["equals", 0],
            ["length"],
            ["difference", { var: "keys" }],
          ],
          ["title", "body", "cover", "description"],
        ],
        "request.method": [
          "if",
          [
            "all",
            ["equals", true],
            [
              { var: "valid" },
              { var: "article" },
              { var: "editable" },
              { var: "isDataOwner" },
            ],
          ],
          "edit",
        ],
      },
      "allow status,article,repost,quote,reply,edit,delete_post": true,
    },
    users: {
      let: {
        isOwner: [
          "includes",
          { var: "request.auth.signer" },
          { var: "contract.owners" },
        ],
        keys: ["keys", { var: "request.resource.data" }],
      },
      "let create": {
        create_user: ["equals", ["address"], { var: "keys" }],
        "request.method": [
          "ifelse",
          ["and", { var: "create_user" }, { var: "isOwner" }],
          "create_by_owner",
          "_create_by_user",
        ],
      },
      "let _create_by_user": {
        user: ["get", ["users", { var: "request.auth.signer" }]],
        invited: ["defaultTo", 0, { var: "user.invited" }],
        "request.method": [
          "if",
          ["gt", { var: "user.invites" }, { var: "invited" }],
          "invite_by_user",
        ],
      },
      "let create_by_owner,invite_by_user": {
        "resource.newData.invited_by": { var: "request.auth.signer" },
      },
      "let update": {
        update_invites: ["equals", ["invites"], { var: "keys" }],
        "request.method": [
          "ifelse",
          ["and", { var: "update_invites" }, { var: "isOwner" }],
          "update_invite_by_owner",
          "_update_profile",
        ],
      },
      "let _update_profile": {
        isDataOwner: [
          "equals",
          { var: "request.auth.signer" },
          { var: "resource.data.address" },
        ],
        updatable: [
          [
            "compose",
            ["equals", 0],
            ["length"],
            ["difference", { var: "keys" }],
          ],
          ["name", "description", "handle", "hashes", "mentions"],
        ],
        setHandle: ["includes", "handle", { var: "keys" }],
        existHandle: [
          ["complement", ["isNil"]],
          { var: "resource.data.handle" },
        ],
        user: [
          "if",
          { var: "setHandle" },
          ["get", ["users", ["handle", "==", { var: "request.data.handle" }]]],
        ],
        available: [
          "if",
          { var: "setHandle" },
          ["o", ["equals", 0], ["length"], { var: "user" }],
        ],
        noHandle: ["equals", false, { var: "setHandle" }],
        handleOK: ["or", { var: "noHandle" }, { var: "available" }],
        "request.method": [
          "if",
          [
            "all",
            ["equals", true],
            [{ var: "isDataOwner" }, { var: "updatable" }, { var: "handleOK" }],
          ],
          "update_profile",
        ],
      },
      "allow create_by_owner,invite_by_user,update_invite_by_owner,update_profile": true,
    },
    follows: {
      "let create": {
        isDataOwner: [
          "equals",
          { var: "request.auth.signer" },
          { var: "resource.newData.from" },
        ],
        from: [
          "if",
          { var: "isDataOwner" },
          ["get", ["users", { var: "resource.newData.from" }]],
        ],
        to: [
          "if",
          { var: "isDataOwner" },
          ["get", ["users", { var: "resource.newData.to" }]],
        ],
        _id: [
          "join",
          ":",
          [{ var: "resource.newData.from" }, { var: "resource.newData.to" }],
        ],
        okID: ["equals", { var: "request.id" }, { var: "_id" }],
        existFrom: [["complement", ["isNil"]], { var: "from" }],
        existTo: [["complement", ["isNil"]], { var: "to" }],
        "request.method": [
          "if",
          [
            "all",
            ["equals", true],
            [
              { var: "isDataOwner" },
              { var: "existFrom" },
              { var: "existTo" },
              { var: "okID" },
            ],
          ],
          "follow",
        ],
      },
      "let delete": {
        isDataOwner: [
          "equals",
          { var: "request.auth.signer" },
          { var: "resource.data.from" },
        ],
        "request.method": [
          "if",
          ["all", ["equals", true], [{ var: "isDataOwner" }]],
          "unfollow",
        ],
      },
      "allow follow,unfollow": true,
    },
    likes: {
      "let create": {
        "resource.newData.user": { var: "request.auth.signer" },
        "resource.newData.date": [
          "multiply",
          1000,
          { var: "request.block.timestamp" },
        ],
        _id: [
          "join",
          ":",
          [{ var: "resource.newData.aid" }, { var: "request.auth.signer" }],
        ],
        okID: ["equals", { var: "request.id" }, { var: "_id" }],
        post: ["get", ["posts", { var: "resource.newData.aid" }]],
        exPost: [["complement", ["isNil"]], { var: "post" }],
        notDeleted: [
          ["complement", ["isNil"]],
          { var: "resource.newData.date" },
        ],
        "request.method": [
          "if",
          ["all", ["equals", true], [{ var: "notDeleted" }, { var: "okID" }]],
          "like",
        ],
      },
      "allow like": true,
    },
  },
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
        reply_to: { type: "string" },
        repost: { type: "string" },
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
        invited: { type: "number" },
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
    users: [
      {
        key: "inc_invited",
        on: "create",
        func: [
          [
            "update",
            [{ invited: db.inc(1) }, "users", { var: "data.after.invited_by" }],
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
