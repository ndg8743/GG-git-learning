import React, { useState, useEffect, useRef } from 'react';

/**
 * A specialized component for visualizing AVL trees
 * This provides an interactive representation of how AVL trees work with balancing
 */
const AVLTreeVisualization = ({ data, width = 800, height = 500 }) => {
  const [tree, setTree] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [animationStep, setAnimationStep] = useState(null);
  const [showRotationInfo, setShowRotationInfo] = useState(false);
  const svgRef = useRef(null);

  // AVL Tree Node class
  class AVLNode {
    constructor(key) {
      this.key = key;
      this.height = 1;
      this.left = null;
      this.right = null;
      this.x = 0;
      this.y = 0;
      this.balanceFactor = 0;
    }
  }

  // AVL Tree implementation
  class AVLTree {
    constructor() {
      this.root = null;
    }

    // Get height of a node
    height(node) {
      return node ? node.height : 0;
    }

    // Calculate balance factor
    getBalanceFactor(node) {
      return node ? this.height(node.right) - this.height(node.left) : 0;
    }

    // Update height of a node
    updateHeight(node) {
      if (!node) return;
      node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
      node.balanceFactor = this.getBalanceFactor(node);
    }

    // Right rotation
    rotateRight(y) {
      const x = y.left;
      const T2 = x.right;

      // Perform rotation
      x.right = y;
      y.left = T2;

      // Update heights
      this.updateHeight(y);
      this.updateHeight(x);

      // Return new root
      return x;
    }

    // Left rotation
    rotateLeft(x) {
      const y = x.right;
      const T2 = y.left;

      // Perform rotation
      y.left = x;
      x.right = T2;

      // Update heights
      this.updateHeight(x);
      this.updateHeight(y);

      // Return new root
      return y;
    }

    // Insert a key into the tree
    insert(key) {
      this.root = this._insert(this.root, key);
      return this.root;
    }

    // Helper method for insertion
    _insert(node, key) {
      // Standard BST insert
      if (!node) return new AVLNode(key);

      if (key < node.key)
        node.left = this._insert(node.left, key);
      else if (key > node.key)
        node.right = this._insert(node.right, key);
      else // Duplicate keys not allowed
        return node;

      // Update height of current node
      this.updateHeight(node);

      // Get the balance factor
      const balance = this.getBalanceFactor(node);

      // Left Left Case
      if (balance < -1 && key < node.left.key) {
        setMessage(`Left Left Case: Right rotation at ${node.key}`);
        setShowRotationInfo(true);
        return this.rotateRight(node);
      }

      // Right Right Case
      if (balance > 1 && key > node.right.key) {
        setMessage(`Right Right Case: Left rotation at ${node.key}`);
        setShowRotationInfo(true);
        return this.rotateLeft(node);
      }

      // Left Right Case
      if (balance < -1 && key > node.left.key) {
        setMessage(`Left Right Case: Left rotation at ${node.left.key}, then Right rotation at ${node.key}`);
        setShowRotationInfo(true);
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      // Right Left Case
      if (balance > 1 && key < node.right.key) {
        setMessage(`Right Left Case: Right rotation at ${node.right.key}, then Left rotation at ${node.key}`);
        setShowRotationInfo(true);
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      // Return the unchanged node
      return node;
    }

    // Calculate positions for visualization
    calculatePositions() {
      const nodeSpacing = 60;
      const levelHeight = 80;
      
      // Helper function to calculate positions recursively
      const calculateNodePositions = (node, level, leftPos, rightPos) => {
        if (!node) return;
        
        const x = (leftPos + rightPos) / 2;
        const y = level * levelHeight;
        
        node.x = x;
        node.y = y;
        
        // Calculate positions for children
        const nextLevel = level + 1;
        const gap = Math.max(20, (rightPos - leftPos) / 4);
        
        if (node.left) {
          calculateNodePositions(node.left, nextLevel, leftPos, x - gap);
        }
        
        if (node.right) {
          calculateNodePositions(node.right, nextLevel, x + gap, rightPos);
        }
      };
      
      if (this.root) {
        calculateNodePositions(this.root, 1, 0, width);
      }
    }
  }

  // Initialize tree
  useEffect(() => {
    setTree(new AVLTree());
  }, []);

  // Insert a value into the tree
  const insertValue = () => {
    if (!inputValue.trim() || isNaN(parseInt(inputValue))) {
      setMessage('Please enter a valid number');
      return;
    }
    
    const value = parseInt(inputValue);
    
    if (tree) {
      tree.insert(value);
      tree.calculatePositions();
      setTree({ ...tree }); // Force re-render
      setInputValue('');
      setMessage(`Inserted ${value} into the AVL tree`);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setShowRotationInfo(false);
      }, 3000);
    }
  };

  // Reset the tree
  const resetTree = () => {
    setTree(new AVLTree());
    setMessage('Tree reset');
    setInputValue('');
    setShowRotationInfo(false);
  };

  // Add sample data
  const addSampleData = () => {
    if (tree) {
      const sampleValues = [10, 5, 15, 3, 7, 12, 17, 1, 4, 6, 8, 11, 13, 16, 20];
      
      // Reset tree first
      const newTree = new AVLTree();
      
      // Insert values one by one
      sampleValues.forEach(value => {
        newTree.insert(value);
      });
      
      newTree.calculatePositions();
      setTree(newTree);
      setMessage('Sample data added');
      setShowRotationInfo(false);
    }
  };

  // Render tree nodes and edges
  const renderTree = () => {
    if (!tree || !tree.root) return null;
    
    const nodes = [];
    const edges = [];
    
    // Helper function to traverse the tree
    const traverseTree = (node) => {
      if (!node) return;
      
      // Add node
      nodes.push(
        <g key={`node-${node.key}`} transform={`translate(${node.x}, ${node.y})`}>
          <circle 
            r="20" 
            fill={Math.abs(node.balanceFactor) > 1 ? '#dc3545' : '#28a745'} 
            stroke="#333" 
            strokeWidth="2"
          />
          <text 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="white" 
            fontWeight="bold"
          >
            {node.key}
          </text>
          <text 
            textAnchor="middle" 
            dominantBaseline="middle" 
            y="35" 
            fill="#666" 
            fontSize="12"
          >
            BF: {node.balanceFactor}
          </text>
        </g>
      );
      
      // Add edges to children
      if (node.left) {
        edges.push(
          <line 
            key={`edge-${node.key}-${node.left.key}`} 
            x1={node.x} 
            y1={node.y} 
            x2={node.left.x} 
            y2={node.left.y} 
            stroke="#666" 
            strokeWidth="2"
          />
        );
        traverseTree(node.left);
      }
      
      if (node.right) {
        edges.push(
          <line 
            key={`edge-${node.key}-${node.right.key}`} 
            x1={node.x} 
            y1={node.y} 
            x2={node.right.x} 
            y2={node.right.y} 
            stroke="#666" 
            strokeWidth="2"
          />
        );
        traverseTree(node.right);
      }
    };
    
    traverseTree(tree.root);
    
    return (
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {edges}
        {nodes}
      </svg>
    );
  };

  // Render rotation information
  const renderRotationInfo = () => {
    if (!showRotationInfo) return null;
    
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#cce5ff', 
        border: '1px solid #b8daff', 
        borderRadius: '4px',
        color: '#004085'
      }}>
        <h4>Rotation Performed:</h4>
        <p>{message}</p>
        <div style={{ marginTop: '10px' }}>
          <h5>Rotation Types:</h5>
          <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
            <li><strong>Left Rotation:</strong> Used when right subtree is higher (balance factor &gt; 1)</li>
            <li><strong>Right Rotation:</strong> Used when left subtree is higher (balance factor &lt; -1)</li>
            <li><strong>Left-Right Rotation:</strong> Left rotation on left child, then right rotation on node</li>
            <li><strong>Right-Left Rotation:</strong> Right rotation on right child, then left rotation on node</li>
          </ul>
        </div>
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
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Interactive AVL Tree</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a number..."
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: '1px solid #ccc' 
          }}
        />
        <button 
          onClick={insertValue}
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
        <button 
          onClick={resetTree}
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
            backgroundColor: '#0366d6', 
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
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px',
          color: '#155724'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        overflow: 'auto',
        marginBottom: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        {renderTree()}
      </div>
      
      {renderRotationInfo()}
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h4>How AVL Trees Work:</h4>
        <p>
          AVL trees are self-balancing binary search trees where the height difference between left and right
          subtrees (the balance factor) is at most 1 for every node. When an insertion or deletion would violate
          this property, the tree performs rotations to restore balance.
        </p>
        <p>
          Git uses AVL trees and similar balanced tree structures to efficiently store and retrieve objects,
          particularly for operations that require fast lookups and ordered traversals.
        </p>
        <div style={{ marginTop: '10px' }}>
          <h5>Balance Factor = Height(Right Subtree) - Height(Left Subtree)</h5>
          <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
            <li>Balance Factor &gt; 1: Right subtree is higher (needs left rotation)</li>
            <li>Balance Factor &lt; -1: Left subtree is higher (needs right rotation)</li>
            <li>-1 ≤ Balance Factor ≤ 1: Node is balanced</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AVLTreeVisualization;
