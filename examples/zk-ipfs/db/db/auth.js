export default {
  ipfs: [
    [
      "add:json",
      [
        ["fields()", ["json"]],
        ["=$cid", ["cid()", "$req.json"]],
        ["mod()", { cid: "$cid" }],
        ["allow()"],
      ],
    ],
  ],
}
