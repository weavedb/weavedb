/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents"
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode"
import * as React from "react"

function FigmaComponent({ className, format, nodeKey, documentID }) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <iframe
        width="560"
        height="315"
        src={`https://www.figma.com/embed?embed_host=lexical&url=\
        https://www.figma.com/file/${documentID}`}
        allowFullScreen={true}
      />
    </BlockWithAlignableContents>
  )
}

export class FigmaNode extends DecoratorBlockNode {
  static getType() {
    return "figma"
  }

  static clone(node) {
    return new FigmaNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode) {
    const node = $createFigmaNode(serializedNode.documentID)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      documentID: this.__id,
      type: "figma",
      version: 1,
    }
  }

  constructor(id, format, key) {
    super(format, key)
    this.__id = id
  }

  updateDOM() {
    return false
  }

  getId() {
    return this.__id
  }

  getTextContent(_includeInert, _includeDirectionless) {
    return `https://www.figma.com/file/${this.__id}`
  }

  decorate(_editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    }
    return (
      <FigmaComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        documentID={this.__id}
      />
    )
  }
}

export function $createFigmaNode(documentID) {
  return new FigmaNode(documentID)
}

export function $isFigmaNode(node) {
  return node instanceof FigmaNode
}
