import type { Cell } from "../types/notebook";

const STORAGE_KEY_CELLS = "sqlnotebook_cells";
const STORAGE_KEY_DB = "sqlnotebook_database";

export function saveCellsToLocalStorage(cells: Cell[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CELLS, JSON.stringify(cells));
  } catch (error) {
    console.error("Failed to save cells to localStorage:", error);
  }
}

export function loadCellsFromLocalStorage(): Cell[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CELLS);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load cells from localStorage:", error);
    return null;
  }
}

export function saveDatabaseToLocalStorage(db: any): void {
  try {
    const data = db.export();
    const dataArray = Array.from(data);
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dataArray));
  } catch (error) {
    console.error("Failed to save database to localStorage:", error);
  }
}

export function loadDatabaseFromLocalStorage(): number[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DB);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load database from localStorage:", error);
    return null;
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CELLS);
    localStorage.removeItem(STORAGE_KEY_DB);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

export function exportDatabaseAsSQL(db: any): string {
  try {
    // Get all table names
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    if (!tables.length) return "-- No tables found";

    let sqlDump = "-- SQLNotebook Database Export\n";
    sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;

    const tableNames = tables[0].values.map((row: any) => row[0]);

    tableNames.forEach((tableName: string) => {
      // Get CREATE TABLE statement
      const createStmt = db.exec(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`
      );
      if (createStmt.length > 0) {
        sqlDump += `${createStmt[0].values[0][0]};\n\n`;
      }

      // Get all data
      const data = db.exec(`SELECT * FROM ${tableName}`);
      if (data.length > 0 && data[0].values.length > 0) {
        const columns = data[0].columns.join(", ");
        data[0].values.forEach((row: any[]) => {
          const values = row
            .map((val) => {
              if (val === null) return "NULL";
              if (typeof val === "number") return val;
              return `'${String(val).replace(/'/g, "''")}'`;
            })
            .join(", ");
          sqlDump += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
        });
        sqlDump += "\n";
      }
    });

    return sqlDump;
  } catch (error) {
    console.error("Failed to export database as SQL:", error);
    return "-- Export failed";
  }
}
