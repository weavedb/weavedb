/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createParagraphNode,
  $isElementNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  SerializedElementNode,
} from "lexical"

import { $isCollapsibleContainerNode } from "./CollapsibleContainerNode"
import { $isCollapsibleContentNode } from "./CollapsibleContentNode"

export function convertSummaryElement(domNode) {
  const node = $createCollapsibleTitleNode()
  return {
    node,
  }
}

export class CollapsibleTitleNode extends ElementNode {
  static getType() {
    return "collapsible-title"
  }

  static clone(node) {
    return new CollapsibleTitleNode(node.__key)
  }

  createDOM(config, editor) {
    const dom = document.createElement("summary")
    dom.classList.add("Collapsible__title")
    return dom
  }

  updateDOM(prevNode, dom) {
    return false
  }

  static importDOM() {
    return {
      summary: domNode => {
        return {
          conversion: convertSummaryElement,
          priority: 1,
        }
      },
    }
  }

  static importJSON(serializedNode) {
    return $createCollapsibleTitleNode()
  }

  exportDOM() {
    const element = document.createElement("summary")
    return { element }
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "collapsible-title",
      version: 1,
    }
  }

  collapseAtStart(_selection) {
    this.getParentOrThrow().insertBefore(this)
    return true
  }

  insertNewAfter(_, restoreSelection = true) {
    const containerNode = this.getParentOrThrow()

    if (!$isCollapsibleContainerNode(containerNode)) {
      throw new Error(
        "CollapsibleTitleNode expects to be child of CollapsibleContainerNode"
      )
    }

    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling()
      if (!$isCollapsibleContentNode(contentNode)) {
        throw new Error(
          "CollapsibleTitleNode expects to have CollapsibleContentNode sibling"
        )
      }

      const firstChild = contentNode.getFirstChild()
      if ($isElementNode(firstChild)) {
        return firstChild
      } else {
        const paragraph = $createParagraphNode()
        contentNode.append(paragraph)
        return paragraph
      }
    } else {
      const paragraph = $createParagraphNode()
      containerNode.insertAfter(paragraph, restoreSelection)
      return paragraph
    }
  }
}

export function $createCollapsibleTitleNode() {
  return new CollapsibleTitleNode()
}

export function $isCollapsibleTitleNode(node) {
  return node instanceof CollapsibleTitleNode
}
