export type CellType = "sql" | "markdown";

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  output?: {
    text: string;
    results?: Array<{ columns: string[]; values: any[][] }>;
    error?: string;
  };
  isExecuting?: boolean;
}

export interface NotebookState {
  cells: Cell[];
  currentDatabase: any; // SQL.js Database instance
  schema: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
}
