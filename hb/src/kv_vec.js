import kv from "./kv.js"
import { Utf8 } from "apache-arrow"
import { LanceSchema, getRegistry } from "@lancedb/lancedb/embedding"

const kv_vec = (io, vec, fn) => {
  let tables = {}
  let func = null
  let schema = null
  const sync = async (msg, funcs, state) => {
    func ??= await getRegistry().get("huggingface")?.create()
    schema ??= LanceSchema({
      __id__: new Utf8(),
      text: func.sourceField(new Utf8()),
      vector: func.vectorField(),
    })
    try {
      let isData = false
      let table = null
      if (state.op === "createTable") {
        isData = true
        table = await vec.createTable(...state.query, {
          mode: "overwrite",
          schema,
        })
      } else if (state.op === "add") {
        const dir = state.query[0]
        isData = true
        table = tables[dir] ?? (await vec.openTable(dir))
        tables[dir] = table
        await table.add(state.query[1])
      }
      if (isData) {
        for (const v of state.query[1] ?? []) {
          const data = (
            await table
              .query()
              .where(`__id__ = '${v.__id__}'`)
              .limit(1)
              .toArray()
          )[0]
          if (data) {
            const key = `${state.query[0]}/${data.__id__}`
            let _data = funcs.get(key)
            if (_data) {
              _data.__id__ = data.__id__
              _data.vector = Array.from(data.vector.toArray())
              funcs.put(key, _data)
            }
          }
        }
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
