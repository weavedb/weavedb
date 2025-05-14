const db = require("../scripts/lib/ops")

module.exports = {
  posts: [
    ["delete", [["allow()"]]],
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
            reposts: 0,
            date: "$ms",
            reply: false,
            quote: false,
            reply_to: "",
            repost: "",
            type: "status",
            parents: [],
          },
        ],
        ["fields()", ["*description", "mentions", "hashes", "cover"]],
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
            reposts: 0,
            comments: 0,
            date: "$ms",
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
            date: "$ms",
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
        [
          "fields()",
          ["*repost", "*description", "cover", "hashes", "mentions"],
        ],
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
            reposts: 0,
            date: "$ms",
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
        [
          "fields()",
          ["*reply_to", "*description", "cover", "hashes", "mentions"],
        ],
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
            reposts: 0,
            date: "$ms",
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
        ["=$keys", ["keys", "$request.resource.data"]],
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
        ["mod()", { from: "$from_id", to: "$to_id", date: "$ms" }],
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
        ["mod()", { aid: "$aid", user: "$user", date: "$ms" }],
        ["allow()"],
      ],
    ],
  ],
}
