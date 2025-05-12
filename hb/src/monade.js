const addMethods = (fns, m) => {
  for (const k in fns) {
    for (const k2 in fns[k]) m[k2] = (...args) => m[k](fns[k][k2](...args))
  }
  return m
}

const _fn = (m, steps) => {
  m.__monad__ = true
  m.map = fn => {
    const f = ctx => fn(ctx)
    steps.push(f)
    return m
  }
  m.tap = fn => {
    const f = ctx => {
      fn(ctx)
      return ctx
    }
    steps.push(f)
    return m
  }
  m.chain = fn => {
    const f = ctx => {
      const res = fn(ctx)
      if (!res?.__monad__) throw new Error("fn must return monad")
      return res.val()
    }
    steps.push(f)
    return m
  }
}
const fn = () => {
  const steps = []
  const m = ctx => {
    for (const v of steps) ctx = v(ctx)
    return of(ctx)
  }
  _fn(m, steps)
  return m
}

const pfn = () => {
  const steps = []
  const m = ctx => {
    let mon = pof(ctx)
    for (const f of steps) mon = mon.chain(v => of(f(v)))
    return mon
  }
  _fn(m, steps)
  return m
}

const of = (ctx, fns = {}, copy = false) => {
  let m = copy ? fns : { __monad__: true }
  m.map = fn => of(fn(ctx), m, true)
  m.tap = fn => (fn(ctx), of(ctx, m, true))
  m.chain = fn => {
    const res = fn(ctx)
    if (!res?.__monad__) throw new Error("fn must return monad")
    return res
  }
  m.to = fn => fn(ctx)
  m.val = () => ctx
  return copy ? m : addMethods(fns, m)
}

const pof = (ctx, fns = {}, copy = false) => {
  let m = copy ? fns : { __monad__: true }
  const run = Promise.resolve(ctx, fns)
  m.map = fn =>
    pof(
      run.then(async v => await fn(v)),
      m,
      true,
    )
  m.tap = fn =>
    pof(
      run.then(async v => {
        await fn(v)
        return v
      }),
      m,
      true,
    )
  m.chain = fn =>
    pof(
      run.then(async x => {
        const res = await fn(x)
        if (!res?.__monad__) throw new Error("fn must return monad")
        const val = res.run
        return typeof val !== "undefined" ? val : res.val()
      }),
      m,
      true,
    )
  m.to = fn =>
    run.then(async x => {
      const res = await fn(x)
      return res.run ?? res
    })
  m.val = () => run
  return copy ? m : addMethods(fns, m)
}

export { pof, of, fn, pfn }
