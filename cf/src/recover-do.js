// Cold-start recovery. Replays missed messages from HyperBEAM into DO storage.
//
// Mirrors hb/src/recover.js but adapted for the DO:
//   - Uses HBClient (plain fetch) instead of wao
//   - Replays into an already-constructed db (no Core/version handling here;
//     the DO instantiates db via dynamic import in process-do.js)
//   - Returns a height — caller persists it to __meta__/height
//
// Called from process-do.js's ensureDB() inside state.blockConcurrencyWhile,
// so concurrent fetches block until replay completes (matches the DO
// single-threaded actor model).

const PAGE_SIZE = 20

/**
 * @param {object} args
 * @param {object} args.io          DOIo adapter (already hydrated)
 * @param {object} args.hbClient    HBClient
 * @param {string} args.pid
 * @param {object} args.db          The wdb pipeline (db.write available)
 */
export async function recover({ io, hbClient, pid, db }) {
  let i = 0
  let height = io.get("__meta__/height") ?? 0
  let from = 0
  let to = PAGE_SIZE - 1

  let page
  try {
    page = await hbClient.getMsgs({ pid, from, to })
  } catch (e) {
    // No HB / unreachable / 404 for unknown pid → fresh DB, nothing to replay.
    return { height, replayed: 0, error: String(e) }
  }

  while (page?.assignments && Object.keys(page.assignments).length > 0) {
    for (const k in page.assignments) {
      const m = page.assignments[k]
      if (!m.body?.data) continue
      let entries
      try {
        entries = JSON.parse(m.body.data)
      } catch {
        continue
      }
      for (const v of entries) {
        if (i >= height) {
          try {
            await db.write(v)
            height = i
          } catch (e) {
            // Match recover.js's behavior: log and continue. A bad message
            // shouldn't block recovery of subsequent good messages.
            // eslint-disable-next-line no-console
            console.log("recover replay error at slot", i, e)
          }
        }
        i++
      }
    }
    if (i > height) {
      io.put("__meta__/height", i)
    }
    from += PAGE_SIZE
    to += PAGE_SIZE
    try {
      page = await hbClient.getMsgs({ pid, from, to })
    } catch {
      break
    }
  }

  await io.flush()
  return { height, replayed: i }
}
