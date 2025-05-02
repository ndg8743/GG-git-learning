import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

/**
 * A specialized component for visualizing AVL trees
 * This provides an interactive representation of how AVL trees work with balancing
 * Includes zoom and pan functionality for better interaction
 */
const AVLTreeVisualization = ({ data, width = 900, height = 600 }) => {
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
      const nodeSpacing = 80; // Increased from 60
      const levelHeight = 100; // Increased from 80
      
      // Helper function to calculate positions recursively
      const calculateNodePositions = (node, level, leftPos, rightPos) => {
        if (!node) return;
        
        const x = (leftPos + rightPos) / 2;
        const y = level * levelHeight;
        
        node.x = x;
        node.y = y;
        
        // Calculate positions for children
        const nextLevel = level + 1;
        const gap = Math.max(30, (rightPos - leftPos) / 3); // Increased gap
        
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
      // Create a new tree instance to properly trigger React's state update
      const newTree = new AVLTree();
      // Copy the existing root if it exists
      if (tree.root) {
        newTree.root = tree.root;
      }
      // Insert the new value
      newTree.insert(value);
      newTree.calculatePositions();
      setTree(newTree); // Set the new tree instance
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
      
      // Create a new tree
      const newTree = new AVLTree();
      
      // Insert values one by one
      sampleValues.forEach(value => {
        // Insert each value using the tree's internal insert method
        newTree.root = newTree._insert(newTree.root, value);
      });
      
      // Calculate positions for visualization
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
        <g key={`node-${node.key}`} transform={`translate(${node.x}, ${node.y})`} className="avl-node">
          <circle 
            r="25" 
            fill={Math.abs(node.balanceFactor) > 1 ? 'var(--danger-color)' : 'var(--success-color)'} 
            stroke="var(--border-color)" 
            strokeWidth="2"
          />
          <text 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="white" 
            fontWeight="bold"
            fontSize="14"
          >
            {node.key}
          </text>
          <text 
            textAnchor="middle" 
            dominantBaseline="middle" 
            y="40" 
            fill="var(--secondary-color)" 
            fontSize="12"
            fontWeight="bold"
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
            stroke="var(--secondary-color)" 
            strokeWidth="2"
            className="avl-edge"
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
            stroke="var(--secondary-color)" 
            strokeWidth="2"
            className="avl-edge"
          />
        );
        traverseTree(node.right);
      }
    };
    
    traverseTree(tree.root);
    
    // Calculate SVG dimensions based on tree size
    let maxWidth = width;
    let maxHeight = height;
    
    // Make sure we have enough space for all nodes
    if (tree.root) {
      const calculateDimensions = (node, maxX = 0, maxY = 0) => {
        if (!node) return { maxX, maxY };
        maxX = Math.max(maxX, node.x + 100);
        maxY = Math.max(maxY, node.y + 100);
        
        if (node.left) {
          const leftDims = calculateDimensions(node.left, maxX, maxY);
          maxX = Math.max(maxX, leftDims.maxX);
          maxY = Math.max(maxY, leftDims.maxY);
        }
        
        if (node.right) {
          const rightDims = calculateDimensions(node.right, maxX, maxY);
          maxX = Math.max(maxX, rightDims.maxX);
          maxY = Math.max(maxY, rightDims.maxY);
        }
        
        return { maxX, maxY };
      };
      
      const { maxX, maxY } = calculateDimensions(tree.root);
      maxWidth = Math.max(width, maxX);
      maxHeight = Math.max(height, maxY);
    }
    
    return (
      <svg 
        ref={svgRef} 
        width={maxWidth} 
        height={maxHeight} 
        viewBox={`0 0 ${maxWidth} ${maxHeight}`}
        style={{ overflow: 'visible' }} // Allow content outside SVG bounds
      >
        <g className="svg-content">
          {edges}
          {nodes}
        </g>
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
        backgroundColor: 'var(--primary-color)',
        opacity: 0.15,
        border: `1px solid var(--primary-color)`, 
        borderRadius: '4px',
        color: 'var(--text-color)'
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
      border: '1px solid var(--border-color)', 
      borderRadius: '5px', 
      padding: '20px',
      maxWidth: width,
      margin: '0 auto',
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-color)'
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
            border: `1px solid var(--border-color)`,
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)'
          }}
        />
        <button 
          onClick={insertValue}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'var(--success-color)', 
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
            backgroundColor: 'var(--secondary-color)', 
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
            backgroundColor: 'var(--primary-color)', 
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
          backgroundColor: 'var(--success-color)',
          opacity: 0.2,
          border: `1px solid var(--success-color)`, 
          borderRadius: '4px',
          color: 'var(--text-color)'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ 
        border: '1px solid var(--border-color)', 
        borderRadius: '4px', 
        overflow: 'hidden', // Changed to hidden to avoid double scrollbars
        marginBottom: '20px',
        backgroundColor: 'var(--card-bg)',
        minHeight: '400px',
        boxShadow: '0 2px 5px var(--shadow-color)',
        position: 'relative' // Added for positioning zoom controls
      }}>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 5,
          padding: '5px 10px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <span>🖱️ Click and drag to move, scroll to zoom</span>
        </div>
        <TransformWrapper
          initialScale={1}
          minScale={0.3}
          maxScale={3}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          panning={{ activationKeys: [] }} // Remove Space key requirement, allow direct panning
          doubleClick={{ disabled: false, mode: 'reset' }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 10,
                display: 'flex',
                gap: '5px'
              }} className="zoom-controls">
                <button 
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Zoom In"
                  onClick={() => zoomIn()}
                >
                  +
                </button>
                <button 
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Zoom Out"
                  onClick={() => zoomOut()}
                >
                  -
                </button>
                <button 
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--secondary-color)',
                    color: 'white',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Reset View"
                  onClick={() => resetTransform()}
                >
                  ↺
                </button>
              </div>
              <TransformComponent wrapperStyle={{ width: '100%', height: '400px' }}>
                {renderTree()}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
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
