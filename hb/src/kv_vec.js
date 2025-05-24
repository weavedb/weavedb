import kv from "./kv.js"
import { Utf8 } from "apache-arrow"
import { LanceSchema, getRegistry } from "@lancedb/lancedb/embedding"

const kv_vec = (io, vec, fn) => {
  let tables = {}
  let func = null
  let schema = null
  const sync = async msg => {
    func ??= await getRegistry().get("huggingface")?.create()
    schema ??= LanceSchema({
      text: func.sourceField(new Utf8()),
      vector: func.vectorField(),
    })
    try {
      const [op, ...query] = JSON.parse(msg.headers.query)
      const [dir] = query
      if (op === "createTable") {
        await vec.createTable(...query, { mode: "overwrite", schema })
      } else if (op === "add") {
        const table = tables[dir] ?? (await vec.openTable(dir))
        tables[dir] = table
        await table.add(query[1])
      }
    } catch (e) {
      console.log(e)
    }
  }

  const methods = {
    add: async (dir, data) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      await table.add(data)
    },
    createTable: async (dir, data) =>
      await vec.createTable(dir, data, { mode: "overwrite" }),
    search: async (dir, txt, limit) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      return await table.search(txt).limit(limit).toArray()
    },
    vectorSearch: async (dir, embeddings, limit) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      return await table.vectorSearch(embeddings).limit(limit).toArray()
    },
    query: async (dir, query) => {
      const table = tables[dir] ?? (await vec.openTable(dir))
      tables[dir] = table
      return await table.query().where(query).toArray()
    },
  }
  return kv(io, fn, sync, methods)
}

export default kv_vec
