/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  DecoratorNode,
  EditorConfig,
  NodeKey,
  SerializedLexicalNode,
} from "lexical"
import * as React from "react"

import { useSharedAutocompleteContext } from "../context/SharedAutocompleteContext"
import { uuid as UUID } from "../plugins/AutocompletePlugin"

export class AutocompleteNode extends DecoratorNode {
  static clone(node) {
    return new AutocompleteNode(node.__uuid, node.__key)
  }

  static getType() {
    return "autocomplete"
  }

  static importJSON(serializedNode) {
    const node = $createAutocompleteNode(serializedNode.uuid)
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "autocomplete",
      uuid: this.__uuid,
      version: 1,
    }
  }

  constructor(uuid, key) {
    super(key)
    this.__uuid = uuid
  }

  updateDOM(prevNode, dom, config) {
    return false
  }

  createDOM(config) {
    return document.createElement("span")
  }

  decorate() {
    if (this.__uuid !== UUID) {
      return null
    }
    return <AutocompleteComponent />
  }
}

export function $createAutocompleteNode(uuid) {
  return new AutocompleteNode(uuid)
}

function AutocompleteComponent() {
  const [suggestion] = useSharedAutocompleteContext()
  const userAgentData = window.navigator.userAgentData
  const isMobile =
    userAgentData !== undefined
      ? userAgentData.mobile
      : window.innerWidth <= 800 && window.innerHeight <= 600
  // TODO Move to theme
  return (
    <span style={{ color: "#ccc" }} spellCheck="false">
      {suggestion} {isMobile ? "(SWIPE \u2B95)" : "(TAB)"}
    </span>
  )
}
