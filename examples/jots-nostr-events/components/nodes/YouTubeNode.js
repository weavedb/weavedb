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

function YouTubeComponent({ className, format, nodeKey, videoID }) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube-nocookie.com/embed/${videoID}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="YouTube video"
      />
    </BlockWithAlignableContents>
  )
}

function convertYoutubeElement(domNode) {
  const videoID = domNode.getAttribute("data-lexical-youtube")
  if (videoID) {
    const node = $createYouTubeNode(videoID)
    return { node }
  }
  return null
}

export class YouTubeNode extends DecoratorBlockNode {
  static getType() {
    return "youtube"
  }

  static clone(node) {
    return new YouTubeNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode) {
    const node = $createYouTubeNode(serializedNode.videoID)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "youtube",
      version: 1,
      videoID: this.__id,
    }
  }

  constructor(id, format, key) {
    super(format, key)
    this.__id = id
  }

  exportDOM() {
    const element = document.createElement("iframe")
    element.setAttribute("data-lexical-youtube", this.__id)
    element.setAttribute("width", "560")
    element.setAttribute("height", "315")
    element.setAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${this.__id}`
    )
    element.setAttribute("frameborder", "0")
    element.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    )
    element.setAttribute("allowfullscreen", "true")
    element.setAttribute("title", "YouTube video")
    return { element }
  }

  static importDOM() {
    return {
      iframe: domNode => {
        if (!domNode.hasAttribute("data-lexical-youtube")) {
          return null
        }
        return {
          conversion: convertYoutubeElement,
          priority: 1,
        }
      },
    }
  }

  updateDOM() {
    return false
  }

  getId() {
    return this.__id
  }

  getTextContent(_includeInert, _includeDirectionless) {
    return `https://www.youtube.com/watch?v=${this.__id}`
  }

  decorate(_editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    }
    return (
      <YouTubeComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    )
  }
}

export function $createYouTubeNode(videoID) {
  return new YouTubeNode(videoID)
}

export function $isYouTubeNode(node) {
  return node instanceof YouTubeNode
}
