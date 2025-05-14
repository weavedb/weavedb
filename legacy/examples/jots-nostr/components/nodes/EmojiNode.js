/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $applyNodeReplacement, TextNode } from "lexical"

export class EmojiNode extends TextNode {
  static getType() {
    return "emoji"
  }

  static clone(node) {
    return new EmojiNode(node.__className, node.__text, node.__key)
  }

  constructor(className, text, key) {
    super(text, key)
    this.__className = className
  }

  createDOM(config) {
    const dom = document.createElement("span")
    const inner = super.createDOM(config)
    dom.className = this.__className
    inner.className = "emoji-inner"
    dom.appendChild(inner)
    return dom
  }

  updateDOM(prevNode, dom, config) {
    const inner = dom.firstChild
    if (inner === null) {
      return true
    }
    super.updateDOM(prevNode, inner, config)
    return false
  }

  static importJSON(serializedNode) {
    const node = $createEmojiNode(serializedNode.className, serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      className: this.getClassName(),
      type: "emoji",
    }
  }

  getClassName() {
    const self = this.getLatest()
    return self.__className
  }
}

export function $isEmojiNode(node) {
  return node instanceof EmojiNode
}

export function $createEmojiNode(className, emojiText) {
  const node = new EmojiNode(className, emojiText).setMode("token")
  return $applyNodeReplacement(node)
}
