/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from "react"
import { ChangeEvent, forwardRef } from "react"

function EquationEditor({ equation, setEquation, inline }, forwardedRef) {
  const onChange = event => {
    setEquation(event.target.value)
  }
  return inline && forwardedRef instanceof HTMLInputElement ? (
    <span className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">$</span>
      <input
        className="EquationEditor_inlineEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef}
      />
      <span className="EquationEditor_dollarSign">$</span>
    </span>
  ) : (
    <div className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">{"$$\n"}</span>
      <textarea
        className="EquationEditor_blockEditor"
        value={equation}
        onChange={onChange}
        ref={forwardedRef}
      />
      <span className="EquationEditor_dollarSign">{"\n$$"}</span>
    </div>
  )
}

export default forwardRef(EquationEditor)
