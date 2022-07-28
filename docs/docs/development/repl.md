---
sidebar_position: 2
---
# REPL

## Run local DB instance and REPL

Run ArLocal and WeaveDB at `http://localhost:1820`.

This will start a REPL in your command line terminal where you can interactively test DB queries.

```bash
yarn repl
```

The REPL starts a new WeaveDB instance, so the first thing you need to do is to set some rules to collections.

```bash
> setRules({"allow write": true}, "collection_name")
```

Then you can start adding docs.

```bash
> add({field1: "val1", field2: "val2"}, "collection_name")
```

If you also start the [web console](/docs/development/web-console), the REPL and the web console will be in sync, so you can manipulate the DB from both sides.
