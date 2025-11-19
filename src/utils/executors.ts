// @ts-ignore
let pyodideInstance: any = null;

export const initPyodide = async () => {
  if (!pyodideInstance) {
    // @ts-ignore
    const { loadPyodide } = await import("pyodide");
    pyodideInstance = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/",
    });
  }
  return pyodideInstance;
};

export const executePython = async (
  code: string
): Promise<{ output: string; error: string | null }> => {
  try {
    const pyodide = await initPyodide();

    let output = "";

    try {
      pyodide.runPython(code);
      output = pyodide.runPython("sys.stdout.getvalue()");
      const errors = pyodide.runPython("sys.stderr.getvalue()");

      return {
        output: output || "Execution completed successfully.",
        error: errors || null,
      };
    } catch (err: any) {
      return {
        output: "",
        error: err.message,
      };
    }
  } catch (err: any) {
    return {
      output: "",
      error: `Failed to initialize Pyodide: ${err.message}`,
    };
  }
};

export const executeJavaScript = (
  code: string
): { output: string; error: string | null } => {
  try {
    const originalLog = console.log;
    const originalError = console.error;
    let output = "";
    let errors = "";

    // Override console methods
    console.log = (...args) => {
      output +=
        args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(" ") + "\n";
    };

    console.error = (...args) => {
      errors += args.join(" ") + "\n";
    };

    try {
      const result = eval(code);
      if (result !== undefined) {
        output += String(result) + "\n";
      }

      // Restore console methods
      console.log = originalLog;
      console.error = originalError;

      return {
        output: output || "Execution completed successfully.",
        error: errors || null,
      };
    } catch (err: any) {
      console.log = originalLog;
      console.error = originalError;

      return {
        output: "",
        error: err.message || "Execution error",
      };
    }
  } catch (err: any) {
    return {
      output: "",
      error: err.message || "Unexpected error",
    };
  }
};

export const executeSQL = async (
  code: string
): Promise<{
  output: string;
  error: string | null;
  results?: Array<{ columns: string[]; values: any[][] }>;
}> => {
  try {
    // @ts-ignore
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    const db = new SQL.Database();

    try {
      const results = db.exec(code);

      if (results.length === 0) {
        return {
          output: "Query executed successfully. No results to display.",
          error: null,
        };
      }

      let output = "";
      results.forEach((result: any, idx: number) => {
        if (idx > 0) output += "\n\n";

        // Format as table
        const { columns, values } = result;

        // Calculate column widths
        const widths = columns.map((col: string, i: number) => {
          const maxValueWidth = Math.max(
            ...values.map((row: any[]) => String(row[i] || "").length)
          );
          return Math.max(col.length, maxValueWidth);
        });

        // Header
        output +=
          columns
            .map((col: string, i: number) => col.padEnd(widths[i]))
            .join(" | ") + "\n";
        output += widths.map((w: number) => "-".repeat(w)).join("-+-") + "\n";

        // Rows
        values.forEach((row: any[]) => {
          output +=
            row
              .map((val: any, i: number) => String(val || "").padEnd(widths[i]))
              .join(" | ") + "\n";
        });

        output += `\n(${values.length} row${values.length !== 1 ? "s" : ""})`;
      });

      const resultsData = results.map((r: any) => ({
        columns: r.columns,
        values: r.values,
      }));

      db.close();
      return { output, error: null, results: resultsData };
    } catch (err: any) {
      db.close();
      return {
        output: "",
        error: err.message || "SQL execution error",
      };
    }
  } catch (err: any) {
    return {
      output: "",
      error: `Failed to initialize SQL.js: ${err.message}`,
    };
  }
};
