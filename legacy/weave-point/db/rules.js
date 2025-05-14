module.exports = {
  points: [
    [
      "set:issue",
      [
        ["fields", ["symbol", "name"]],
        ["mod()", { symbol: "$id", owner: "$signer", totalSupply: 0 }],
        ["allow()"],
      ],
    ],
  ],
  events: [
    [
      "add:mint",
      [
        ["mod()", { signer: "$signer", from: "0x", op: "mint", date: "$ms" }],
        ["allow()"],
      ],
    ],
    [
      "add:transfer",
      [
        [
          "mod()",
          { signer: "$signer", from: "$signer", op: "transfer", date: "$ms" },
        ],
        ["allow()"],
      ],
    ],
  ],
}
