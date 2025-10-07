const dirs_set = [
  "set:dir",
  [
    ["=$isOwner", ["equals", "$signer", "$owner"]],
    ["=$dir", ["get()", ["_config", "info"]]],
    ["=$dirid", ["inc", "$dir.dirs"]],
    ["mod()", { index: "$dir.dirs" }],
    ["update()", [{ dirs: "$dirid" }, "_config", "info"]],
    ["allowif()", "$isOwner"],
  ],
]
export { dirs_set }
