import "../components/index.css"

import "../components/nodes/ExcalidrawNode/ExcalidrawModal.css"
import "../components/nodes/ImageNode.css"
import "../components/nodes/InlineImageNode.css"
import "../components/nodes/PollNode.css"
import "../components/nodes/StickyNode.css"

import "../components/plugins/CommentPlugin/index.css"
import "../components/plugins/FloatingLinkEditorPlugin/index.css"
import "../components/plugins/FloatingTextFormatToolbarPlugin/index.css"
import "../components/plugins/CodeActionMenuPlugin/index.css"
import "../components/plugins/CodeActionMenuPlugin/components/PrettierButton/index.css"
import "../components/plugins/CollapsiblePlugin/Collapsible.css"
import "../components/plugins/DraggableBlockPlugin/index.css"
import "../components/plugins/TableCellResizer/index.css"
import "../components/plugins/TableOfContentsPlugin/index.css"

import "../components/themes/CommentEditorTheme.css"
import "../components/themes/PlaygroundEditorTheme.css"
import "../components/themes/StickyEditorTheme.css"

import "../components/ui/Button.css"
import "../components/ui/ContentEditable.css"
import "../components/ui/Dialog.css"
import "../components/ui/EquationEditor.css"
import "../components/ui/Input.css"
import "../components/ui/Modal.css"
import "../components/ui/Placeholder.css"
import "../components/ui/Select.css"
import "../components/ui/Checkbox.css"
import "../components/ui/ColorPicker.css"
import "../components/ui/KatexEquationAlterer.css"

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
