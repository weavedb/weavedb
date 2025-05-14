/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createEmptyHistoryState } from "@lexical/react/LexicalHistoryPlugin"
import * as React from "react"
import { createContext, ReactNode, useContext, useMemo } from "react"

const Context = createContext({})

export const SharedHistoryContext = ({ children }) => {
  const historyContext = useMemo(
    () => ({ historyState: createEmptyHistoryState() }),
    []
  )
  return <Context.Provider value={historyContext}>{children}</Context.Provider>
}

export const useSharedHistoryContext = () => {
  return useContext(Context)
}
