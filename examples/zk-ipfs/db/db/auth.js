export default {
  ipfs: [
    [
      "add:json",
      [
        ["fields()", ["json"]],
        ["=$cid", ["cid()", "$req.json"]],
        ["=$json", ["get()", ["ipfs", ["cid", "==", "$cid"]]]],
        ["=$available", ["isEmpty", "$json"]],
        ["mod()", { cid: "$cid" }],
        ["allowifall()", ["$available"]],
      ],
    ],
  ],
}
