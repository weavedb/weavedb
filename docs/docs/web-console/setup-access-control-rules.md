---
sidebar_position: 5
---
# Set up Access Control Rules

With decentralized DBs, it's extremely essential to control who can update what, since it's permissionless by default. WeaveDB has a powerful mechanism to precisely set up any advanced logic to your DB instance by combining [JsonLogic](https://jsonlogic.com/) and [FPJSON](https://fpjson.weavedb.dev).

In this tutorial, we will only explore basic `JsonLogic` parts.

You can set up rules to either the entire write operation with `write` or specific operations with`create`, `update` and `delete`.

So `write` = `create` + `update` + `delete`.

Within the rules, you can access [various information](https://docs.weavedb.dev/docs/sdk/rules#preset-variables) about contract, block, transaction, and data to be uploaded.

```javascript
{
  contract: { id, owners },
  request: {
    auth: { signer, relayer, jobID, extra },
    block: { height, timestamp },
    transaction: { id },
    resource: { data },
    id,
    path,
  },
  resource: { data, setter, newData, id, path },
}
```

And with JsonLogic, you can use `var` to access variables, such as `{var: "resource.newData.user"}` to access the `user` field of the newly updated data.

`resource.setter` is the data creator. The following ensures only the original data creators can update their own data:

```javascript
{
  "allow create": true,
  "allow update": {
    "==": [{ var: "request.auth.signer" }, { var: "resource.setter" }]
  }
}
```

To combine multiple operations, chain them with `,` like `allow create,update`.

To add the rules, click `Access Control Rules` in the side menu, select `people` from the Collection list, then click the edit icon in the top right corner of the Rules box.

![](/img/quick-start-1.png)

 You can copy & paste the rules object above to the popped-up textarea and hit `Add`.
 
![](/img/quick-start-2.png)

Now if you try to update an existing data with another wallet, the transaction will fail.

:::info
With [FPJSON](https://fpjson.weavedb.dev/), you can do powerful things such as mutating the updated data and adding extra fields.
:::