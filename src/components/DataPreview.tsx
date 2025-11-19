import { useState, useEffect, useRef } from "react";
import {
  IoCloudUploadOutline,
  IoCloudDownloadOutline,
  IoTrashOutline,
} from "react-icons/io5";
import Papa from "papaparse";
import type { TableSchema } from "../types/notebook";

interface DataPreviewProps {
  db: any;
  schema: TableSchema[];
  onDataChange: () => void;
}

interface TableData {
  columns: string[];
  rows: any[][];
}

export function DataPreview({ db, schema, onDataChange }: DataPreviewProps) {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (schema.length > 0 && !selectedTable) {
      setSelectedTable(schema[0].name);
    }
  }, [schema, selectedTable]);

  useEffect(() => {
    if (selectedTable && db) {
      loadTableData();
    }
  }, [selectedTable, db]);

  const loadTableData = () => {
    if (!db || !selectedTable) return;

    try {
      const result = db.exec(`SELECT * FROM ${selectedTable}`);
      if (result.length > 0) {
        setTableData({
          columns: result[0].columns,
          rows: result[0].values,
        });
      } else {
        // Table exists but empty
        const schemaResult = db.exec(`PRAGMA table_info(${selectedTable})`);
        if (schemaResult.length > 0) {
          const columns = schemaResult[0].values.map((col: any) => col[1]);
          setTableData({ columns, rows: [] });
        }
      }
    } catch (error) {
      console.error("Error loading table data:", error);
    }
  };

  const handleCellDoubleClick = (
    rowIndex: number,
    colIndex: number,
    value: any
  ) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditValue(value !== null ? String(value) : "");
  };

  const handleCellUpdate = () => {
    if (!editingCell || !tableData || !db || !selectedTable) return;

    try {
      const row = tableData.rows[editingCell.row];
      const column = tableData.columns[editingCell.col];

      // Find primary key column (usually first column or 'id')
      const pkColumn = tableData.columns[0];
      const pkValue = row[0];

      // Update query
      const updateQuery = `UPDATE ${selectedTable} SET ${column} = ? WHERE ${pkColumn} = ?`;
      db.run(updateQuery, [editValue, pkValue]);

      loadTableData();
      onDataChange();
      setEditingCell(null);
    } catch (error) {
      console.error("Error updating cell:", error);
      alert("Failed to update cell. Check console for details.");
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (!tableData || !db || !selectedTable) return;
    if (!confirm("Delete this row?")) return;

    try {
      const row = tableData.rows[rowIndex];
      const pkColumn = tableData.columns[0];
      const pkValue = row[0];

      db.run(`DELETE FROM ${selectedTable} WHERE ${pkColumn} = ?`, [pkValue]);
      loadTableData();
      onDataChange();
    } catch (error) {
      console.error("Error deleting row:", error);
      alert("Failed to delete row.");
    }
  };

  const exportTableAsCSV = () => {
    if (!tableData || !selectedTable) return;

    const csvContent = [
      tableData.columns.join(","),
      ...tableData.rows.map((row) =>
        row
          .map((cell) => {
            const value = cell === null ? "" : String(cell);
            return value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !db) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.data.length === 0) {
            alert("CSV file is empty");
            return;
          }

          const tableName = file.name
            .replace(/\.csv$/i, "")
            .replace(/[^a-zA-Z0-9_]/g, "_");
          const columns = results.meta.fields || [];

          if (columns.length === 0) {
            alert("No columns found in CSV");
            return;
          }

          // Clear existing database tables so only the imported CSV schema remains
          try {
            if (Array.isArray(schema) && schema.length > 0) {
              schema.forEach((t) => {
                try {
                  db.run(`DROP TABLE IF EXISTS ${t.name}`);
                } catch (e) {
                  // ignore per-table errors
                }
              });
            }
          } catch (e) {
            // Fallback: attempt to drop any table we might know
          }

          // Create table for imported CSV
          const columnDefs = columns.map((col) => `${col} TEXT`).join(", ");
          db.run(`DROP TABLE IF EXISTS ${tableName}`);
          db.run(`CREATE TABLE ${tableName} (${columnDefs})`);

          // Insert data
          const placeholders = columns.map(() => "?").join(", ");
          const insertStmt = db.prepare(
            `INSERT INTO ${tableName} VALUES (${placeholders})`
          );

          results.data.forEach((row: any) => {
            const values = columns.map((col) => row[col] ?? null);
            insertStmt.run(values);
          });

          insertStmt.free();

          onDataChange();
          setSelectedTable(tableName);
          alert(
            `Imported ${results.data.length} rows into table "${tableName}"`
          );
        } catch (error) {
          console.error("CSV import error:", error);
          alert("Failed to import CSV. Check console for details.");
        }
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        alert("Failed to parse CSV file.");
      },
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedTableInfo = schema.find((t) => t.name === selectedTable);
  const rowCount = tableData?.rows.length || 0;

  return (
    <div className="data-preview">
      <div className="data-preview-header">
        <div className="table-selector-wrapper">
          <label className="table-selector-label">Table:</label>
          <select
            className="table-selector"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            {schema.map((table) => (
              <option key={table.name} value={table.name}>
                {table.name}
              </option>
            ))}
          </select>
          <div className="data-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: "none" }}
            />
            <button
              className="btn btn-secondary btn-sm btn-icon-text"
              onClick={() => fileInputRef.current?.click()}
              title="Import CSV file"
            >
              <IoCloudUploadOutline /> Import
            </button>
            <button
              className="btn btn-secondary btn-sm btn-icon-text"
              onClick={exportTableAsCSV}
              title="Export as CSV"
            >
              <IoCloudDownloadOutline /> Export
            </button>
          </div>
        </div>
        <div className="data-stats">
          <span className="row-count">{rowCount} rows</span>
          {selectedTableInfo && (
            <span className="col-count">
              {selectedTableInfo.columns.length} columns
            </span>
          )}
        </div>
      </div>

      <div className="data-preview-content">
        {!tableData ? (
          <div className="data-empty">
            <p>Select a table to preview data</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="row-number-header">#</th>
                  {tableData.columns.map((col, idx) => {
                    const colInfo = selectedTableInfo?.columns.find(
                      (c) => c.name === col
                    );
                    return (
                      <th key={idx}>
                        <div className="data-col-header">
                          <span className="col-name">{col}</span>
                          {colInfo && (
                            <span className="col-type">{colInfo.type}</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="action-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="row-number">{rowIdx + 1}</td>
                    {row.map((cell, colIdx) => (
                      <td
                        key={colIdx}
                        onDoubleClick={() =>
                          handleCellDoubleClick(rowIdx, colIdx, cell)
                        }
                        className="data-cell"
                        title="Double-click to edit"
                      >
                        {editingCell?.row === rowIdx &&
                        editingCell?.col === colIdx ? (
                          <div className="cell-edit-wrapper">
                            <input
                              type="text"
                              className="cell-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellUpdate}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCellUpdate();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className={cell === null ? "null-value" : ""}>
                            {cell === null ? "NULL" : String(cell)}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="action-cell">
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteRow(rowIdx)}
                        title="Delete row"
                      >
                        <IoTrashOutline />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
