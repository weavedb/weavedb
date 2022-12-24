---
sidebar_position: 10
---
# Relayers

Relayers can execute queries on behalf of you using your [eip-721 signatures](https://eips.ethereum.org/EIPS/eip-712).

This comes in handy, when making cross-chain state verifications with off-chain oracles.

## Add Relayer Jobs

Before relayers can relay queries, relayer jobs need to be defined in the WeaveDB contract.

```javascript
/*
const schema = {
  type: "object",
  required: ["height"],
  properties: { height: { type: "number" } }
}
*/
await db.addRelayerJob("jobID", { schema, relayers })
```
- `jobID` : an arbitrary string ID for the job.
- `schema` : a json schema for the extra data relayers will add to the query.
- `relayers` : an array of addresses allowed to execute the job. Only Ethereum accounts are capable of signing with eip-712.

## Get Relayer Jobs

```javascript
await db.getRelayerJob("jobID")
```

## Remove Relayer Jobs

```javascript
await db.removeRelayerJob("jobID")
```

## Sign Jobs

Before sending a query to a relayer, you need to sign the query with a jobID.

```javascript
const data = { name: "Bob", age: 20 }
const relay_query = await db.sign("set", data, "ppl", "Bob", { jobID: "jobID" } )
/*
{
  function: "set",
  query: [data, "ppl", "Bob"],
  signature: "xyz...",
  nonce: 1,
  caller: "0xyouraddress...",
  jobID: "jobID"
}
*/
```

Then send it to one of the allowed relayers for the job.

## Relay Jobs

As a relayer, you should know what the relay query is requesting from `jobID`. `extra_data` can be added as the 3rd parameter, which must match the relay job schema defined in the contract.

```javascript
// const extra_data = { height: 180 }
await db.relay("jobID", relay_query, extra_data)
```

## Use Relayer Extra Data

You can access the relayer data via `request.auth` in access control rules. For example, the following rules will set the height field to the data.

```javascript
// request.auth = { signer, relayer, jobID, extra }
const rules = {
  let: {
    "resource.newData.height": { var: "request.auth.extra.height" },
  },
  "allow set": { "==" : [{var: "request.auth.jobID"}, "jobID"] }
}

await db.setRules(rules, "ppl") // only the contract owners can set rules
```

## EVM Oracles

Using the relayer mechanism, you can set up an oracle to get any data from the Ethereum blockchain.

Coming Soon...
