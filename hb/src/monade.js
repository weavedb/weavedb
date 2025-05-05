const addMethods = (fns, m) => {
  for (const k in fns) {
    for (const k2 in fns[k]) {
      const fn =
        k === "map"
          ? m.map
          : k === "to"
            ? m.to
            : k === "chain"
              ? m.chain
              : m.tap
      m[k2] = (...args) => fn(fns[k][k2](...args))
    }
  }
  return m
}

const of = (ctx, fns = {}) => {
  const map = fn => of(fn(ctx), fns)
  const tap = fn => (fn(ctx), of(ctx, fns))
  const chain = fn => {
    const res = fn(ctx)
    if (!res || res.__monad__ !== true) {
      throw new Error("chain: fn must return monad")
    }
    return res
  }
  const to = fn => fn(ctx)
  const val = () => ctx

  return addMethods(fns, { map, tap, chain, val, __monad__: true, to })
}

const pof = (ctx, fns) => {
  const run = Promise.resolve(ctx, fns)
  const map = fn =>
    pof(
      run.then(async v => await fn(v)),
      fns,
    )
  const tap = fn =>
    pof(
      run.then(async v => {
        await fn(v)
        return v
      }),
      fns,
    )
  const chain = fn =>
    pof(
      run.then(async x => {
        const res = await fn(x)
        if (!res || res.__monad__ !== true)
          throw new Error("chain: fn must return monad")
        return res.run
      }),
      fns,
    )
  const to = fn =>
    run.then(async x => {
      const res = await fn(x)
      return res.run ?? res
    })
  const val = () => run
  return addMethods(fns, { run, map, tap, chain, val, __monad__: true, to })
}

export { pof, of }
