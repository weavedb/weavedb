const of = (ctx, copy = false, m = null) => {
  m = copy && m ? m : { __monad__: true }
  m.map = fn => of(fn(ctx), true, m)
  m.tap = fn => (fn(ctx), of(ctx, true, m))
  m.chain = fn => {
    if (fn.__ka__)
      throw new Error(
        "Cannot chain arrow directly. Use arrow.fn() to convert to function",
      )
    const res = fn(ctx)
    if (!res?.__monad__) throw new Error("fn must return monad")
    return res
  }
  m.to = fn => fn(ctx)
  m.val = () => ctx
  return m
}

const pof = (ctx, copy = false, m = null) => {
  const run = Promise.resolve(ctx)
  m = copy && m ? m : { __monad__: true }
  m.map = fn =>
    pof(
      run.then(v => fn(v)),
      true,
      m,
    )
  m.tap = fn =>
    pof(
      run.then(v => {
        fn(v)
        return v
      }),
      true,
      m,
    )
  m.chain = fn =>
    pof(
      run.then(async x => {
        if (fn.__ka__)
          throw new Error(
            "Cannot chain arrow directly. Use arrow.fn() to convert to function",
          )
        const res = await fn(x)
        if (!res?.__monad__) throw new Error("fn must return monad")
        return res.val()
      }),
      true,
      m,
    )
  m.to = fn => run.then(v => fn(v))
  m.val = () => run
  return m
}

const _ka = (steps, m) => {
  steps ??= []
  m ??= {}
  m.__ka__ = true
  m.map = fn => _ka([...steps, ctx => fn(ctx)], m)
  m.tap = fn => {
    const f = ctx => {
      fn(ctx)
      return ctx
    }
    return _ka([...steps, f], m)
  }
  m.chain = k => {
    const f = ctx => {
      const res = k(ctx)
      if (!res?.__monad__) throw new Error("fn must return monad")
      return res.val()
    }
    return _ka([...steps, f], m)
  }

  m.k = ctx => {
    for (const v of steps) ctx = v(ctx)
    return of(ctx)
  }
  return m
}

const ka = () => _ka()

const _pka = (steps, m) => {
  steps ??= []
  m ??= {}
  m.__ka__ = true
  m.map = fn => {
    const f = ctx => fn(ctx)
    return _pka([...steps, f], m)
  }
  m.tap = fn => {
    const f = ctx => {
      fn(ctx)
      return ctx
    }
    return _pka([...steps, f], m)
  }
  m.chain = k => {
    const f = ctx => {
      const res = k(ctx)
      if (!res?.__monad__) throw new Error("fn must return monad")
      return res.val()
    }
    return _pka([...steps, f], m)
  }

  m.k = ctx => {
    let mon = pof(ctx)
    for (const f of steps) mon = mon.chain(v => pof(f(v)))
    return mon
  }
  return m
}

const pka = () => _pka()
const dev =
  (maps = {}) =>
  _ka => {
    _ka ??= ka()
    if (!_ka.__ka__) throw new Error("ka must be arrow")
    for (const [name, fn] of Object.entries(maps)) {
      _ka[name] = (...args) =>
        fn.__ka__
          ? _ka.chain(ctx => fn.k(ctx, ...args))
          : _ka.map(ctx => fn(ctx, ...args))
    }
    return _ka
  }

const pdev =
  (maps = {}) =>
  _pka => {
    _pka ??= pka()
    if (!_pka.__ka__) throw new Error("pka must be arrow")
    for (const [name, fn] of Object.entries(maps)) {
      _pka[name] = (...args) =>
        fn.__ka__
          ? _pka.chain(async ctx => await fn.k(ctx, ...args))
          : _pka.map(async ctx => await fn(ctx, ...args))
    }
    return _pka
  }

const opt = monad => {
  try {
    monad.val()
    return monad
  } catch (error) {
    return of(null)
  }
}

const popt = async pmonad => {
  try {
    await pmonad.val()
    return pmonad
  } catch (error) {
    return pof(null)
  }
}

export { of, pof, ka, pka, dev, pdev, opt, popt }
