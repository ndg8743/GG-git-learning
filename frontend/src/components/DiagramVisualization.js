import React from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';

const DiagramVisualization = ({ data }) => {
  // Transform the data.nodes and data.edges into the format expected by ReactFlow
  const initialNodes = data.nodes.map((node, index) => ({
    id: node.id || `node-${index}`,
    data: { label: node.label || `Node ${index}` },
    position: node.position || { x: 100 + index * 150, y: 100 + (index % 3) * 100 },
    style: {
      background: '#fff',
      border: '1px solid #0366d6',
      borderRadius: '5px',
      padding: '10px',
      width: 150,
      textAlign: 'center',
      fontSize: '12px',
    }
  }));

  const initialEdges = data.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.label || '',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#0366d6' },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: 400, border: '1px solid #ddd', borderRadius: '5px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default DiagramVisualization;
