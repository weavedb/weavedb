---
sidebar_position: 3
---
# Query your Database

You can execute any queries in the bottom terminal:

![](https://i.imgur.com/N0K8st0.png)

:::caution
When using the console's terminal, do not insert spaces in objects. Spaces are used to separate arguments so it will be parsed incorrectly, or wrap the object with `'` or `"`.
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

## Set

To write a new document: 

```bash
# set : data_JSON : collection_name : doc_name
set {name:"Bob",age:20} people Bob
```

## Update

To update an existing document:

```bash
# update : data_JSON : collection_name : doc_name
update {age:30} people Bob
```

## Delete

To delete an existing document:

```bash
# delete : collection_name : doc_name
delete people Bob
```

## Upsert

To update an existing document or create a new one if it does not already exist:

```bash
# upsert : data_JSON : collection_name : doc_name
upsert {name:"Bob",age:20} people Bob
```

Let's add some new documents for the following tutorial:

```bash
set {name:"Bob",age:20} people Bob
set {name:"Alice",age:30} people Alice
set {name:"Mike",age:40} people Mike
```

## Get

To get a single doc:

```bash
get people Bob 
```

To get all the docs in a collection:

```bash
get people
```

### Limit

To limit the number of the docs returned:

```bash
get people 2
```

### Where

To get the docs where the age is 20:

```bash
get people ["age","==",20]
```

:::info
You can use [the same operators as Firestore](https://firebase.google.com/docs/firestore/query-data/queries#query_operators), which includes `==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `not-in`, `array-contains`, and `array-contains-any`.
:::

### Sort

To sort by age in descending order:

```bash
get people ["age","desc"]
```

:::info
Single field indexes are automatically generated. But to sort by more than 1 field, multi-field indexes need to be added explicitly. Read onto the following section.
:::

## Add multi-field indexes
To set an index to sort people first by age in descending order, then by name in ascending order:

```bash
addIndex [["age","desc"],["name","asc"]] people
```

Then you can use this query:


```bash
get people ["age","desc"] ["name"] 
```