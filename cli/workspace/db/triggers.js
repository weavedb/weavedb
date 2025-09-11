export default {
  likes: [
    {
      key: "inc_likes",
      on: "create",
      fn: [
        ["update()", [{ likes: { _$: ["inc"] } }, "notes", "$after.object"]],
      ],
    },
  ],
}
