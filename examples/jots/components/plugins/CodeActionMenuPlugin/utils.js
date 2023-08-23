/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { debounce } from "lodash-es"
import { useMemo, useRef } from "react"

export function useDebounce(fn, ms, maxWait) {
  const funcRef = useRef(null)
  funcRef.current = fn

  return useMemo(
    () =>
      debounce(
        (...args) => {
          if (funcRef.current) {
            funcRef.current(...args)
          }
        },
        ms,
        { maxWait }
      ),
    [ms, maxWait]
  )
}
