---
sidebar_position: 7
---
# Indexes

Single-field indexes are automatically generated, but multi-field compound indexes need to be added by the DB admin before collections can be accessed with complex queries.

add an index

```javascript
await db.addIndex([ [ "age" ], [ "height", "desc" ] ], "people")
```

get indexes of a collection

```javascript
await db.getIndexes("people")
```

remove an index

```javascript
await db.removeIndex([ [ "age" ], [ "height", "desc" ] ], "people")
```

## \__id__

`__id__` is reserved to auto-index doc ids. `__id__` field will not be indexed, and `__id__` cannot be used in multi-field indexes.

You can, however, use `__id__` to get a collection in descending order sorted by doc id.

```js
await db.get("people", ["__id__", "desc"], 5)
```
