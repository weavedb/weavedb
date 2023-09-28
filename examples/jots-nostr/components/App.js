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
import Editor from "./Editor"
import lf from "localforage"
let isChecked = false
export default function App({
  setHTML,
  editID,
  editContent,
  setTitle,
  setBody,
  title,
  body,
}) {
  const {
    settings: { isCollab, emptyEditor, measureTypingPerf },
  } = useSettings()
  const [val, setVal] = useState(null)
  const [isInit, setIsInit] = useState(false)
  useEffect(() => {
    ;(async () => {
      const _val = await lf.getItem(`edit-${editID ?? "new"}`)
      setVal(_val || null)
      setIsInit(true)
    })()
  }, [])
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
    const json = e.editorState.toJSON()
    const date = Date.now()
    if (isChecked) lf.setItem(`edit-${editID ?? "new"}`, { date, nodes: json })
    editor.update(() => {
      if (!isNil(editContent)) {
        if (!isChecked) {
          isChecked = true
          const empty =
            isNil(val?.nodes?.root) ||
            (!isNil(val?.nodes?.root) &&
              val.nodes.root.children.length === 1 &&
              val.nodes.root.children[0].children.length === 0)
          if (
            !isNil(editContent) &&
            (empty || (editContent.date || 0) > (val?.date ?? 0))
          ) {
            const parser = new DOMParser()
            const dom = parser.parseFromString(editContent.content, "text/html")
            const nodes = $generateNodesFromDOM(editor, dom)
            const root = $getRoot()
            root.clear()
            root.append(...nodes)
            setTitle(editContent.title)
            setBody(editContent.description)
          }
        }
      }
      setHTML($generateHtmlFromNodes(editor, null))
    })
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
