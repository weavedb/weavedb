/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $setSelection, createEditor, DecoratorNode } from "lexical"
import * as React from "react"
import { Suspense } from "react"
import { createPortal } from "react-dom"

const StickyComponent = React.lazy(
  // @ts-ignore
  () => import("./StickyComponent")
)

export class StickyNode extends DecoratorNode {
  static getType() {
    return "sticky"
  }

  static clone(node) {
    return new StickyNode(
      node.__x,
      node.__y,
      node.__color,
      node.__caption,
      node.__key
    )
  }
  static importJSON(serializedNode) {
    const stickyNode = new StickyNode(
      serializedNode.xOffset,
      serializedNode.yOffset,
      serializedNode.color
    )
    const caption = serializedNode.caption
    const nestedEditor = stickyNode.__caption
    const editorState = nestedEditor.parseEditorState(caption.editorState)
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState)
    }
    return stickyNode
  }

  constructor(x, y, color, caption, key) {
    super(key)
    this.__x = x
    this.__y = y
    this.__caption = caption || createEditor()
    this.__color = color
  }

  exportJSON() {
    return {
      caption: this.__caption.toJSON(),
      color: this.__color,
      type: "sticky",
      version: 1,
      xOffset: this.__x,
      yOffset: this.__y,
    }
  }

  createDOM(config) {
    const div = document.createElement("div")
    div.style.display = "contents"
    return div
  }

  updateDOM() {
    return false
  }

  setPosition(x, y) {
    const writable = this.getWritable()
    writable.__x = x
    writable.__y = y
    $setSelection(null)
  }

  toggleColor() {
    const writable = this.getWritable()
    writable.__color = writable.__color === "pink" ? "yellow" : "pink"
  }

  decorate(editor, config) {
    return createPortal(
      <Suspense fallback={null}>
        <StickyComponent
          color={this.__color}
          x={this.__x}
          y={this.__y}
          nodeKey={this.getKey()}
          caption={this.__caption}
        />
      </Suspense>,
      document.body
    )
  }

  isIsolated() {
    return true
  }
}

export function $isStickyNode(node) {
  return node instanceof StickyNode
}

export function $createStickyNode(xOffset, yOffset) {
  return new StickyNode(xOffset, yOffset, "yellow")
}
