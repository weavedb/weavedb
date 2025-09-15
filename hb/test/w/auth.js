const set_reg_owner = [
  "set:reg_owner",
  [
    ["fields()", []],
    ["=$user", ["get()", ["users", "$signer23"]]],
    ["=$isOwner", ["includes", "$signer", "$owner"]],
    ["=$is_user_owner", ["equals", "$signer23", "$doc"]],
    [
      "mod()",
      {
        address_full: "$signer",
        address: "$signer23",
        followers: 0,
        following: 0,
        invited_by: "$signer23",
      },
    ],
    ["allowifall()", ["$isOwner", "x$user", "$is_user_owner"]],
  ],
]

const update_give_invites = [
  "update:give_invites",
  [
    ["fields()", ["*invites"]],
    ["=$isOwner", ["equals", "$signer", "$owner"]],
    ["=$invited_user", ["get()", ["users", "$doc"]]],
    ["allowifall()", ["$isOwner", "o$invited_user"]],
  ],
]

const set_invite_user = [
  "set:invite_user",
  [
    ["fields()", ["*address_full"]],
    ["=$user", ["get()", ["users", "$signer23"]]],
    ["denyifany()", ["x$user"]],
    ["=$w23", ["wdb23()", "$after.address_full"]],
    ["=$isIDAddress", ["equals", "$doc", "$w23"]],
    ["=$invited", ["defaultTo", 0, "$user.invited"]],
    ["=$invites", ["defaultTo", 0, "$user.invites"]],
    ["=$have_invites", ["gt", "$invites", "$invited"]],
    ["=$invited_user", ["get()", ["users", "$doc"]]],
    [
      "mod()",
      {
        address: "$w23",
        followers: 0,
        following: 0,
        invited_by: "$signer23",
      },
    ],
    ["allowifall()", ["x$invited_user", "$have_invites", "$isIDAddress"]],
  ],
]

const update_profile_fields = [
  "fields()",
  ["name", "description", "handle", "hashes", "mentions", "image", "cover"],
]

const handle_already_set = [
  ["=$keys", ["keys", "$req"]],
  ["=$setHandle", ["includes", "handle", "$keys"]],
  ["denyifall()", ["$setHandle", "o$before.handle"]],
]

const handle_available = [
  [
    "=$huser",
    [
      "if",
      "$setHandle",
      ["get()", ["users", ["handle", "==", "$after.handle"]]],
    ],
  ],
  [
    "=$available",
    ["if", "$setHandle", ["o", ["equals", 0], ["length"], "$huser"]],
  ],
  ["=$handleOK", ["or", "!$setHandle", "$available"]],
]

const is_user_signer = ["=$is_user_signer", ["equals", "$signer23", "$doc"]]

const update_profile = [
  "update:profile",
  [
    update_profile_fields,
    ...handle_already_set,
    ...handle_available,
    is_user_signer,
    ["allowifall()", ["$is_user_signer", "$handleOK"]],
  ],
]

const set_follow = [
  "set:follow",
  [
    ["fields()", ["from", "to"]],
    ["=$follow", ["get()", ["follows", "$doc"]]],
    ["=$hash", ["wdb160()", ["$req.from", "$req.to"]]],
    ["=$from", ["get()", ["users", "$req.from"]]],
    ["=$to", ["get()", ["users", "$req.to"]]],
    ["denyifany()", ["x$from", "x$to", "o$follow"]],
    ["mod()", { date: "$ts", hash: "$hash", doc: "$doc" }],
    ["=$is_hash_id", ["equals", "$hash", "$doc"]],
    ["=$is_from_signer", ["equals", "$req.from", "$signer23"]],
    ["allowifall()", ["$is_from_signer", "$is_hash_id"]],
  ],
]
const del_unfollow = [
  "del:unfollow",
  [
    ["fields()", []],
    ["=$follow", ["get()", ["follows", "$doc"]]],
    ["=$hash", ["wdb160()", ["$before.from", "$before.to"]]],
    ["=$is_hash_id", ["equals", "$hash", "$doc"]],
    ["=$is_from_signer", ["equals", "$before.from", "$signer23"]],
    ["=$from", ["get()", ["users", "$before.from"]]],
    ["=$to", ["get()", ["users", "$before.to"]]],
    ["allow()"],
    ["denyifany()", ["x$from", "x$to", "x$follow"]],
    ["allowifall()", ["$is_from_signer", "$is_hash_id"]],
  ],
]
const add_status = [
  "add:status", // todo:need to check user existence?
  [
    ["fields()", ["*description", "mentions", "hashes", "cover"]],
    [
      "mod()",
      {
        id: "$doc",
        owner: "$signer23",
        likes: 0,
        reposts: 0,
        quotes: 0,
        comments: 0,
        reposts: 0,
        date: "$ts",
        reply: false,
        quote: false,
        reply_to: "",
        repost: "",
        type: "status",
        parents: [],
      },
    ],
    ["allow()"],
  ],
]

const set_like = [
  "set:like",
  [
    ["fields()", ["aid", "user"]],
    ["=$hash", ["wdb160()", ["$req.aid", "$req.user"]]],
    ["=$is_hash_id", ["equals", "$hash", "$doc"]],
    ["=$like", ["get()", ["likes", "$doc"]]],
    ["=$isOwner", ["equals", "$signer23", "$req.user"]],
    ["denyifany()", ["o$like", "!$isOwner", "!$is_hash_id"]],
    ["mod()", { date: "$ts" }],
    ["allow()"],
  ],
]

const add_article = [
  "add:article",
  [
    [
      "mod()",
      {
        id: "$doc",
        owner: "$signer23",
        likes: 0,
        reposts: 0,
        quotes: 0,
        reposts: 0,
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
    ["allow()"],
  ],
]

const update_edit = [
  "update:edit",
  [
    ["fields()", ["title", "description", "cover", "body"]],
    ["=$post", ["get()", ["posts", "$doc"]]],
    ["=$is_article", ["equals", "article", "$before.type"]],
    ["denyifany()", ["x$post", "x$post.date"]],
    ["=$isOwner", ["equals", "$signer23", "$before.owner"]],
    ["allowifall()", ["$isOwner", "$is_article"]],
  ],
]

const del_post = [
  "update:del_post",
  [
    ["fields()", []],
    ["=$isOwner", ["equals", "$signer23", "$before.owner"]],
    ["=$post", ["get()", ["posts", "$doc"]]],
    ["mod()", { date: { _$: "del" } }],
    ["allowifall()", ["o$post", "o$post.date"]],
  ],
]

const add_repost = [
  "add:repost",
  [
    ["fields()", ["*repost"]],
    ["=$post", ["get()", ["posts", "$after.repost"]]],
    ["denyifany()", ["x$post", "x$post.date"]],
    [
      "=$repost",
      [
        "get()",
        [
          "posts",
          ["quote", "==", false],
          ["owner", "==", "$signer23"],
          ["repost", "==", "$after.repost"],
        ],
      ],
    ],
    ["=$no_repost", ["o", ["equals", 0], ["length"], "$repost"]],
    ["denyifany()", ["!$no_repost"]],
    [
      "mod()",
      {
        id: "$doc",
        owner: "$signer23",
        likes: 0,
        reposts: 0,
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
]

const add_quote = [
  "add:quote",
  [
    ["fields()", ["*repost", "*description", "cover", "hashes", "mentions"]],
    ["=$post", ["get()", ["posts", "$after.repost"]]],
    ["denyifany()", ["x$post", "x$post.date"]],
    [
      "mod()",
      {
        id: "$doc",
        owner: "$signer23",
        likes: 0,
        reposrts: 0,
        quotes: 0,
        comments: 0,
        reposts: 0,
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
]

const add_reply = [
  "add:reply",
  [
    ["fields()", ["*reply_to", "*description", "cover", "hashes", "mentions"]],
    ["=$post", ["get()", ["posts", "$after.reply_to"]]],
    ["denyifany()", ["x$post", "x$post.date"]],
    [
      "mod()",
      {
        id: "$doc",
        owner: "$signer23",
        likes: 0,
        reposrts: 0,
        quotes: 0,
        comments: 0,
        reposts: 0,
        date: "$ts",
        reply: true,
        quote: false,
        repost: "",
        type: "status",
        parents: ["append", "$after.reply_to", "$post.parents"],
      },
    ],
    ["allow()"],
  ],
]

const upsert_cron = [
  "upsert:cron",
  [
    ["fields()", ["calc_pt", "del_pt"]],
    ["=$isOwner", ["includes", "$signer", "$owner"]],
    ["allowifall()", ["$isOwner"]],
  ],
]

export default {
  users: [set_reg_owner, update_give_invites, set_invite_user, update_profile],
  follows: [set_follow, del_unfollow],
  posts: [
    add_status,
    add_article,
    update_edit,
    del_post,
    add_repost,
    add_quote,
    add_reply,
  ],
  likes: [set_like],
  timeline: [],
  crons: [upsert_cron],
}
