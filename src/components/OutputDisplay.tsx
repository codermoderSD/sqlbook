import React from "react";
import {
  IoArrowBack,
  IoArrowForward,
  IoDownloadOutline,
  IoPlayCircleOutline,
} from "react-icons/io5";

interface SQLOutput {
  columns: string[];
  values: any[][];
}

interface OutputDisplayProps {
  output: string;
  isExecuting: boolean;
  language?: "python" | "javascript" | "sql";
  sqlResults?: SQLOutput[];
}

const OutputDisplay = ({
  output,
  isExecuting,
  language,
  sqlResults,
}: OutputDisplayProps) => {
  const [selectedIndex] = React.useState<number>(0);
  const [search] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(1);

  const filtered = React.useMemo(() => {
    if (!sqlResults || sqlResults.length === 0 || !sqlResults[selectedIndex])
      return [];
    const table = sqlResults[selectedIndex];
    if (!search) return table.values;
    const q = search.toLowerCase();
    return table.values.filter((row) =>
      row.some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [search, sqlResults, selectedIndex]);

  if (!output && !isExecuting) {
    return (
      <div className="output-empty">
        <div className="output-empty-icon">
          <IoPlayCircleOutline />
        </div>
        <p className="output-empty-text">Click "Run Code" to see output</p>
        <p className="output-empty-hint">
          Your code execution results will appear here
        </p>
      </div>
    );
  }

  if (isExecuting) {
    return (
      <div className="output-executing">
        <div className="loader"></div>
        <p>Executing code...</p>
      </div>
    );
  }

  const isError = output.startsWith("✗");
  const isSuccess = output.startsWith("✓");

  // Parse output to separate status from content
  let statusLine = "";
  let contentLines = output;

  if (isError || isSuccess) {
    const lines = output.split("\n");
    statusLine = lines[0];
    contentLines = lines.slice(1).join("\n");
  }

  // Render SQL structured results as an interactive table if present
  if (language === "sql" && sqlResults && sqlResults.length > 0) {
    const table = sqlResults[selectedIndex];
    const headers = table.columns;

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageRows = filtered.slice(pageStart, pageStart + pageSize);

    const downloadCsv = (idx: number) => {
      const t = sqlResults[idx];
      const csv = [t.columns.join(",")]
        .concat(
          t.values.map((r) =>
            r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
          )
        )
        .join("\n");
      const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      const link = document.createElement("a");
      link.setAttribute("href", uri);
      link.setAttribute("download", `query-result.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="output-result output-sql">
        <div className="sql-toolbar">
          <div className="sql-toolbar-left">
            <span className="sql-count">
              {filtered.length} row{filtered.length !== 1 ? "s" : ""} •{" "}
              {headers.length} column{headers.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="sql-toolbar-right">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => downloadCsv(selectedIndex)}
              title="Download as CSV"
            >
              <IoDownloadOutline />
            </button>
          </div>
        </div>

        <div className="sql-table-wrap">
          <table className="sql-table">
            <thead>
              <tr>
                {headers.map((c: string, i: number) => (
                  <th key={i}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((row: any[], ridx: number) => (
                  <tr key={ridx}>
                    {row.map((cell: any, cidx: number) => (
                      <td key={cidx}>{String(cell ?? "")}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="sql-pagination">
            <div className="sql-pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(1)}
              >
                First
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <IoArrowBack />
              </button>
              <span className="sql-page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <IoArrowForward />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                Last
              </button>
            </div>

            <div className="sql-pagesize">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                className="row-select"
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`output-result ${
        isError ? "output-error" : isSuccess ? "output-success" : ""
      }`}
    >
      {statusLine && (
        <div
          className={`output-status ${
            isError ? "status-error" : "status-success"
          }`}
        >
          {statusLine}
        </div>
      )}
      <pre className="output-code">{contentLines}</pre>
    </div>
  );
};

export default OutputDisplay;
