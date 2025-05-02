import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const LearningJourney = ({ modules, connections }) => {
  const navigate = useNavigate();

  // Group modules by track for better organization
  const groupedModules = useMemo(() => {
    const groups = {
      intro: modules.filter(m => m.id === 'git-intro'),
      basics: modules.filter(m => 
        m.id.includes('fundamentals') || 
        m.id.includes('branching-basics') || 
        m.id.includes('remote-repos') ||
        m.id.includes('collaboration') ||
        m.id.includes('advanced-branching') ||
        m.id.includes('hooks') ||
        m.id.includes('security')
      ),
      internals: modules.filter(m => 
        m.id.includes('internals') || 
        m.id.includes('performance') || 
        m.id.includes('bisect')
      ),
      advanced: modules.filter(m => 
        m.id.includes('rebasing') || 
        m.id.includes('submodules') || 
        m.id.includes('custom-commands')
      )
    };
    return groups;
  }, [modules]);

  // Convert modules to ReactFlow nodes with tooltips
  const initialNodes = useMemo(() => {
    return modules.map((module) => {
      // Determine node color based on category
      let borderColor = '#0366d6'; // default blue
      if (module.id.includes('internals')) {
        borderColor = '#28a745'; // green for internals
      } else if (module.id.includes('advanced') || module.id.includes('rebasing') || module.id.includes('custom')) {
        borderColor = '#dc3545'; // red for advanced
      } else if (module.id.includes('remote') || module.id.includes('collaboration')) {
        borderColor = '#fd7e14'; // orange for collaboration
      }

      // Adjust positions to have more spacing
      const adjustedPosition = {
        x: module.position.x * 2.0, // Increase horizontal spacing by 100%
        y: module.position.y * 1.8  // Increase vertical spacing by 80%
      };

      return {
        id: module.id,
        position: adjustedPosition,
        data: { 
          label: (
            <div className="module-node-content">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          ),
          module,
          tooltip: `${module.title}: ${module.description}. Prerequisites: ${module.prerequisites.length ? module.prerequisites.join(', ') : 'None'}`
        },
        style: {
          background: '#ffffff',
          border: `2px solid ${borderColor}`,
          borderRadius: '8px',
          padding: '10px',
          width: 200, // Slightly wider nodes
        },
      };
    });
  }, [modules]);

  // Convert connections to ReactFlow edges with better styling
  const initialEdges = useMemo(() => {
    return connections.map((connection, index) => {
      // Determine if this is a cross-track connection
      const sourceModule = modules.find(m => m.id === connection.source);
      const targetModule = modules.find(m => m.id === connection.target);
      const isCrossTrack = 
        (sourceModule && targetModule) && 
        ((sourceModule.id.includes('internals') && !targetModule.id.includes('internals')) ||
         (!sourceModule.id.includes('internals') && targetModule.id.includes('internals')));

      return {
        id: `e${index}`,
        source: connection.source,
        target: connection.target,
        type: 'default', // Use default edges instead of straight or smoothstep
        animated: true,
        style: { 
          stroke: isCrossTrack ? '#6c757d' : '#0366d6',
          strokeWidth: isCrossTrack ? 1 : 2,
          strokeDasharray: isCrossTrack ? '5,5' : undefined
        },
        labelStyle: { fill: '#888', fontSize: 12 },
        label: isCrossTrack ? 'optional' : undefined
        // Remove markerEnd to avoid pattern issues
      };
    });
  }, [connections, modules]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click to navigate to module content
  const onNodeClick = useCallback((event, node) => {
    navigate(`/module/${node.id}`);
  }, [navigate]);

  // Add tooltips to nodes after they're rendered
  useEffect(() => {
    const nodeElements = document.querySelectorAll('.react-flow__node');
    nodeElements.forEach(el => {
      const nodeId = el.getAttribute('data-id');
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.data.tooltip) {
        el.setAttribute('title', node.data.tooltip);
      }
    });
  }, [nodes]);

  return (
    <div className="learning-journey">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ zoom: 0.6 }}
        attributionPosition="bottom-right"
        nodesDraggable={true}
      >
        <Background color="#f0f0f0" gap={16} />
        <Controls />
      </ReactFlow>
      <div className="graph-legend">
        <div className="legend-item"><span className="legend-color" style={{backgroundColor: '#0366d6'}}></span> Basics</div>
        <div className="legend-item"><span className="legend-color" style={{backgroundColor: '#28a745'}}></span> Internals</div>
        <div className="legend-item"><span className="legend-color" style={{backgroundColor: '#fd7e14'}}></span> Collaboration</div>
        <div className="legend-item"><span className="legend-color" style={{backgroundColor: '#dc3545'}}></span> Advanced</div>
      </div>
    </div>
  );
};

export default LearningJourney;
