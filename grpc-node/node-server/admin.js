const getSetups = address => {
  const schema = {
    type: "object",
    required: ["address", "allow"],
    properties: {
      address: {
        type: "string",
      },
      allow: {
        type: "boolean",
      },
    },
  }
  const rules = {
    "allow create,update": {
      and: [
        {
          "==": [{ var: "resource.newData.address" }, { var: "request.id" }],
        },
        { "==": [{ var: "request.auth.signer" }, address] },
      ],
    },
    "allow delete": { "==": [{ var: "request.auth.signer" }, address] },
  }
  return { schema, rules }
}

module.exports = { getSetups }
