/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TextNode } from "lexical"

export class KeywordNode extends TextNode {
  static getType() {
    return "keyword"
  }

  static clone(node) {
    return new KeywordNode(node.__text, node.__key)
  }

  static importJSON(serializedNode) {
    const node = $createKeywordNode(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "keyword",
      version: 1,
    }
  }

  createDOM(config) {
    const dom = super.createDOM(config)
    dom.style.cursor = "default"
    dom.className = "keyword"
    return dom
  }

  canInsertTextBefore() {
    return false
  }

  canInsertTextAfter() {
    return false
  }

  isTextEntity() {
    return true
  }
}

export function $createKeywordNode(keyword) {
  return new KeywordNode(keyword)
}

export function $isKeywordNode(node) {
  return node instanceof KeywordNode
}
