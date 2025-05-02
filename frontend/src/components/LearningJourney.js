import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const LearningJourney = ({ modules, connections }) => {
  const navigate = useNavigate();

  // Convert modules to ReactFlow nodes
  const initialNodes = useMemo(() => {
    return modules.map((module) => ({
      id: module.id,
      position: module.position,
      data: { 
        label: (
          <div className="module-node-content">
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </div>
        ),
        module
      },
      style: {
        background: '#ffffff',
        border: '2px solid #0366d6',
        borderRadius: '8px',
        padding: '10px',
        width: 180,
      },
    }));
  }, [modules]);

  // Convert connections to ReactFlow edges
  const initialEdges = useMemo(() => {
    return connections.map((connection, index) => ({
      id: `e${index}`,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#0366d6' },
    }));
  }, [connections]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click to navigate to module content
  const onNodeClick = useCallback((event, node) => {
    navigate(`/module/${node.id}`);
  }, [navigate]);

  return (
    <div className="learning-journey">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#f0f0f0" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default LearningJourney;
