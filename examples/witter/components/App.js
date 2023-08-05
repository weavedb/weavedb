import { useState, useEffect } from "react"
import { isNil } from "ramda"
import { $generateHtmlFromNodes } from "@lexical/html"
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
import Editor from "./Editor"
import lf from "localforage"

export default function App({ setHTML }) {
  const {
    settings: { isCollab, emptyEditor, measureTypingPerf },
  } = useSettings()
  const [val, setVal] = useState(null)
  const [isInit, setIsInit] = useState(false)
  useEffect(() => {
    ;(async () => {
      setVal((await lf.getItem("edit")) || null)
      setIsInit(true)
    })()
  }, [])

  const initialConfig = {
    editorState: !isNil(val)
      ? JSON.stringify(val)
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
    const json = e.editorState.toJSON()
    lf.setItem("edit", json)
    editor.update(() => setHTML($generateHtmlFromNodes(editor, null)))
  }
  return !isInit ? null : (
    <SettingsContext>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <TableContext>
            <SharedAutocompleteContext>
              <div className="editor-shell">
                <Editor />
              </div>
              {measureTypingPerf ? <TypingPerfPlugin /> : null}
            </SharedAutocompleteContext>
          </TableContext>
        </SharedHistoryContext>
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </SettingsContext>
  )
}
