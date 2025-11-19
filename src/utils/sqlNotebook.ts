import type { Cell, TableSchema } from "../types/notebook";

let sqlInstance: any = null;
let currentDb: any = null;

export const initSQL = async () => {
  if (!sqlInstance) {
    // @ts-ignore
    const initSqlJs = (await import("sql.js")).default;
    sqlInstance = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlInstance;
};

export const createDatabase = async (initScript?: string) => {
  const SQL = await initSQL();
  const db = new SQL.Database();

  if (initScript) {
    try {
      db.exec(initScript);
    } catch (err) {
      console.error("Error initializing database:", err);
    }
  }

  currentDb = db;
  return db;
};

export const loadDatabaseFromArray = async (data: number[]) => {
  const SQL = await initSQL();
  const uint8Array = new Uint8Array(data);
  const db = new SQL.Database(uint8Array);
  currentDb = db;
  return db;
};

export const getDatabase = () => currentDb;

export const executeCell = async (
  cell: Cell,
  db: any
): Promise<{
  output: string;
  results?: Array<{ columns: string[]; values: any[][] }>;
  error?: string;
}> => {
  if (!db) {
    return {
      output: "",
      error: "Database not initialized",
    };
  }

  try {
    const results = db.exec(cell.content);

    if (results.length === 0) {
      return {
        output: "Query executed successfully.",
      };
    }

    let output = "";
    results.forEach((result: any, idx: number) => {
      if (idx > 0) output += "\n\n";
      const { values } = result;
      output += `Table ${idx + 1}: ${values.length} row${
        values.length !== 1 ? "s" : ""
      }`;
    });

    const resultsData = results.map((r: any) => ({
      columns: r.columns,
      values: r.values,
    }));

    return { output, results: resultsData };
  } catch (err: any) {
    return {
      output: "",
      error: err.message || "SQL execution error",
    };
  }
};

export const extractSchema = (db: any): TableSchema[] => {
  if (!db) return [];

  try {
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    if (tables.length === 0 || !tables[0].values) return [];

    const schema: TableSchema[] = [];

    tables[0].values.forEach((row: any[]) => {
      const tableName = row[0];
      const columnsResult = db.exec(`PRAGMA table_info(${tableName})`);

      if (columnsResult.length > 0) {
        const columns = columnsResult[0].values.map((col: any[]) => ({
          name: col[1],
          type: col[2],
        }));

        schema.push({
          name: tableName,
          columns,
        });
      }
    });

    return schema;
  } catch (err) {
    console.error("Error extracting schema:", err);
    return [];
  }
};
