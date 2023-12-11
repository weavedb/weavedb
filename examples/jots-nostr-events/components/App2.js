import { useState, useEffect } from "react"
import { isNil } from "ramda"
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { SettingsContext, useSettings } from "./context/SettingsContext"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { SharedHistoryContext } from "./context/SharedHistoryContext"
import PlaygroundNodes from "./nodes/PlaygroundNodes"
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme"
import { TableContext } from "./plugins/TablePlugin"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical"
import { $createListItemNode, $createListNode } from "@lexical/list"
import { $createLinkNode } from "@lexical/link"
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext"
import TypingPerfPlugin from "./plugins/TypingPerfPlugin"
import Settings from "./Settings"
import Editor2 from "./Editor2"
import lf from "localforage"
let isChecked = false
const { convert } = require("html-to-text")
export default function App({ setHTML, setText, setJSON }) {
  const {
    settings: { isCollab, emptyEditor, measureTypingPerf },
  } = useSettings()
  const [val, setVal] = useState(null)
  const initialConfig = {
    editorState: !isNil(val)
      ? isNil(val.date)
        ? JSON.stringify(val)
        : JSON.stringify(val.nodes)
      : isCollab
      ? null
      : undefined,
    namespace: "Playground",
    nodes: [...PlaygroundNodes],
    onError: error => {
      throw error
    },
    theme: PlaygroundEditorTheme,
  }
  function OnChangePlugin({ onChange }) {
    const [editor] = useLexicalComposerContext()
    useEffect(() => {
      return editor.registerUpdateListener(editorState => {
        onChange(editorState, editor)
      })
    }, [editor, onChange])
  }
  function onChange(e, editor) {
    setJSON(e.editorState.toJSON())
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor, null)
      setHTML(html)
      setText(
        convert(html, {
          selectors: [
            {
              selector: "a",
              options: { ignoreHref: true },
            },
          ],
        })
      )
    })
  }
  return (
    <SettingsContext>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <TableContext>
            <SharedAutocompleteContext>
              <div className="editor-shell">
                <Editor2 />
              </div>
            </SharedAutocompleteContext>
          </TableContext>
        </SharedHistoryContext>
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </SettingsContext>
  )
}
