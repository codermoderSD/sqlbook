import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <div className="code-editor">
      <CodeMirror
        value={value}
        height="100%"
        autoFocus={true}
        theme={vscodeDark}
        extensions={[sql()]}
        onChange={onChange}
        draggable={true}
        basicSetup={{
          lineNumbers: true,
          tabSize: 4,
          foldGutter: false,
          highlightActiveLineGutter: true,
          highlightActiveLine: false,
          searchKeymap: true,
          autocompletion: true,
          syntaxHighlighting: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
