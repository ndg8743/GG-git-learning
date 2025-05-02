import React, { useState, useEffect, useRef } from 'react';

/**
 * A specialized component for visualizing Trie data structures
 * This provides an interactive representation of how Tries work for path storage in Git
 */
const TrieVisualization = ({ data, width = 800, height = 500 }) => {
  const [trie, setTrie] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState([]);
  const svgRef = useRef(null);

  // Trie Node class
  class TrieNode {
    constructor(value = '', isEnd = false) {
      this.value = value;
      this.isEnd = isEnd;
      this.children = new Map();
      this.x = 0;
      this.y = 0;
      this.id = Math.random().toString(36).substr(2, 9);
    }
  }

  // Trie implementation
  class Trie {
    constructor() {
      this.root = new TrieNode('root');
    }

    // Insert a path into the trie
    insert(path) {
      const parts = path.split('/').filter(part => part);
      let current = this.root;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current.children.has(part)) {
          current.children.set(part, new TrieNode(part, i === parts.length - 1));
        } else if (i === parts.length - 1) {
          // Mark as end of path if it's the last part
          current.children.get(part).isEnd = true;
        }
        current = current.children.get(part);
      }
    }

    // Search for a path in the trie
    search(path) {
      const parts = path.split('/').filter(part => part);
      let current = this.root;
      const visitedNodes = [current];
      
      for (const part of parts) {
        if (!current.children.has(part)) {
          return { found: false, visitedNodes };
        }
        current = current.children.get(part);
        visitedNodes.push(current);
      }
      
      return { found: current.isEnd, visitedNodes };
    }

    // Get all paths in the trie
    getAllPaths() {
      const paths = [];
      
      const traverse = (node, currentPath) => {
        if (node.isEnd) {
          paths.push(currentPath);
        }
        
        for (const [key, childNode] of node.children) {
          traverse(childNode, currentPath ? `${currentPath}/${key}` : key);
        }
      };
      
      traverse(this.root, '');
      return paths;
    }

    // Calculate positions for visualization
    calculatePositions() {
      const levelHeight = 80;
      const nodeWidth = 100;
      
      // First, count nodes at each level
      const levelCounts = new Map();
      const nodeLevels = new Map();
      
      const countNodesAtLevels = (node, level) => {
        nodeLevels.set(node.id, level);
        
        if (!levelCounts.has(level)) {
          levelCounts.set(level, 0);
        }
        levelCounts.set(level, levelCounts.get(level) + 1);
        
        for (const childNode of node.children.values()) {
          countNodesAtLevels(childNode, level + 1);
        }
      };
      
      countNodesAtLevels(this.root, 0);
      
      // Then, calculate horizontal positions
      const levelPositions = new Map();
      for (const [level, count] of levelCounts.entries()) {
        levelPositions.set(level, new Map());
        const levelWidth = count * nodeWidth;
        const startX = (width - levelWidth) / 2 + nodeWidth / 2;
        levelPositions.get(level).set('nextPosition', startX);
      }
      
      // Assign positions to nodes
      const assignPositions = (node) => {
        const level = nodeLevels.get(node.id);
        const levelPosition = levelPositions.get(level);
        
        node.x = levelPosition.get('nextPosition');
        node.y = level * levelHeight + 50;
        
        levelPosition.set('nextPosition', node.x + nodeWidth);
        
        // Sort children alphabetically for consistent layout
        const sortedChildren = Array.from(node.children.entries())
          .sort((a, b) => a[0].localeCompare(b[0]));
        
        for (const [_, childNode] of sortedChildren) {
          assignPositions(childNode);
        }
      };
      
      assignPositions(this.root);
    }
  }

  // Initialize trie
  useEffect(() => {
    setTrie(new Trie());
  }, []);

  // Insert a path into the trie
  const insertPath = () => {
    if (!inputValue.trim()) {
      setMessage('Please enter a valid path');
      return;
    }
    
    // Normalize path
    const normalizedPath = inputValue.startsWith('/') ? inputValue : `/${inputValue}`;
    
    if (trie) {
      trie.insert(normalizedPath);
      trie.calculatePositions();
      setTrie({ ...trie }); // Force re-render
      setInputValue('');
      setMessage(`Inserted "${normalizedPath}" into the trie`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  // Search for a path in the trie
  const searchPath = () => {
    if (!searchValue.trim()) {
      setMessage('Please enter a valid path to search');
      return;
    }
    
    // Normalize path
    const normalizedPath = searchValue.startsWith('/') ? searchValue : `/${searchValue}`;
    
    if (trie) {
      const result = trie.search(normalizedPath);
      setSearchResult(result);
      setHighlightedPath(result.visitedNodes.map(node => node.id));
      
      if (result.found) {
        setMessage(`Path "${normalizedPath}" found in the trie`);
      } else {
        setMessage(`Path "${normalizedPath}" not found in the trie`);
      }
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedPath([]);
      }, 3000);
    }
  };

  // Reset the trie
  const resetTrie = () => {
    setTrie(new Trie());
    setMessage('Trie reset');
    setInputValue('');
    setSearchValue('');
    setSearchResult(null);
    setHighlightedPath([]);
  };

  // Add sample data
  const addSampleData = () => {
    if (trie) {
      const samplePaths = [
        '/src/main.c',
        '/src/utils/helper.c',
        '/src/utils/string.c',
        '/docs/guide.md',
        '/docs/api/reference.md',
        '/include/header.h',
        '/tests/test_main.c'
      ];
      
      // Reset trie first
      const newTrie = new Trie();
      
      // Insert paths one by one
      samplePaths.forEach(path => {
        newTrie.insert(path);
      });
      
      newTrie.calculatePositions();
      setTrie(newTrie);
      setMessage('Sample paths added');
      setSearchResult(null);
      setHighlightedPath([]);
    }
  };

  // Render trie nodes and edges
  const renderTrie = () => {
    if (!trie || !trie.root) return null;
    
    const nodes = [];
    const edges = [];
    
    // Helper function to traverse the trie
    const traverseTrie = (node, parentX = null, parentY = null) => {
      // Determine node color
      let nodeColor = '#0366d6'; // default blue
      
      if (node.value === 'root') {
        nodeColor = '#28a745'; // green for root
      } else if (node.isEnd) {
        nodeColor = '#dc3545'; // red for end of path
      }
      
      // Highlight node if it's in the search path
      if (highlightedPath.includes(node.id)) {
        nodeColor = '#fd7e14'; // orange for highlighted nodes
      }
      
      // Add node
      nodes.push(
        <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
          <circle 
            r="20" 
            fill={nodeColor} 
            stroke="#333" 
            strokeWidth="2"
          />
          <text 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="white" 
            fontWeight="bold"
            fontSize="12"
          >
            {node.value === 'root' ? 'Root' : node.value}
          </text>
          {node.isEnd && (
            <circle 
              r="5" 
              cx="15" 
              cy="-15" 
              fill="#dc3545" 
              stroke="#333" 
              strokeWidth="1"
            />
          )}
        </g>
      );
      
      // Add edge from parent
      if (parentX !== null && parentY !== null) {
        edges.push(
          <line 
            key={`edge-${parentX}-${parentY}-${node.x}-${node.y}`} 
            x1={parentX} 
            y1={parentY} 
            x2={node.x} 
            y2={node.y} 
            stroke={highlightedPath.includes(node.id) ? '#fd7e14' : '#666'} 
            strokeWidth={highlightedPath.includes(node.id) ? 3 : 2}
          />
        );
      }
      
      // Traverse children
      for (const childNode of node.children.values()) {
        traverseTrie(childNode, node.x, node.y);
      }
    };
    
    traverseTrie(trie.root);
    
    return (
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {edges}
        {nodes}
      </svg>
    );
  };

  // Render the list of all paths
  const renderPathList = () => {
    if (!trie) return null;
    
    const paths = trie.getAllPaths();
    
    if (paths.length === 0) {
      return <p>No paths in the trie yet.</p>;
    }
    
    return (
      <div style={{ marginTop: '20px' }}>
        <h4>Paths in the Trie:</h4>
        <ul style={{ 
          listStyle: 'none', 
          padding: '0', 
          maxHeight: '150px', 
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '10px'
        }}>
          {paths.map((path, index) => (
            <li 
              key={index}
              style={{ 
                padding: '5px 10px',
                borderBottom: index < paths.length - 1 ? '1px solid #eee' : 'none',
                color: searchResult && searchResult.found && `/${path}` === (searchValue.startsWith('/') ? searchValue : `/${searchValue}`) ? '#28a745' : '#333'
              }}
            >
              /{path}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '5px', 
      padding: '20px',
      maxWidth: width,
      margin: '0 auto'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Interactive Trie for Path Storage</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a path (e.g., /src/main.c)..."
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: '1px solid #ccc' 
          }}
        />
        <button 
          onClick={insertPath}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Insert
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={searchValue} 
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for a path..."
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: '1px solid #ccc' 
          }}
        />
        <button 
          onClick={searchPath}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#0366d6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={resetTrie}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <button 
          onClick={addSampleData}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sample Data
        </button>
      </div>
      
      {message && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: searchResult && !searchResult.found ? '#f8d7da' : '#d4edda', 
          border: `1px solid ${searchResult && !searchResult.found ? '#f5c6cb' : '#c3e6cb'}`, 
          borderRadius: '4px',
          color: searchResult && !searchResult.found ? '#721c24' : '#155724'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        overflow: 'auto',
        marginBottom: '20px',
        backgroundColor: '#f8f9fa',
        height: '300px'
      }}>
        {renderTrie()}
      </div>
      
      {renderPathList()}
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h4>How Tries Work in Git:</h4>
        <p>
          A Trie (pronounced "try") is a tree-like data structure used for storing a dynamic set of strings.
          Git uses a variant of Tries called Patricia Tries (or Radix Trees) to efficiently store and retrieve file paths.
        </p>
        <p>
          In this visualization:
        </p>
        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
          <li><strong>Green node:</strong> Root of the trie</li>
          <li><strong>Blue nodes:</strong> Path components (directories)</li>
          <li><strong>Red nodes/indicators:</strong> End of a path (files)</li>
          <li><strong>Orange highlights:</strong> Search path traversal</li>
        </ul>
        <p>
          Tries provide efficient operations for Git:
        </p>
        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
          <li>Fast path lookups - O(m) where m is the path length</li>
          <li>Prefix matching - finding all files in a directory</li>
          <li>Space efficiency through shared prefixes</li>
        </ul>
      </div>
    </div>
  );
};

export default TrieVisualization;
