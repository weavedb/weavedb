import kv from "./kv.js"

const kv_vec = (io, vec, fn) => {
  let tables = {}
  const sync = async msg => {
    try {
      const [op, ...query] = JSON.parse(msg.headers.query)
      const [dir] = query
      if (op === "createTable") {
        await vec.createTable(...query)
      } else if (op === "addData") {
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
