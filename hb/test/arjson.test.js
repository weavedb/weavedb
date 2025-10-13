import { before, after, describe, it } from "node:test"
import { json, encode, Encoder } from "arjson"
import { clone } from "ramda"
const infos = [
  {
    dirs: 4,
    i: 5,
    id: "djqotg6wvksycot86tzuobxret2iauofkfc8as8wsf4",
    owner: "I7rrECHrYnAC_BIEbfHqs84UtK2ZJVNJfHaXEezVccQ",
    ts: 1760368605910,
    max_doc_id: 168,
    max_dir_id: 8,
    max_doc_size: 256,
    hashpath:
      "hEW0_C0FHtv7NiDPN9cW7l_chBfz_qBHI4E50ejBSxk/xaJ_YxnoMq3b9OReDmSwZogZcyYNQHaBs-x35CeBd_4",
  },
  {
    dirs: 4,
    i: 8,
    id: "djqotg6wvksycot86tzuobxret2iauofkfc8as8wsf4",
    owner: "I7rrECHrYnAC_BIEbfHqs84UtK2ZJVNJfHaXEezVccQ",
    ts: 1760368621630,
    max_doc_id: 168,
    max_dir_id: 8,
    max_doc_size: 256,
    hashpath:
      "AegBWvcl_10eEfIhjby47jlQ8-0Ia9fJTit6WqLbRys/lZzvDtrv3aP_oT6JRMpa1QXKFXkxIslbVtafOdDOwpg",
  },
  {
    dirs: 4,
    i: 10,
    id: "djqotg6wvksycot86tzuobxret2iauofkfc8as8wsf4",
    owner: "I7rrECHrYnAC_BIEbfHqs84UtK2ZJVNJfHaXEezVccQ",
    ts: 1760368651689,
    max_doc_id: 168,
    max_dir_id: 8,
    max_doc_size: 256,
    hashpath:
      "CS0HBUisYz_W0d05zFoSsh0nZOq4mE_8v4AcVBqt2sw/lvZO-s5kc_HxD1lP5-qdTAT-O_IgqX8hDWpN7mUSapk",
  },
]

const validate = () => {
  let deltas = null
  let kv = null
  let n = 3
  const info = {
    i: -1,
    ts: 0,
    hashpath:
      "Y2GuFXIakguFhJMmhZT1q2Tn5BMGp0HqN2ff1UOEIGs/DNjOYPXmLVpsFTjO4m_OBo2Ydo0I1SP1KiWyz603h4M",
  }
  for (let info of infos) {
    let delta = null
    if (!deltas) {
      let cache = clone(kv)
      if (cache) {
        console.log("recover")
        for (let v of cache) v[1] = Uint8Array.from(v[1])
        deltas = json(cache, undefined, n)
      } else {
        console.log("init")
        deltas = json(null, info, n)
        delta = deltas.deltas()[0]
        kv = deltas.deltas()
      }
    } else {
      console.log("memory cache", info)
      delta = deltas.update(info)
      kv = deltas.deltas()
    }
    console.log(delta)
    console.log("result:", deltas.json())
  }
  return deltas.deltas()
}
describe("ARJSON", () => {
  it("should encode and decode", async () => {
    const deltas = validate()
    let kv = []
    let _arjson = null
    for (let v of deltas) {
      kv.push(v)
      _arjson = json(kv, undefined, 3)
      console.log(_arjson.json())
    }
  })
})
