const { initSetup, send, getArgv } = require("./utils")
const argv = getArgv("wallet_name", "contractTxId")
const { compose, values, mapObjIndexed } = require("ramda")

const setup = async () => {
  const { sdk, wallet, addr } = await initSetup(argv)

  const schemas = {
    bookmarks: {
      type: "object",
      required: ["article_id", "date", "user_address"],
      properties: {
        article_id: {
          type: "string",
        },
        user_address: {
          type: "string",
        },
        date: {
          type: "number",
        },
      },
    },
  }

  const rules = {
    bookmarks: {
      "allow create": {
        and: [
          { "!=": [{ var: "request.auth.signer" }, null] },
          {
            "==": [
              { var: "resource.id" },
              {
                cat: [
                  { var: "resource.newData.article_id" },
                  ":",
                  { var: "resource.newData.user_address" },
                ],
              },
            ],
          },
          {
            "==": [
              { var: "request.auth.signer" },
              { var: "resource.newData.user_address" },
            ],
          },
          {
            "==": [
              { var: "request.block.timestamp" },
              { var: "resource.newData.date" },
            ],
          },
        ],
      },
      "allow delete": {
        "!=": [
          { var: "request.auth.signer" },
          { var: "resource.newData.user_address" },
        ],
      },
    },
    conf: {
      "allow write": {
        in: [{ var: "request.auth.signer" }, [addr, true]],
      },
    },
    mirror: {
      "allow write": {
        in: [{ var: "request.auth.signer" }, [addr, true]],
      },
    },
  }

  await send(sdk, wallet, [
    {
      func: "setSchema",
      query: [schemas.bookmarks, "bookmarks"],
      msg: "bookmarks schema set!",
    },
    ...compose(
      values,
      mapObjIndexed((v, k) => {
        return {
          func: "setRules",
          query: [rules[k], k],
          msg: `${k} rules set!`,
        }
      })
    )(rules),
  ])
  process.exit()
}

setup()
