---
sidebar_position: 8
---
# Crons

With SCP (Storage-based Consensus Paradigm) and its nature of determinictic calculation, defining and executing scheduled tasks can be built-in to smart contracts.

You can use JSON-based functional programming language called [FPJSON](https://fpjson.weavedb.dev) to build complex tasks.

## Add a Cron

```js
const cron = {
  start: 1659505371,
  span: 60 * 60 * 12,
  do: true,
  times: 10,
  jobs: [ [ "upsert", { times: db.inc(1) }, "conf", "count-crons" ] ]
}
await db.addCron(cron, "count-crons")
```
`span` and `jobs` are mandatory fields.

- `start` - timestamp the cron should start at, if ommited, it will be set to `block.timestamp`
- `end` - timestamp the cron should end at, if ommited, it will run indefinitely
- `span` - seconds between each execution, be careful not to set it too short like `1` second outside the test purposes
- `do` - wheather the task should be executed at `start`, it defaults to `false` if omitted, and in that case, the first execution time will be `start + span`
- `times` - how many times the task should be executed, it will run forever if omitted
- `jobs` - array of tasks to be executed

### Jobs

`jobs` field is an array jobs to be executed sequentially.

The first argument of each job is the method. The DB operations `get` `set` `update` `upsert` `add` `delete` `batch` are supported.

Exept for `get` the second argument is the query.

```js
["set", [{name: "Bob", age: 20}, "people", "Bob"]]
```

In case of `get`, the second argument is a global variable to set the return value to, and the third argument is the query.

```js
["get", "Bob", ["people", "Bob"]]
```
Now you can get `Bob` with `{var: "Bob"}` or `["var", "Bob"]`.

`let` will assign the result of the job to a global variable.

```js
["let", "age", ["compose", ["add", 1], ["prop", "age"], {var: "Bob"}]]
```

`do` will simply execute a job without assigning the result to a variable. It's useful when you want to define variables for later use.

```js
["do", ["compose",["map", ["apply", ["let"]], ["toPairs"]], {var: "Bob"}]]
```
For example, the job above will first fetch a global variable `Bob` with `{var: "Bob"}`, `{name: "Bob", age: 21}`.

Then convert it to `[["name", "Bob"], ["age", 21]]` with `toPairs`.

Then `map` the pairs and `apply` each pair to `let`, which results in defining two global variables `name` and `age` with respective values.

## Get Crons

```js
await db.getCrons()
```

## Remove Crons

```js
await db.removeCrons("count-crons")
```

## JSON-based Functional Programming

Since JS functions cannot be stored as SmartWeave states, we have invented a little new programming lanuguage called [FPJSON](https://fpjson.weavedb.dev) to allow writing functional instructions in the JSON format.

You should familiarize yourself with [Ramda](https://ramdajs.com) which enables Haskell-like functional programming with JS. You can use all the powerful ramda functions with [point-free style](https://ramdajs.com) in JSON.

### Simple Examples

Basic

```js
add(1, 2) // ramdajs
["add", 1, 2] // JSON
```

Currying

```js
add(1)(2) // ramdajs
[["add", 1], 2] // JSON
```

Composition

```js
pipe(add(10), subtract(__, 3))(5) // ramdajs
[["pipe", ["add", 10], ["subtract", ["__"], 3]], 5] // JSON
```

Point-free style means you cannot write something like this with the JSON format.

```js
sortBy((v)=> v.age)(people) // ramdajs
```

It's because you cannot write arbitrary JS lines such as `(v)=> v.age`.

Instead, you can do this using another ramda funciton `prop`.

```js
sortBy(prop("age"), people) // ramdajs
["sortBy",["prop", "age"], people] // JSON
```

### Global Variables

Pure functional programming without any side-effects is easy to get extremely complex and entangled even for simple logics.

WeaveDB inserts global variables to each cron scope to ease up the unnecessary complexisities.

Every time a cron executes, the global variables will start with `block` metadata.

```js
{
  block: {
    height: SmartWeave.block.height,
    timestamp: SmartWeave.block.timestamp,
  }
}
```

#### Access Variables

To access a variable, there are two ways.

##### Object with `var` field

```js
{var: "block"} // will return the block object
{var: "block.timestamp"} // will only return the timestamp
```

In action

```js
["add", { var: "block.timestamp" }, 60 * 60] // add 1 hour to the timestamp
```

##### Custom ramda function

```js
["var", "block.height"]
```

The `var` function needs to be invoked with another argument. The second argument can be whatever and ignored.

So for example, within a composition, you can rewrite the ongoing value with a new value with `var` function and keep on.

```js
["pipe", ...[DOING_SOMETHING], ["var", "block.height"], ...[NOW_KEEP_ON_WITH_BLOCK_HEIGHT]]
```

:::info
The difference between `{var: "block"}` and `["var", "block"]` is `{var: "block"}` will be evaluated and replaced before each job starts, whereas `["var", "block"]` will be evaluated dynamically during the job executes.
:::


#### Define Variables

To define new global variables or assign a value to existing variables, use `let` custom ramda function.

```js
["let", "variable_path", "value"]
```

In action

```js
["pipe", ["add", 60 * 60], ["let", "hour_later"], {var: "block.timestamp"}]
```

After this the global variables will be...

```js
{
  block: {
    height: SmartWeave.block.height,
    timestamp: SmartWeave.block.timestamp,
  },
  hour_later: SmartWeave.block.timestamp + 60 * 60
}
```

Note the difference between `var object` and `var function` when accessing the variable.

You can do this,

```js
["pipe", ["add", 60 * 60], ["let", "hour_later"], ["var", "hour_later"], {var: "block.timestamp"}]
```

but you cannot do this since `{var: "hour_later"}` will be evaluated before the job starts.

```js
["pipe", ["add", 60 * 60], ["let", "hour_later"], {var: "hour_later"}, {var: "block.timestamp"}]
```

#### Dynamic Path

When accessing and defining variables, you can use dynamic paths with `$`.

For example, assign a path to a variable.

```js
["let", "dynamic_path", "hour_later"]
```

Then use the variable with `$`, to achieve the same result as the previous examples.

```js
["pipe", ["add", 60 * 60], ["let", "$dynamic_path"], ["var", "$dynamic_path"], {var: "block.timestamp"}]
```

### Complex Examples

The Bookmarking demo demonstrates complex logics of using crons.

[Bookmarking Tutorial](/docs/examples/bookmarks#advanced-calculate-bookmark-counts-with-cron)
