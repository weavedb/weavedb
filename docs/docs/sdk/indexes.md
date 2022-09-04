---
sidebar_position: 6
---
# Indexes

Single field indexes are automatically generated, but multi field compound indexes need to be added by the DB admin before collections can be accessed with complex queries.

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

