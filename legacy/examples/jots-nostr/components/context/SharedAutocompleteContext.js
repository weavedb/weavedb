/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const Context = createContext([
  _cb => () => {
    return
  },
  _newSuggestion => {
    return
  },
])

export const SharedAutocompleteContext = ({ children }) => {
  const context = useMemo(() => {
    let suggestion = null
    const listeners = new Set()
    return [
      cb => {
        cb(suggestion)
        listeners.add(cb)
        return () => {
          listeners.delete(cb)
        }
      },
      newSuggestion => {
        suggestion = newSuggestion
        for (const listener of listeners) {
          listener(newSuggestion)
        }
      },
    ]
  }, [])
  return <Context.Provider value={context}>{children}</Context.Provider>
}

export const useSharedAutocompleteContext = () => {
  const [subscribe, publish] = useContext(Context)
  const [suggestion, setSuggestion] = useState(null)
  useEffect(() => {
    return subscribe(newSuggestion => {
      setSuggestion(newSuggestion)
    })
  }, [subscribe])
  return [suggestion, publish]
}
