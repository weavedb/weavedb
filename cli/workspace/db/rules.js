export default {
  notes: [
    [
      "add:note",
      [
        ["fields()", ["*content"]],
        ["mod()", { id: "$doc", actor: "$signer", published: "$ts", likes: 0 }],
        ["allow()"],
      ],
    ],
  ],
  likes: [
    [
      "add:like",
      [
        ["fields()", ["*object"]],
        ["mod()", { actor: "$signer", published: "$ts" }],
        [
          "=$likes",
          [
            "get()",
            [
              "likes",
              ["actor", "==", "$signer"],
              ["object", "==", "$req.object"],
            ],
          ],
        ],
        ["=$ok", ["o", ["equals", 0], ["length"], "$likes"]],
        ["denyifany()", ["!$ok"]],
        ["allow()"],
      ],
    ],
  ],
}
