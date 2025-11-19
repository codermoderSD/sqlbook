import { useState, useEffect } from "react";
import {
  IoPlayCircleOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoTrashOutline,
} from "react-icons/io5";
import CodeEditor from "./CodeEditor";
import OutputDisplay from "./OutputDisplay";
import { marked } from "marked";
import type { Cell } from "../types/notebook";

interface NotebookCellProps {
  cell: Cell;
  onUpdate: (id: string, content: string) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onEditToggle: (id: string) => void;
}

const NotebookCell = ({
  cell,
  onUpdate,
  onRun,
  onDelete,
  isEditing,
  onEditToggle,
}: NotebookCellProps) => {
  const [renderedMarkdown, setRenderedMarkdown] = useState("");

  useEffect(() => {
    if (cell.type === "markdown" && !isEditing) {
      const result = marked.parse(cell.content);
      if (typeof result === "string") {
        setRenderedMarkdown(result);
      } else {
        result.then(setRenderedMarkdown);
      }
    }
  }, [cell.content, cell.type, isEditing]);

  return (
    <div className={`notebook-cell ${cell.type}-cell`}>
      <div className="cell-sidebar">
        <div className="cell-execution-indicator">
          {cell.type === "sql" && (
            <button
              className="cell-run-btn"
              onClick={() => onRun(cell.id)}
              disabled={cell.isExecuting}
              title="Run cell (Shift+Enter)"
            >
              {cell.isExecuting ? (
                <div className="mini-loader"></div>
              ) : (
                <IoPlayCircleOutline />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="cell-content">
        <div className="cell-header">
          <div className="cell-actions">
            {cell.type === "markdown" && (
              <button
                className="cell-action-btn"
                onClick={() => onEditToggle(cell.id)}
                title={isEditing ? "Preview" : "Edit"}
              >
                {isEditing ? <IoEyeOutline /> : <IoPencilOutline />}
              </button>
            )}
            <button
              className="cell-action-btn cell-delete-btn"
              onClick={() => onDelete(cell.id)}
              title="Delete cell"
            >
              <IoTrashOutline />
            </button>
          </div>
        </div>

        {cell.type === "sql" ? (
          <>
            <div className="cell-editor">
              <CodeEditor
                value={cell.content}
                onChange={(value) => onUpdate(cell.id, value)}
              />
            </div>
            {cell.output && (
              <div className="cell-output">
                <OutputDisplay
                  output={cell.output.text}
                  isExecuting={cell.isExecuting || false}
                  language="sql"
                  sqlResults={cell.output.results}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {isEditing ? (
              <div className="cell-editor markdown-editor">
                <textarea
                  className="markdown-textarea"
                  value={cell.content}
                  onChange={(e) => onUpdate(cell.id, e.target.value)}
                  placeholder="Enter markdown..."
                />
              </div>
            ) : (
              <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotebookCell;
