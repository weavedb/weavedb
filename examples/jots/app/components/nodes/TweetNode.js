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
import { useCallback, useEffect, useRef, useState } from "react"

const WIDGET_SCRIPT_URL = "https://platform.twitter.com/widgets.js"

function convertTweetElement(domNode) {
  const id = domNode.getAttribute("data-lexical-tweet-id")
  if (id) {
    const node = $createTweetNode(id)
    return { node }
  }
  return null
}

let isTwitterScriptLoading = true

function TweetComponent({
  className,
  format,
  loadingComponent,
  nodeKey,
  onError,
  onLoad,
  tweetID,
}) {
  const containerRef = useRef(null)

  const previousTweetIDRef = useRef("")
  const [isTweetLoading, setIsTweetLoading] = useState(false)

  const createTweet = useCallback(async () => {
    try {
      // @ts-expect-error Twitter is attached to the window.
      await window.twttr.widgets.createTweet(tweetID, containerRef.current)

      setIsTweetLoading(false)
      isTwitterScriptLoading = false

      if (onLoad) {
        onLoad()
      }
    } catch (error) {
      if (onError) {
        onError(String(error))
      }
    }
  }, [onError, onLoad, tweetID])

  useEffect(() => {
    if (tweetID !== previousTweetIDRef.current) {
      setIsTweetLoading(true)

      if (isTwitterScriptLoading) {
        const script = document.createElement("script")
        script.src = WIDGET_SCRIPT_URL
        script.async = true
        document.body?.appendChild(script)
        script.onload = createTweet
        if (onError) {
          script.onerror = onError
        }
      } else {
        createTweet()
      }

      if (previousTweetIDRef) {
        previousTweetIDRef.current = tweetID
      }
    }
  }, [createTweet, onError, tweetID])

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      {isTweetLoading ? loadingComponent : null}
      <div
        style={{ display: "inline-block", width: "550px" }}
        ref={containerRef}
      />
    </BlockWithAlignableContents>
  )
}

export class TweetNode extends DecoratorBlockNode {
  static getType() {
    return "tweet"
  }

  static clone(node) {
    return new TweetNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode) {
    const node = $createTweetNode(serializedNode.id)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      type: "tweet",
      version: 1,
    }
  }

  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute("data-lexical-tweet-id")) {
          return null
        }
        return {
          conversion: convertTweetElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM() {
    const element = document.createElement("div")
    element.setAttribute("data-lexical-tweet-id", this.__id)
    const text = document.createTextNode(this.getTextContent())
    element.append(text)
    return { element }
  }

  constructor(id, format, key) {
    super(format, key)
    this.__id = id
  }

  getId() {
    return this.__id
  }

  getTextContent(_includeInert, _includeDirectionless) {
    return `https://twitter.com/i/web/status/${this.__id}`
  }

  decorate(editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    }
    return (
      <TweetComponent
        className={className}
        format={this.__format}
        loadingComponent="Loading..."
        nodeKey={this.getKey()}
        tweetID={this.__id}
      />
    )
  }
}

export function $createTweetNode(tweetID) {
  return new TweetNode(tweetID)
}

export function $isTweetNode(node) {
  return node instanceof TweetNode
}
