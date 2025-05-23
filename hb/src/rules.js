const dirs_set = [
  "set:dir",
  [
    ["=$isOwner", ["equals", "$signer", "$owner"]],
    ["=$dir", ["get()", ["_config", "info"]]],
    ["=$dirid", ["inc", "$dir.last_dir_id"]],
    ["mod()", { index: "$dirid" }],
    ["update()", [{ last_dir_id: "$dirid" }, "_config", "info"]],
    ["allowif()", "$isOwner"],
  ],
]
export { dirs_set }
