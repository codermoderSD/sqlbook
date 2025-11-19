import { useState, useEffect } from "react";
import {
  IoChevronForward,
  IoChevronDown,
  IoServerOutline,
} from "react-icons/io5";
import type { TableSchema } from "../types/notebook";

interface SchemaExplorerProps {
  schema: TableSchema[];
  onInsertTable: (tableName: string) => void;
}

const SchemaExplorer = ({ schema }: SchemaExplorerProps) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Auto-expand first table
    if (schema.length > 0 && expandedTables.size === 0) {
      setExpandedTables(new Set([schema[0].name]));
    }
  }, [schema]);

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  return (
    <div className="schema-explorer">
      <div className="schema-header">
        <div className="schema-title">
          <IoServerOutline />
          <h3>Schema</h3>
        </div>
      </div>

      <div className="schema-content">
        {schema.length === 0 ? (
          <div className="schema-empty">
            <IoServerOutline className="empty-icon" />
            <p>No tables yet</p>
          </div>
        ) : (
          <div className="schema-tables">
            {schema.map((table) => (
              <div key={table.name} className="schema-table">
                <div
                  className="schema-table-header"
                  onClick={() => toggleTable(table.name)}
                >
                  <span className="schema-expand-icon">
                    {expandedTables.has(table.name) ? (
                      <IoChevronDown />
                    ) : (
                      <IoChevronForward />
                    )}
                  </span>
                  <span className="schema-table-name">{table.name}</span>
                </div>

                {expandedTables.has(table.name) && (
                  <div className="schema-columns">
                    {table.columns.map((col) => (
                      <div key={col.name} className="schema-column">
                        <span className="schema-column-name">{col.name}</span>
                        <span className="schema-column-type">{col.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
