import { of, fn } from "./monade.js"
import { parseOp, getInfo } from "./dev_common.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import write from "./dev_write.js"

function initDB({
  state: { query },
  msg,
  env: {
    kv,
    info: { id, owner },
  },
}) {
  if (kv.dir("_")) throw Error("already initialized")
  kv.put("_", "_", { ...query[0], index: 0 })
  kv.put("_", "_config", {
    index: 1,
    schema: { type: "object", additionalProperties: false },
    auth: [],
  })
  kv.put("_", "__indexes__", {
    index: 2,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_", "__accounts__", {
    index: 3,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_config", "info", {
    id,
    owner,
    last_dir_id: 3,
  })
  kv.put("_config", "config", { max_doc_id: 168, max_dir_id: 8 })
  return arguments[0]
}

function ast2schema(ast) {
  if (!ast || ast.type !== "create" || ast.keyword !== "table") {
    throw new Error("Invalid CREATE TABLE AST")
  }

  const tableName = ast.table?.[0]?.table || "unknown_table"

  const schema = {
    title: tableName,
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  }

  for (const def of ast.create_definitions) {
    if (def.resource !== "column") continue

    const colName = def.column?.column
    const sqliteType = def.definition?.dataType?.toUpperCase?.() || "TEXT"

    // Map SQLite types to JSON Schema types
    let jsType = "string"
    if (sqliteType.includes("INT")) jsType = "integer"
    else if (["REAL", "FLOAT", "DOUBLE"].some(t => sqliteType.includes(t)))
      jsType = "number"
    else if (sqliteType === "BOOLEAN") jsType = "boolean"
    else if (sqliteType === "BLOB") jsType = "string" // format: binary (optional)

    schema.properties[colName] = { type: jsType }

    const isNotNull = def.nullable?.type === "not null"
    const isPrimaryKey = def.primary_key === "primary key"

    if (isNotNull || isPrimaryKey) {
      if (!schema.required.includes(colName)) {
        schema.required.push(colName)
      }
    }
  }

  return schema
}
function sync({
  state: { ts, nonce, op, query, ast },
  msg,
  env: {
    sql,
    kv,
    info: { id, owner },
  },
}) {
  try {
    if (op === "sql") {
      try {
        if (ast.type === "create" && ast.keyword === "table") {
          let primary = null
          let primary_type = null
          let auto_inc = false
          for (const v of ast.create_definitions) {
            if (v.primary_key === "primary key") {
              primary = v.column.column
              primary_type = v.definition.dataType.toLowerCase()
              auto_inc = v.auto_increment === "autoincrement"
            }
          }
          sql.exec(query[0])
          const table_name = ast.table[0].table
          const schema = ast2schema(ast)
          of({
            state: {
              nonce,
              ts,
              signer: owner,
              id,
              query: [
                "set:dir",
                {
                  primary,
                  primary_type,
                  auto_inc,
                  schema,
                  auth: [["set,add,update,upsert,del", [["allow()"]]]],
                },
                "_",
                table_name,
              ],
            },
            msg: null,
            env: { kv, no_commit: true },
          })
            .map(parseOp)
            .map(getInfo)
            .map(parse)
            .map(auth)
            .map(write)
        } else {
          const table_name = ast.table[0].table
          const rows = sql.prepare(`${query[0]} RETURNING *`).all()
          const { primary, primary_type } = kv.dir(table_name)
          const toKey = id => {
            return id.toString ? id.toString() : id
          }
          for (const v of rows) {
            const _query =
              ast.type === "delete"
                ? ["del", table_name, toKey(v[primary])]
                : ["set", v, table_name, toKey(v[primary])]
            of({
              state: {
                nonce,
                ts,
                signer: owner,
                id,
                query: _query,
              },
              msg: null,
              env: { kv, no_commit: true },
            })
              .map(parseOp)
              .map(getInfo)
              .map(parse)
              .map(auth)
              .map(write)
          }
        }
      } catch (e) {
        console.log(e, query[0])
      }
    }
  } catch (e) {
    console.log(e)
  }
  return arguments[0]
}

const writer = {
  init: fn().map(initDB),
  sql: fn().map(sync),
}

function write_sql({ state, msg, env: { no_commit, kv } }) {
  if (writer[state.opcode]) of(arguments[0]).chain(writer[state.opcode])
  if (no_commit !== true) kv.commit(msg)
  return arguments[0]
}

export default write_sql
