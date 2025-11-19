import { useState, useEffect, useRef } from "react";
import {
  IoPlayOutline,
  IoAddOutline,
  IoTrashOutline,
  IoLibraryOutline,
  IoCubeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import NotebookCell from "./components/NotebookCell";
import SchemaVisualizer from "./components/SchemaVisualizer";
import { DataPreview } from "./components/DataPreview";
import { DatasetSelector } from "./components/DatasetSelector";
import { LearningMode } from "./components/LearningMode";
import type { Cell, TableSchema } from "./types/notebook";
import {
  createDatabase,
  executeCell,
  extractSchema,
  getDatabase,
  loadDatabaseFromArray,
} from "./utils/sqlNotebook";
import { SAMPLE_DATASETS, DEFAULT_NOTEBOOK } from "./utils/sampleData";
import {
  saveCellsToLocalStorage,
  loadCellsFromLocalStorage,
  saveDatabaseToLocalStorage,
  loadDatabaseFromLocalStorage,
  clearLocalStorage,
} from "./utils/persistence";
import "./App.css";

function App() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [editingCells, setEditingCells] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDatasetSelector, setShowDatasetSelector] = useState(false);
  const [showLearningMode, setShowLearningMode] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(35); // percentage
  const [schemaHeight, setSchemaHeight] = useState(50); // percentage
  const [isResizingHorizontal, setIsResizingHorizontal] = useState(false);
  const [isResizingVertical, setIsResizingVertical] = useState(false);
  const horizontalResizeRef = useRef<HTMLDivElement>(null);
  const verticalResizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Try to load from localStorage first
        const savedCells = loadCellsFromLocalStorage();
        const savedDb = loadDatabaseFromLocalStorage();

        if (savedDb && savedCells) {
          // Restore from saved state
          await loadDatabaseFromArray(savedDb);
          const db = getDatabase();
          const dbSchema = extractSchema(db);
          setSchema(dbSchema);
          setCells(savedCells);
        } else {
          // Initialize with sample data
          await createDatabase(
            SAMPLE_DATASETS.employees + "\n" + SAMPLE_DATASETS.ecommerce
          );
          const db = getDatabase();
          const dbSchema = extractSchema(db);
          setSchema(dbSchema);

          const initialCells: Cell[] = DEFAULT_NOTEBOOK.map((item, idx) => ({
            id: `cell-${Date.now()}-${idx}`,
            type: item.type,
            content: item.content,
          }));

          setCells(initialCells);
        }

        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
      }
    };

    init();
  }, []);

  const addCell = (type: "sql" | "markdown", afterId?: string) => {
    const newCell: Cell = {
      id: `cell-${Date.now()}`,
      type,
      content:
        type === "sql"
          ? "-- Write your SQL query here\n"
          : "# New Section\n\nAdd your notes here...",
    };

    let updatedCells: Cell[];
    if (afterId) {
      const idx = cells.findIndex((c) => c.id === afterId);
      const newCells = [...cells];
      newCells.splice(idx + 1, 0, newCell);
      updatedCells = newCells;
    } else {
      updatedCells = [...cells, newCell];
    }

    setCells(updatedCells);
    saveCellsToLocalStorage(updatedCells);

    if (type === "markdown") {
      setEditingCells(new Set(editingCells).add(newCell.id));
    }
  };

  const updateCell = (id: string, content: string) => {
    const updatedCells = cells.map((cell) =>
      cell.id === id ? { ...cell, content } : cell
    );
    setCells(updatedCells);
    saveCellsToLocalStorage(updatedCells);
  };

  const deleteCell = (id: string) => {
    const updatedCells = cells.filter((cell) => cell.id !== id);
    setCells(updatedCells);
    saveCellsToLocalStorage(updatedCells);
    const newEditing = new Set(editingCells);
    newEditing.delete(id);
    setEditingCells(newEditing);
  };

  const runCell = async (id: string) => {
    const cell = cells.find((c) => c.id === id);
    if (!cell || cell.type !== "sql") return;

    setCells(
      cells.map((c) =>
        c.id === id
          ? { ...c, isExecuting: true, output: { text: "Executing..." } }
          : c
      )
    );

    try {
      const db = getDatabase();
      const result = await executeCell(cell, db);

      const newSchema = extractSchema(db);
      setSchema(newSchema);

      // Save database state
      saveDatabaseToLocalStorage(db);

      setCells(
        cells.map((c) =>
          c.id === id
            ? {
                ...c,
                isExecuting: false,
                output: {
                  text: result.error
                    ? `✗ Error:\n${result.error}`
                    : `✓ Output:\n${result.output}`,
                  results: result.results,
                  error: result.error,
                },
              }
            : c
        )
      );
    } catch (err: any) {
      setCells(
        cells.map((c) =>
          c.id === id
            ? {
                ...c,
                isExecuting: false,
                output: {
                  text: `❌ Unexpected error:\n${err.message}`,
                  error: err.message,
                },
              }
            : c
        )
      );
    }
  };

  const runAllCells = async () => {
    for (const cell of cells) {
      if (cell.type === "sql") {
        await runCell(cell.id);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  };

  const toggleEditMode = (id: string) => {
    const newEditing = new Set(editingCells);
    if (newEditing.has(id)) {
      newEditing.delete(id);
    } else {
      newEditing.add(id);
    }
    setEditingCells(newEditing);
  };

  // Horizontal resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingHorizontal) return;
      const container = horizontalResizeRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      if (newWidth >= 20 && newWidth <= 60) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingHorizontal(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizingHorizontal) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingHorizontal]);

  // Vertical resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingVertical) return;
      const container = verticalResizeRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight =
        ((e.clientY - containerRect.top) / containerRect.height) * 100;

      if (newHeight >= 20 && newHeight <= 80) {
        setSchemaHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingVertical(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizingVertical) {
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingVertical]);

  const clearNotebook = () => {
    setShowConfirmReset(true);
  };

  const handleConfirmReset = () => {
    setCells([]);
    clearLocalStorage();
    window.location.reload();
  };

  const loadDataset = async (datasetKey: string) => {
    const datasetSQL = (SAMPLE_DATASETS as any)[datasetKey];
    if (!datasetSQL) return;

    try {
      await createDatabase(datasetSQL);
      const db = getDatabase();
      const newSchema = extractSchema(db);
      setSchema(newSchema);
      saveDatabaseToLocalStorage(db);

      // Clear cells when loading new dataset
      setCells([]);
      saveCellsToLocalStorage([]);
    } catch (error) {
      console.error("Failed to load dataset:", error);
      alert("Failed to load dataset");
    }
  };

  if (!isInitialized) {
    return (
      <div className="app loading">
        <div className="loader"></div>
        <p>Initializing SQLNotebook...</p>
      </div>
    );
  }

  return (
    <div className="app notebook-app">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">
            <IoCubeOutline className="logo-icon-svg" />
            SQLBook
          </h1>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-icon-text"
            onClick={() => setShowDatasetSelector(true)}
            title="Load sample dataset"
          >
            <IoLibraryOutline /> Load Dataset
          </button>
          <button
            className="btn btn-secondary btn-icon-text"
            onClick={clearNotebook}
            title="Clear all and reset"
          >
            <IoTrashOutline /> Reset
          </button>
          <button
            className="btn btn-run-all btn-icon-text"
            onClick={runAllCells}
            title="Run all SQL cells"
          >
            <IoPlayOutline /> Run All
          </button>
        </div>
      </header>

      <main className="notebook-main">
        <div
          className={`left-panel ${isSidebarCollapsed ? "collapsed" : ""}`}
          style={{ width: isSidebarCollapsed ? "auto" : `${leftPanelWidth}%` }}
        >
          <button
            className="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <IoChevronForwardOutline />
            ) : (
              <IoChevronBackOutline />
            )}
          </button>

          <div
            style={{
              height: `${schemaHeight}%`,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <SchemaVisualizer schema={schema} />
          </div>

          <div
            ref={verticalResizeRef}
            className="vertical-resize-handle"
            onMouseDown={() => setIsResizingVertical(true)}
          />

          <div
            style={{
              height: `${100 - schemaHeight}%`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DataPreview
              db={getDatabase()}
              schema={schema}
              onDataChange={() => {
                const db = getDatabase();
                setSchema(extractSchema(db));
                saveDatabaseToLocalStorage(db);
              }}
            />
          </div>
        </div>

        {!isSidebarCollapsed && (
          <div
            ref={horizontalResizeRef}
            className="resize-handle"
            onMouseDown={() => setIsResizingHorizontal(true)}
          />
        )}

        <div className="notebook-container">
          <div className="notebook-cells">
            {cells.length === 0 ? (
              <div className="notebook-empty">
                <h2>Welcome to SQLBook!</h2>
                <p>Get started by adding your first SQL cell:</p>
                <div className="empty-actions">
                  <button
                    className="btn btn-primary btn-icon-text"
                    onClick={() => addCell("sql")}
                  >
                    <IoAddOutline /> Add SQL Cell
                  </button>
                </div>
              </div>
            ) : (
              cells.map((cell) => (
                <NotebookCell
                  key={cell.id}
                  cell={cell}
                  onUpdate={updateCell}
                  onRun={runCell}
                  onDelete={deleteCell}
                  isEditing={editingCells.has(cell.id)}
                  onEditToggle={toggleEditMode}
                />
              ))
            )}
            {cells.length > 0 && (
              <div
                className="add-cell-container"
                style={{ paddingBottom: "2rem" }}
              >
                <div
                  className="add-cell-divider"
                  onClick={() => addCell("sql")}
                >
                  <div className="add-cell-btn-floating">
                    <IoAddOutline /> Add New Cell
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          Powered by WebAssembly & SQL.js •{" "}
          <a
            href="https://shubhamdalvi.in"
            target="_blank"
            rel="noopener noreferrer"
            className="footer_link"
          >
            by Shubham Dalvi
          </a>
        </p>
      </footer>

      {showDatasetSelector && (
        <DatasetSelector
          onSelect={loadDataset}
          onClose={() => setShowDatasetSelector(false)}
        />
      )}

      {showLearningMode && (
        <LearningMode onClose={() => setShowLearningMode(false)} />
      )}

      {showConfirmReset && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmReset(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h2>Confirm Reset</h2>
              <button
                className="modal-close"
                onClick={() => setShowConfirmReset(false)}
              >
                <IoTrashOutline />
              </button>
            </div>
            <div className="modal-body">
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "var(--text-secondary)",
                }}
              >
                Are you sure you want to clear all cells and reset the database?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmReset(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmReset}
                style={{
                  background: "var(--error)",
                  borderColor: "var(--error)",
                }}
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
