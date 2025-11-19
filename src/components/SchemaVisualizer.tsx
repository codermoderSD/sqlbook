import { useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import type { TableSchema } from "../types/notebook";

interface SchemaVisualizerProps {
  schema: TableSchema[];
}

const TableNode = ({ data }: NodeProps) => {
  return (
    <div className="schema-node">
      <div className="schema-node-header">
        <strong>{data.label}</strong>
      </div>
      <div className="schema-node-columns">
        {data.columns.map((col: any, i: number) => (
          <div key={i} className="schema-node-column">
            <span className="col-name">{col.name}</span>
            <span className="col-type">{col.type}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`s-${col.name}`}
              style={{ opacity: 0 }}
            />
            <Handle
              type="target"
              position={Position.Left}
              id={`t-${col.name}`}
              style={{ opacity: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
};

export default function SchemaVisualizer({ schema }: SchemaVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Simple grid layout
    const COL_WIDTH = 250;
    const ROW_HEIGHT = 300;
    const COLS_PER_ROW = 2;

    schema.forEach((table, index) => {
      const col = index % COLS_PER_ROW;
      const row = Math.floor(index / COLS_PER_ROW);

      newNodes.push({
        id: table.name,
        type: "table",
        position: { x: col * COL_WIDTH + 20, y: row * ROW_HEIGHT + 20 },
        data: {
          label: table.name,
          columns: table.columns,
        },
      });

      // Infer relationships (naive: if col name ends in _id and matches another table)
      table.columns.forEach((col) => {
        if (col.name.endsWith("_id")) {
          const targetTable = col.name.replace("_id", "s"); // e.g. user_id -> users
          const targetExists = schema.find((t) => t.name === targetTable);

          if (targetExists && targetTable !== table.name) {
            newEdges.push({
              id: `${table.name}-${col.name}-${targetTable}`,
              source: targetTable,
              target: table.name,
              animated: true,
              style: { stroke: "var(--accent)" },
            });
          }
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [schema, setNodes, setEdges]);

  return (
    <div
      style={{ width: "100%", height: "100%", background: "var(--bg-primary)" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
