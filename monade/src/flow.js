import { pof, of, pka, ka, dev, pdev } from "./monade.js"

const exec = (mon, dev, pred) => (dev.__ka__ ? mon.chain(dev.k) : mon.map(dev))

const iterate = (mon, devs, pred) =>
  devs.reduce((m, v) => match(m, v, pred), mon)

const match = (mon, v, pred) =>
  Array.isArray(v)
    ? iterate(mon, v, pred)
    : typeof v === "function"
      ? exec(mon, v, pred)
      : typeof v === "object"
        ? v.__ka__
          ? exec(mon, v, pred)
          : checkout(mon, v, pred)
        : mon

const checkout = (mon, devs, pred) => {
  const _pred = devs.$pred ?? pred
  return match(mon, _pred?.(mon, devs), pred)
}

const piterate = async (mon, devs, pred) => {
  for (const v of devs) mon = await pmatch(mon, v, pred)
  return mon
}

const pmatch = async (mon, v, pred) =>
  Array.isArray(v)
    ? await piterate(mon, v, pred)
    : typeof v === "function"
      ? exec(mon, v, pred)
      : typeof v === "object"
        ? v.__ka__
          ? exec(mon, v, pred)
          : await pcheckout(mon, v, pred)
        : mon

const pcheckout = async (mon, devs, pred) => {
  const _pred = devs.$pred ?? pred
  return await pmatch(mon, await _pred?.(mon, devs), pred)
}
const flow = (mon, devs, pred) => match(mon, devs, pred)
const pflow = (mon, devs, pred) => pmatch(mon, devs, pred)

export { flow, pflow }
