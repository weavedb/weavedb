/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isCodeNode } from "@lexical/code"
import { $getNearestNodeFromDOMNode, LexicalEditor } from "lexical"
//import { Options } from "prettier"
import * as React from "react"
import { useState } from "react"

const PRETTIER_PARSER_MODULES = {
  css: () => import("prettier/parser-postcss"),
  html: () => import("prettier/parser-html"),
  js: () => import("prettier/parser-babel"),
  markdown: () => import("prettier/parser-markdown"),
}

async function loadPrettierParserByLang(lang) {
  const dynamicImport = PRETTIER_PARSER_MODULES[lang]
  return await dynamicImport()
}

async function loadPrettierFormat() {
  const { format } = await import("prettier/standalone")
  return format
}

const PRETTIER_OPTIONS_BY_LANG = {
  css: {
    parser: "css",
  },
  html: {
    parser: "html",
  },
  js: {
    parser: "babel",
  },
  markdown: {
    parser: "markdown",
  },
}

const LANG_CAN_BE_PRETTIER = Object.keys(PRETTIER_OPTIONS_BY_LANG)

export function canBePrettier(lang) {
  return LANG_CAN_BE_PRETTIER.includes(lang)
}

function getPrettierOptions(lang) {
  const options = PRETTIER_OPTIONS_BY_LANG[lang]
  if (!options) {
    throw new Error(
      `CodeActionMenuPlugin: Prettier does not support this language: ${lang}`
    )
  }

  return options
}

export function PrettierButton({ lang, editor, getCodeDOMNode }) {
  const [syntaxError, setSyntaxError] = useState("")
  const [tipsVisible, setTipsVisible] = useState(false)

  async function handleClick() {
    const codeDOMNode = getCodeDOMNode()

    try {
      const format = await loadPrettierFormat()
      const options = getPrettierOptions(lang)
      options.plugins = [await loadPrettierParserByLang(lang)]

      if (!codeDOMNode) {
        return
      }

      editor.update(() => {
        const codeNode = $getNearestNodeFromDOMNode(codeDOMNode)

        if ($isCodeNode(codeNode)) {
          const content = codeNode.getTextContent()

          let parsed = ""

          try {
            parsed = format(content, options)
          } catch (error) {
            setError(error)
          }

          if (parsed !== "") {
            const selection = codeNode.select(0)
            selection.insertText(parsed)
            setSyntaxError("")
            setTipsVisible(false)
          }
        }
      })
    } catch (error) {
      setError(error)
    }
  }

  function setError(error) {
    if (error instanceof Error) {
      setSyntaxError(error.message)
      setTipsVisible(true)
    } else {
      console.error("Unexpected error: ", error)
    }
  }

  function handleMouseEnter() {
    if (syntaxError !== "") {
      setTipsVisible(true)
    }
  }

  function handleMouseLeave() {
    if (syntaxError !== "") {
      setTipsVisible(false)
    }
  }

  return (
    <div className="prettier-wrapper">
      <button
        className="menu-item"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="prettier"
      >
        {syntaxError ? (
          <i className="format prettier-error" />
        ) : (
          <i className="format prettier" />
        )}
      </button>
      {tipsVisible ? (
        <pre className="code-error-tips">{syntaxError}</pre>
      ) : null}
    </div>
  )
}
