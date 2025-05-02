import React, { useEffect, useState, useRef } from 'react';
import BloomFilterVisualization from './visualizations/BloomFilterVisualization';
import AVLTreeVisualization from './visualizations/AVLTreeVisualization';
import TrieVisualization from './visualizations/TrieVisualization';

/**
 * A component that selects the appropriate visualization based on the data structure type
 */
const DiagramVisualization = ({ data, showDebugInfo = true }) => {
  const [visualizationType, setVisualizationType] = useState('generic');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const diagramRef = useRef(null);
  
  // Debug: Log the data received
  useEffect(() => {
    console.log('DiagramVisualization received data:', data);
    
    // Determine the visualization type based on the data
    if (data) {
      if (data.type) {
        setVisualizationType(data.type);
      } else if (data.nodes && data.edges) {
        // Try to infer the type from the data structure
        const nodeLabels = data.nodes.map(node => 
          node.label ? node.label.toString().toLowerCase() : ''
        ).join(' ');
        
        if (nodeLabels.includes('bloom filter') || nodeLabels.includes('bit array') || nodeLabels.includes('hash function')) {
          setVisualizationType('bloom-filter');
        } else if (nodeLabels.includes('avl') || nodeLabels.includes('balance factor') || nodeLabels.includes('rotation')) {
          setVisualizationType('avl-tree');
        } else if (nodeLabels.includes('trie') || nodeLabels.includes('path') || nodeLabels.includes('prefix')) {
          setVisualizationType('trie');
        } else if (nodeLabels.includes('dag') || nodeLabels.includes('commit') || nodeLabels.includes('acyclic')) {
          setVisualizationType('dag');
        } else {
          setVisualizationType('generic');
        }
      }
    }
  }, [data]);

  // Function to generate a simple SVG diagram for generic visualizations
  const generateGenericSVG = () => {
    // Check if data is valid
    if (!data || !data.nodes || !data.edges) {
      console.error('Invalid diagram data:', data);
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#ffeeee', border: '1px solid red', borderRadius: '5px' }}>
          <h3>Error: Invalid Diagram Data</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    }

    const width = 600;
    const height = 400;
    const nodeWidth = 120;
    const nodeHeight = 40;
    
    // Calculate node positions in a grid layout
    const nodes = data.nodes.map((node, index) => {
      // Determine node color based on its role or type
      let color = '#0366d6'; // default blue
      
      if (node.label && typeof node.label === 'string') {
        const label = node.label.toLowerCase();
        if (label.includes('root') || label.includes('tree object')) {
          color = '#28a745'; // green for root/tree nodes
        } else if (label.includes('blob') || label.includes('file')) {
          color = '#fd7e14'; // orange for blob/file nodes
        } else if (label.includes('commit') || label.includes('head')) {
          color = '#dc3545'; // red for commit nodes
        } else if (label.includes('hash') || label.includes('function')) {
          color = '#6f42c1'; // purple for hash functions
        }
      }
      
      // Calculate positions in a grid layout
      let x = 100 + (index % 3) * 150;
      let y = 100 + Math.floor(index / 3) * 100;
      
      // Special positioning for common tree layouts
      if (data.nodes.length === 7) {
        // This is likely a binary tree with 7 nodes (1 root, 2 at level 1, 4 at level 2)
        switch (index) {
          case 0: // Root
            x = 300; y = 50;
            break;
          case 1: // Left child of root
            x = 150; y = 150;
            break;
          case 2: // Right child of root
            x = 450; y = 150;
            break;
          case 3: // Left child of node 1
            x = 75; y = 250;
            break;
          case 4: // Right child of node 1
            x = 225; y = 250;
            break;
          case 5: // Left child of node 2
            x = 375; y = 250;
            break;
          case 6: // Right child of node 2
            x = 525; y = 250;
            break;
          default:
            break;
        }
      } else if (data.nodes.length === 4) {
        // This might be a simple diagram with 4 nodes
        switch (index) {
          case 0:
            x = 150; y = 100;
            break;
          case 1:
            x = 450; y = 100;
            break;
          case 2:
            x = 150; y = 250;
            break;
          case 3:
            x = 450; y = 250;
            break;
          default:
            break;
        }
      } else if (data.nodes.length <= 3) {
        // Simple linear or triangular layout
        switch (index) {
          case 0:
            x = 300; y = 100;
            break;
          case 1:
            x = 150; y = 200;
            break;
          case 2:
            x = 450; y = 200;
            break;
          default:
            break;
        }
      }
      
      return {
        ...node,
        x,
        y,
        color
      };
    });
    
    // Generate SVG elements for nodes
    const nodeElements = nodes.map((node, index) => (
      <g key={`node-${index}`} className="diagram-node" data-id={node.id}>
        <rect
          x={node.x - nodeWidth/2}
          y={node.y - nodeHeight/2}
          width={nodeWidth}
          height={nodeHeight}
          rx="5"
          ry="5"
          fill="var(--card-bg)"
          stroke={node.color}
          strokeWidth="2"
        />
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="var(--text-color)"
        >
          {node.label}
        </text>
        <title>{node.label}</title>
      </g>
    ));
    
    // Generate SVG elements for edges
    const edgeElements = data.edges.map((edge, index) => {
      const sourceNode = nodes.find(n => n.id === edge.from);
      const targetNode = nodes.find(n => n.id === edge.to);
      
      if (!sourceNode || !targetNode) {
        console.error(`Edge ${index} has invalid source or target:`, edge);
        return null;
      }
      
      // Determine edge color based on its label
      let color = '#0366d6'; // default blue
      if (edge.label) {
        const label = edge.label.toLowerCase();
        if (label.includes('left')) {
          color = '#28a745'; // green for left edges
        } else if (label.includes('right')) {
          color = '#fd7e14'; // orange for right edges
        } else if (label.includes('parent') || label.includes('child')) {
          color = '#dc3545'; // red for parent-child relationships
        }
      }
      
      // Calculate line endpoints
      const startX = sourceNode.x;
      const startY = sourceNode.y + nodeHeight/2;
      const endX = targetNode.x;
      const endY = targetNode.y - nodeHeight/2;
      
      return (
        <g key={`edge-${index}`} className="diagram-edge">
          <path
            d={`M ${startX} ${startY} L ${endX} ${endY}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {edge.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 - 10}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-color)"
              backgroundColor="var(--card-bg)"
            >
              {edge.label}
            </text>
          )}
          <title>{edge.label || 'Connection'}</title>
        </g>
      );
    });
    
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#0366d6" />
          </marker>
        </defs>
        {edgeElements}
        {nodeElements}
      </svg>
    );
  };
  
  // Render the appropriate visualization based on the type
  const renderVisualization = () => {
    switch (visualizationType) {
      case 'bloom-filter':
        return <BloomFilterVisualization data={data} />;
      case 'avl-tree':
        return <AVLTreeVisualization data={data} />;
      case 'trie':
        return <TrieVisualization data={data} />;
      case 'generic':
      default:
        return (
          <div style={{ height: 400, overflow: 'auto' }}>
            {generateGenericSVG()}
          </div>
        );
    }
  };
  
  // Add debug information
  const renderDebugInfo = () => {
    return (
      <div style={{ 
        marginTop: '10px', 
        padding: '10px', 
        backgroundColor: 'var(--bg-color)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '4px',
        fontSize: '12px',
        color: 'var(--text-color)'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>Diagram Debug Info</h4>
        <div>
          <strong>Data received:</strong> {data ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Visualization type:</strong> {visualizationType}
        </div>
        {data && (
          <>
            <div>
              <strong>Nodes:</strong> {data.nodes ? data.nodes.length : 0}
            </div>
            <div>
              <strong>Edges:</strong> {data.edges ? data.edges.length : 0}
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Node IDs:</strong> {data.nodes ? data.nodes.map(n => n.id).join(', ') : 'None'}
            </div>
          </>
        )}
      </div>
    );
  };
  
  // Mouse event handlers for dragging - disabled as per user request
  const handleMouseDown = (e) => {
    // Dragging disabled
  };

  const handleMouseMove = (e) => {
    // Dragging disabled
  };

  const handleMouseUp = () => {
    // Dragging disabled
  };

  return (
    <div 
      ref={diagramRef}
      className="custom-diagram" 
      style={{ 
        border: '1px solid var(--border-color)', 
        borderRadius: '5px', 
        overflow: 'auto', 
        padding: '10px',
        cursor: 'default', // Changed from grab since dragging is disabled
        position: 'relative',
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        zIndex: isDragging ? 1000 : 1,
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-color)'
      }}
      onMouseDown={handleMouseDown}
    >
      {renderVisualization()}
      {showDebugInfo && renderDebugInfo()}
    </div>
  );
};

export default DiagramVisualization;
