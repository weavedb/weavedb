// monade.js - Language-agnostic, type-safe monad implementation

// === Core Monads ===

const of = (ctx, copy = false, m = null) => {
  m = copy && m ? m : { __monad__: true }
  m.map = fn => of(fn(ctx), true, m)
  m.tap = fn => (fn(ctx), of(ctx, true, m))
  m.chain = fn => {
    // Prevent passing arrows directly - must use .fn()
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
        // Prevent passing arrows directly - must use .fn()
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

// === Kleisli Arrows (Builders) ===

const _ka = (m, steps) => {
  m.__ka__ = true
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
      // If fn is a Kleisli arrow, use its function form
      const actualFn = fn.__ka__ ? fn.fn() : fn
      const res = actualFn(ctx)
      if (!res?.__monad__) throw new Error("fn must return monad")
      return res.val()
    }
    steps.push(f)
    return m
  }
  // Add fn() method to convert to function
  m.fn = () => ctx => {
    for (const v of steps) ctx = v(ctx)
    return of(ctx)
  }
}

const ka = () => {
  const steps = []
  const m = ctx => {
    for (const v of steps) ctx = v(ctx)
    return of(ctx)
  }
  _ka(m, steps)
  return m
}

const _pka = (m, steps) => {
  m.__ka__ = true
  m.__async__ = true
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
      // If fn is an async Kleisli arrow, use its function form
      const actualFn = fn.__ka__ && fn.__async__ ? fn.fn() : fn
      const res = actualFn(ctx)
      if (!res?.__monad__) throw new Error("fn must return monad")
      return res.val()
    }
    steps.push(f)
    return m
  }
  // Add fn() method to convert to function
  m.fn = () => ctx => {
    let mon = pof(ctx)
    for (const f of steps) mon = mon.chain(v => of(f(v)))
    return mon
  }
}

const pka = () => {
  const steps = []
  const m = ctx => {
    let mon = pof(ctx)
    for (const f of steps) mon = mon.chain(v => of(f(v)))
    return mon
  }
  _pka(m, steps)
  return m
}

// === Devices (Domain-Specific Wrappers) ===

const dev =
  (maps = {}, tos = {}) =>
  ctx => {
    let d = { __device__: true }
    let current = ctx

    // Core monad operations
    d.map = fn => dev(maps, tos)(fn(current))
    d.tap = fn => (fn(current), dev(maps, tos)(current))
    d.chain = fn => {
      if (fn.__ka__)
        throw new Error(
          "Cannot chain arrow directly. Use arrow.fn() to convert to function",
        )
      const res = fn(current)
      if (!res?.__monad__) throw new Error("fn must return monad")
      return dev(maps, tos)(res.val())
    }
    d.to = fn => fn(current)
    d.val = () => current

    // Convert to monad
    d.mon = () => of(current)

    // Add custom chainable methods (maps)
    for (const [name, fn] of Object.entries(maps)) {
      d[name] = (...args) => dev(maps, tos)(fn(current, ...args))
    }

    // Add custom terminal methods (tos)
    for (const [name, fn] of Object.entries(tos)) {
      d[name] = (...args) => fn(current, ...args)
    }

    return d
  }

const pdev =
  (maps = {}, tos = {}) =>
  ctx => {
    let d = { __device__: true, __async__: true }
    const run = Promise.resolve(ctx)

    // Core async monad operations
    d.map = fn => pdev(maps, tos)(run.then(v => fn(v)))
    d.tap = fn =>
      pdev(
        maps,
        tos,
      )(
        run.then(v => {
          fn(v)
          return v
        }),
      )
    d.chain = fn => {
      if (fn.__ka__)
        throw new Error(
          "Cannot chain arrow directly. Use arrow.fn() to convert to function",
        )
      return pdev(
        maps,
        tos,
      )(
        run.then(async v => {
          const res = await fn(v)
          if (!res?.__monad__) throw new Error("fn must return monad")
          return res.val()
        }),
      )
    }
    d.to = fn => run.then(v => fn(v))
    d.val = () => run

    // Convert to async monad
    d.mon = () => pof(run)

    // Add async custom chainable methods (maps)
    for (const [name, fn] of Object.entries(maps)) {
      d[name] = (...args) =>
        pdev(maps, tos)(run.then(async v => await fn(v, ...args)))
    }

    // Add async custom terminal methods (tos)
    for (const [name, fn] of Object.entries(tos)) {
      d[name] = (...args) => run.then(async v => await fn(v, ...args))
    }

    return d
  }

// === Option handling ===

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

// Export
export { of, pof, ka, pka, dev, pdev, opt, popt }
