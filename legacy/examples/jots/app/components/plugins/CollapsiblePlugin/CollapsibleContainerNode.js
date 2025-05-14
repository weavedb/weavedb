/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

export function convertDetailsElement(
  domNode,
) {
  const isOpen = domNode.open !== undefined ? domNode.open : true;
  const node = $createCollapsibleContainerNode(isOpen);
  return {
    node,
  };
}

export class CollapsibleContainerNode extends ElementNode {
  __open;

  constructor(open, key) {
    super(key);
    this.__open = open;
  }

  static getType() {
    return 'collapsible-container';
  }

  static clone(node) {
    return new CollapsibleContainerNode(node.__open, node.__key);
  }

  createDOM(config, editor) {
    const dom = document.createElement('details');
    dom.classList.add('Collapsible__container');
    dom.open = this.__open;
    dom.addEventListener('toggle', () => {
      const open = editor.getEditorState().read(() => this.getOpen());
      if (open !== dom.open) {
        editor.update(() => this.toggleOpen());
      }
    });
    return dom;
  }

  updateDOM(
    prevNode,
    dom,
  ) {
    if (prevNode.__open !== this.__open) {
      dom.open = this.__open;
    }

    return false;
  }

  static importDOM(){
    return {
      details: (domNode) => {
        return {
          conversion: convertDetailsElement,
          priority: 1,
        };
      },
    };
  }

  static importJSON(
    serializedNode,
  ) {
    const node = $createCollapsibleContainerNode(serializedNode.open);
    return node;
  }

  exportDOM() {
    const element = document.createElement('details');
    element.setAttribute('open', this.__open.toString());
    return {element};
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      open: this.__open,
      type: 'collapsible-container',
      version: 1,
    };
  }

  setOpen(open) {
    const writable = this.getWritable();
    writable.__open = open;
  }

  getOpen() {
    return this.getLatest().__open;
  }

  toggleOpen() {
    this.setOpen(!this.getOpen());
  }
}

export function $createCollapsibleContainerNode(
  isOpen,
) {
  return new CollapsibleContainerNode(isOpen);
}

export function $isCollapsibleContainerNode(
  node,
) {
  return node instanceof CollapsibleContainerNode;
}
