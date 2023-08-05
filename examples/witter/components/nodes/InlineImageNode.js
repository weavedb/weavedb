/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $applyNodeReplacement, createEditor, DecoratorNode } from "lexical"
import * as React from "react"
import { Suspense } from "react"

const InlineImageComponent = React.lazy(() => import("./InlineImageComponent"))

function convertInlineImageElement(domNode) {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode
    const node = $createInlineImageNode({ altText, height, src, width })
    return { node }
  }
  return null
}

export class InlineImageNode extends DecoratorNode {
  static getType() {
    return "inline-image"
  }

  static clone(node) {
    return new InlineImageNode(
      node.__src,
      node.__altText,
      node.__position,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key
    )
  }

  static importJSON(serializedNode) {
    const { altText, height, width, caption, src, showCaption, position } =
      serializedNode
    const node = $createInlineImageNode({
      altText,
      height,
      position,
      showCaption,
      src,
      width,
    })
    const nestedEditor = node.__caption
    const editorState = nestedEditor.parseEditorState(caption.editorState)
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState)
    }
    return node
  }

  static importDOM() {
    return {
      img: node => ({
        conversion: convertInlineImageElement,
        priority: 0,
      }),
    }
  }

  constructor(
    src,
    altText,
    position,
    width,
    height,
    showCaption,
    caption,
    key
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width || "inherit"
    this.__height = height || "inherit"
    this.__showCaption = showCaption || false
    this.__caption = caption || createEditor()
    this.__position = position
  }

  exportDOM() {
    const element = document.createElement("img")
    element.setAttribute("src", this.__src)
    element.setAttribute("alt", this.__altText)
    element.setAttribute("width", this.__width.toString())
    element.setAttribute("height", this.__height.toString())
    return { element }
  }

  exportJSON() {
    return {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      position: this.__position,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: "inline-image",
      version: 1,
      width: this.__width === "inherit" ? 0 : this.__width,
    }
  }

  getSrc() {
    return this.__src
  }

  getAltText() {
    return this.__altText
  }

  setAltText(altText) {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  setWidthAndHeight(width, height) {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  getShowCaption() {
    return this.__showCaption
  }

  setShowCaption(showCaption) {
    const writable = this.getWritable()
    writable.__showCaption = showCaption
  }

  getPosition() {
    return this.__position
  }

  setPosition(position) {
    const writable = this.getWritable()
    writable.__position = position
  }

  update(payload) {
    const writable = this.getWritable()
    const { altText, showCaption, position } = payload
    if (altText !== undefined) {
      writable.__altText = altText
    }
    if (showCaption !== undefined) {
      writable.__showCaption = showCaption
    }
    if (position !== undefined) {
      writable.__position = position
    }
  }

  // View

  createDOM(config) {
    const span = document.createElement("span")
    const className = `${config.theme.inlineImage} position-${this.__position}`
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(prevNode, dom, config) {
    const position = this.__position
    if (position !== prevNode.__position) {
      const className = `${config.theme.inlineImage} position-${position}`
      if (className !== undefined) {
        dom.className = className
      }
    }
    return false
  }

  decorate() {
    return (
      <Suspense fallback={null}>
        <InlineImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          position={this.__position}
        />
      </Suspense>
    )
  }
}

export function $createInlineImageNode({
  altText,
  position,
  height,
  src,
  width,
  showCaption,
  caption,
  key,
}) {
  return $applyNodeReplacement(
    new InlineImageNode(
      src,
      altText,
      position,
      width,
      height,
      showCaption,
      caption,
      key
    )
  )
}

export function $isInlineImageNode(node) {
  return node instanceof InlineImageNode
}
