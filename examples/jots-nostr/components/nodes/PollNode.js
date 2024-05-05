/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import * as React from "react"
import { Suspense } from "react"

const PollComponent = React.lazy(
  // @ts-ignore
  () => import("./PollComponent")
)

function createUID() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5)
}

export function createPollOption(text = "") {
  return {
    text,
    uid: createUID(),
    votes: [],
  }
}

function cloneOption(option, text, votes) {
  return {
    text,
    uid: option.uid,
    votes: votes || Array.from(option.votes),
  }
}

function convertPollElement(domNode) {
  const question = domNode.getAttribute("data-lexical-poll-question")
  const options = domNode.getAttribute("data-lexical-poll-options")
  if (question !== null && options !== null) {
    const node = $createPollNode(question, JSON.parse(options))
    return { node }
  }
  return null
}

export class PollNode extends DecoratorNode {
  static getType() {
    return "poll"
  }

  static clone(node) {
    return new PollNode(node.__question, node.__options, node.__key)
  }

  static importJSON(serializedNode) {
    const node = $createPollNode(
      serializedNode.question,
      serializedNode.options
    )
    serializedNode.options.forEach(node.addOption)
    return node
  }

  constructor(question, options, key) {
    super(key)
    this.__question = question
    this.__options = options
  }

  exportJSON() {
    return {
      options: this.__options,
      question: this.__question,
      type: "poll",
      version: 1,
    }
  }

  addOption(option) {
    const self = this.getWritable()
    const options = Array.from(self.__options)
    options.push(option)
    self.__options = options
  }

  deleteOption(option) {
    const self = this.getWritable()
    const options = Array.from(self.__options)
    const index = options.indexOf(option)
    options.splice(index, 1)
    self.__options = options
  }

  setOptionText(option, text) {
    const self = this.getWritable()
    const clonedOption = cloneOption(option, text)
    const options = Array.from(self.__options)
    const index = options.indexOf(option)
    options[index] = clonedOption
    self.__options = options
  }

  toggleVote(option, clientID) {
    const self = this.getWritable()
    const votes = option.votes
    const votesClone = Array.from(votes)
    const voteIndex = votes.indexOf(clientID)
    if (voteIndex === -1) {
      votesClone.push(clientID)
    } else {
      votesClone.splice(voteIndex, 1)
    }
    const clonedOption = cloneOption(option, option.text, votesClone)
    const options = Array.from(self.__options)
    const index = options.indexOf(option)
    options[index] = clonedOption
    self.__options = options
  }

  static importDOM() {
    return {
      span: domNode => {
        if (!domNode.hasAttribute("data-lexical-poll-question")) {
          return null
        }
        return {
          conversion: convertPollElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM() {
    const element = document.createElement("span")
    element.setAttribute("data-lexical-poll-question", this.__question)
    element.setAttribute(
      "data-lexical-poll-options",
      JSON.stringify(this.__options)
    )
    return { element }
  }

  createDOM() {
    const elem = document.createElement("span")
    elem.style.display = "inline-block"
    return elem
  }

  updateDOM() {
    return false
  }

  decorate() {
    return (
      <Suspense fallback={null}>
        <PollComponent
          question={this.__question}
          options={this.__options}
          nodeKey={this.__key}
        />
      </Suspense>
    )
  }
}

export function $createPollNode(question, options) {
  return new PollNode(question, options)
}

export function $isPollNode(node) {
  return node instanceof PollNode
}
