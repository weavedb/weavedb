export default {
  posts: [
    [["quote"], ["owner"], ["repost"]],
    [["repost"], ["quote"], ["date", "desc"]],
    [["owner"], ["type"], ["date", "desc"]],
    [["owner"], ["reply_to"], ["date", "desc"]],
    [["reply_to"], ["date", "desc"]],
    [["reply_to"], ["repost"], ["date", "desc"]],
    [["reply_to"], ["date"]],
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
    [["type"], ["pt", "desc"], ["date", "desc"]],
  ],
  users: [
    [
      ["hashes", "array"],
      ["followers", "desc"],
    ],
  ],
  likes: [
    [["user"], ["aid"]],
    [["aid"], ["date", "desc"]],
    [["user"], ["date", "desc"]],
  ],
  follows: [
    [["from"], ["date", "desc"]],
    [["from"], ["to"]],
    [["to"], ["from"]],
    [["to"], ["date", "desc"]],
    [["to"], ["last", "desc"]],
  ],
  timeline: [
    [
      ["broadcast", "array"],
      ["date", "desc"],
    ],
  ],
}
