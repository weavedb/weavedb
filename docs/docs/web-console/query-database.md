---
sidebar_position: 3
---
# Query your Database

To begin interacting with your WeaveDB database, sign in with your owner wallet by following these steps:

1. Click on the `Sign Into DB` button.

![](https://i.imgur.com/UDaASKa.png)

2. Once signed in, you can execute queries in the bottom terminal.

![](https://i.imgur.com/N0K8st0.png)

:::caution
When using the bottom terminal, try not to insert spaces in objects. Spaces are used to separate arguments so it will be parsed incorrectly, or wrap the object with `'` or `"`.
:::

## Get Info

To get general information about your database:

```bash
getInfo
```

## Add

To add a doc to a collection. The doc ID will be auto-generated:

```bash
# add : data_JSON : collection_name
add {name:"Bob",age:20} people
```

To set, update, delete, or upsert a doc, you can use the following commands followed by the new data, the collection name, and the doc name as arguments:

## Set

```bash
# set : data_JSON : collection_name : doc_name
set {name:"Bob",age:20} people Bob
```

## Update

```bash
# update : data_JSON : collection_name : doc_name
update {age:30} people Bob
```
## Delete

```bash
# delete : collection_name : doc_name
delete people Bob
```

## Upsert

```bash
# upsert : data_JSON : collection_name : doc_name
upsert {name:"Bob",age:20} people Bob
```

The defferences between `set`, `upsert`, `update` are:

- `set` will reset the whole doc if the doc already exists.
- `update` will fail if the doc does not exist.
- `upsert` will merge the new data with an existing doc or will add a new doc if it does not already exist.


## Get

Let's add some people for the following tutorial:

```bash
set {name:"Bob",age:20} people Bob
set {name:"Alice",age:30} people Alice
set {name:"Mike",age:40} people Mike
```

To get a single doc:

```bash
get people Bob 
```

To get the docs in a collection:

```bash
get people
```

### Limit

To limit the number of docs returned:

```bash
get people 2
```

### Where

To get docs where the age is 20:

```bash
get people ["age","==",20]
```

:::info
You can use [the same operators as Firestore](https://firebase.google.com/docs/firestore/query-data/queries#query_operators), which includes `==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `not-in`, `array-contains`, and `array-contains-any`.
:::

#### sort

To sort by age in descending order:

```bash
get people ["age","desc"]
```

:::info
Single field indexes are automatically generated. But to sort by more than 1 field, multi-field indexes need to be added explicitly. Read onto the following section.
:::

## Add Multi-Field Indexes
To set an index to sort people first by age in descending order, then by name in ascending order:

```bash
addIndex [["age","desc"],["name","asc"]] people

get people ["age","desc"] ["name"] 
```