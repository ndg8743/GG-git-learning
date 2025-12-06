import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/LearningJourney.css';
import { layoutTreeSubtree } from '../utils/layoutTree';

// Category color constants
const CATEGORY_COLORS = {
  basics: '#0366d6',      // Blue
  internals: '#28a745',   // Green
  collaboration: '#fd7e14', // Orange
  advanced: '#dc3545',    // Red
};

/**
 * Determine the category of a module based on its ID
 */
function getModuleCategory(moduleId) {
  if (moduleId.includes('internals') || moduleId.includes('performance') || moduleId.includes('bisect')) {
    return 'internals';
  }
  if (moduleId.includes('rebasing') || moduleId.includes('submodules') || moduleId.includes('custom') || moduleId.includes('advanced-branching') || moduleId.includes('hooks') || moduleId.includes('security')) {
    return 'advanced';
  }
  if (moduleId.includes('remote') || moduleId.includes('collaboration')) {
    return 'collaboration';
  }
  return 'basics';
}

/**
 * Get border color based on module category
 */
function getCategoryColor(moduleId) {
  const category = getModuleCategory(moduleId);
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.basics;
}

/**
 * Legend Component - displays category colors in a clean, aligned row
 */
const GraphLegend = () => {
  const legendItems = [
    { label: 'Basics', color: CATEGORY_COLORS.basics },
    { label: 'Internals', color: CATEGORY_COLORS.internals },
    { label: 'Collaboration', color: CATEGORY_COLORS.collaboration },
    { label: 'Advanced', color: CATEGORY_COLORS.advanced },
  ];

  return (
    <div className="graph-legend">
      {legendItems.map(({ label, color }) => (
        <div key={label} className="legend-item">
          <span 
            className="legend-color" 
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="legend-label">{label}</span>
        </div>
      ))}
    </div>
  );
};

const LearningJourney = ({ modules, connections }) => {
  const navigate = useNavigate();
  const reactFlowInstance = useRef(null);

  // Convert modules to ReactFlow nodes (without positions yet)
  const rawNodes = useMemo(() => {
    if (!modules || modules.length === 0) return [];
    
    return modules.map((module) => {
      const borderColor = getCategoryColor(module.id);

      return {
        id: module.id,
        type: 'default',
        position: { x: 0, y: 0 }, // Will be set by layout
        data: {
          label: (
            <div className="module-node-content">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          ),
          module,
          tooltip: `${module.title}: ${module.description}. Prerequisites: ${module.prerequisites?.length ? module.prerequisites.join(', ') : 'None'}`
        },
        style: {
          background: 'var(--card-bg, #ffffff)',
          border: `4px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '12px',
          width: 220,
          cursor: 'pointer',
          boxShadow: '0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.1))',
          transition: 'all 0.2s ease',
        },
        className: 'animated-node',
      };
    });
  }, [modules]);

  // Convert connections to ReactFlow edges
  const rawEdges = useMemo(() => {
    if (!connections || connections.length === 0) return [];
    
    return connections.map((connection, index) => {
      // Determine if this is a cross-track connection
      const sourceCategory = getModuleCategory(connection.source);
      const targetCategory = getModuleCategory(connection.target);
      const isCrossTrack = sourceCategory !== targetCategory;

      return {
        id: `e${index}-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: isCrossTrack ? 'var(--secondary-color, #6c757d)' : 'var(--primary-color, #0366d6)',
          strokeWidth: isCrossTrack ? 1.5 : 2,
          strokeDasharray: isCrossTrack ? '5,5' : undefined,
        },
        labelStyle: { fill: 'var(--text-color, #888)', fontSize: 11 },
        label: isCrossTrack ? 'optional' : undefined,
      };
    });
  }, [connections]);

  // Apply tree layout to nodes
  const layoutedNodes = useMemo(() => {
    if (rawNodes.length === 0 || rawEdges.length === 0) return rawNodes;
    
    // Convert edges to the format expected by layoutTree
    const edgesForLayout = rawEdges.map(e => ({
      source: e.source,
      target: e.target
    }));
    
    return layoutTreeSubtree(rawNodes, edgesForLayout, {
      nodeWidth: 220,
      nodeHeight: 110,
      horizontalSpacing: 50,
      verticalSpacing: 120,
    });
  }, [rawNodes, rawEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges);

  // Update nodes when layout changes
  useEffect(() => {
    if (layoutedNodes.length > 0) {
      setNodes(layoutedNodes);
    }
  }, [layoutedNodes, setNodes]);

  // Update edges when connections change
  useEffect(() => {
    if (rawEdges.length > 0) {
      setEdges(rawEdges);
    }
  }, [rawEdges, setEdges]);

  // Handle node click to navigate to module content
  const onNodeClick = useCallback((event, node) => {
    navigate(`/module/${node.id}`);
  }, [navigate]);

  // Fit view when ReactFlow instance is ready
  const onInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
    
    // Delay fitView slightly to ensure all nodes are rendered
    setTimeout(() => {
      instance.fitView({ 
        padding: 0.15,
        duration: 500,
        maxZoom: 1,
      });
    }, 100);
  }, []);

  // Add tooltips to nodes after they're rendered
  useEffect(() => {
    const nodeElements = document.querySelectorAll('.react-flow__node');
    nodeElements.forEach(el => {
      const nodeId = el.getAttribute('data-id');
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.data?.tooltip) {
        el.setAttribute('title', node.data.tooltip);
      }
    });
  }, [nodes]);

  if (!modules || modules.length === 0) {
    return (
      <div className="learning-journey">
        <div className="loading-container">
          <p>Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-journey">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={onInit}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-right"
        nodesDraggable={true}
        fitView
        fitViewOptions={{ 
          padding: 0.15,
          maxZoom: 1,
        }}
      >
        <Background 
          color="var(--border-color, #e0e0e0)" 
          gap={20} 
          size={1}
        />
        <Controls 
          showInteractive={false}
          position="top-right"
        />
      </ReactFlow>
      <GraphLegend />
    </div>
  );
};

export default LearningJourney;
