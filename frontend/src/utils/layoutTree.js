/**
 * Tree Layout Utility for React Flow
 * 
 * Positions nodes in a clean, centered, top-down tree structure
 * based on their connections (edges).
 */

/**
 * Calculate the depth (level) of each node in the tree
 * @param {Array} nodes - Array of node objects with id
 * @param {Array} edges - Array of edge objects with source and target
 * @returns {Map} Map of nodeId -> depth
 */
function calculateNodeDepths(nodes, edges) {
  const nodeIds = new Set(nodes.map(n => n.id));
  const depths = new Map();
  const children = new Map(); // parent -> [children]
  const parents = new Map();  // child -> [parents]
  
  // Build adjacency lists
  nodes.forEach(node => {
    children.set(node.id, []);
    parents.set(node.id, []);
  });
  
  edges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      children.get(edge.source).push(edge.target);
      parents.get(edge.target).push(edge.source);
    }
  });
  
  // Find root nodes (nodes with no parents)
  const roots = nodes.filter(node => parents.get(node.id).length === 0);
  
  // BFS to assign depths
  const queue = roots.map(root => ({ id: root.id, depth: 0 }));
  const visited = new Set();
  
  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    
    if (visited.has(id)) {
      // Update depth if we found a longer path (for DAGs)
      depths.set(id, Math.max(depths.get(id) || 0, depth));
      continue;
    }
    
    visited.add(id);
    depths.set(id, depth);
    
    children.get(id).forEach(childId => {
      queue.push({ id: childId, depth: depth + 1 });
    });
  }
  
  // Handle any disconnected nodes
  nodes.forEach(node => {
    if (!depths.has(node.id)) {
      depths.set(node.id, 0);
    }
  });
  
  return depths;
}

/**
 * Group nodes by their depth level
 * @param {Array} nodes - Array of node objects
 * @param {Map} depths - Map of nodeId -> depth
 * @returns {Map} Map of depth -> [nodes]
 */
function groupNodesByDepth(nodes, depths) {
  const groups = new Map();
  
  nodes.forEach(node => {
    const depth = depths.get(node.id);
    if (!groups.has(depth)) {
      groups.set(depth, []);
    }
    groups.get(depth).push(node);
  });
  
  return groups;
}

/**
 * Sort nodes within each level for consistent ordering
 * Uses prerequisites to maintain logical left-to-right order
 * @param {Array} nodes - Nodes at a single depth level
 * @param {Array} edges - All edges
 * @returns {Array} Sorted nodes
 */
function sortNodesAtLevel(nodes, edges) {
  // Create a map of parent positions for sorting
  const parentPositions = new Map();
  
  edges.forEach(edge => {
    if (!parentPositions.has(edge.target)) {
      parentPositions.set(edge.target, []);
    }
    parentPositions.get(edge.target).push(edge.source);
  });
  
  // Sort by: first parent's position, then by id for consistency
  return [...nodes].sort((a, b) => {
    const aParents = parentPositions.get(a.id) || [];
    const bParents = parentPositions.get(b.id) || [];
    
    // If both have parents, compare first parent
    if (aParents.length > 0 && bParents.length > 0) {
      return aParents[0].localeCompare(bParents[0]);
    }
    
    // Nodes without parents come first (roots)
    if (aParents.length === 0 && bParents.length > 0) return -1;
    if (aParents.length > 0 && bParents.length === 0) return 1;
    
    // Fall back to id comparison
    return a.id.localeCompare(b.id);
  });
}

/**
 * Main layout function - positions nodes in a tree structure
 * 
 * @param {Array} nodes - Array of React Flow node objects
 * @param {Array} edges - Array of React Flow edge objects
 * @param {Object} options - Layout options
 * @param {number} options.nodeWidth - Width of each node (default: 220)
 * @param {number} options.nodeHeight - Height of each node (default: 110)
 * @param {number} options.horizontalSpacing - Horizontal gap between nodes (default: 60)
 * @param {number} options.verticalSpacing - Vertical gap between levels (default: 100)
 * @param {number} options.canvasWidth - Total canvas width for centering (default: 1400)
 * @returns {Array} Nodes with updated position properties
 */
export function layoutTree(nodes, edges, options = {}) {
  const {
    nodeWidth = 220,
    nodeHeight = 110,
    horizontalSpacing = 60,
    verticalSpacing = 100,
    canvasWidth = 1400,
  } = options;
  
  if (!nodes || nodes.length === 0) {
    return nodes;
  }
  
  // Calculate depths for all nodes
  const depths = calculateNodeDepths(nodes, edges);
  
  // Group nodes by depth
  const nodesByDepth = groupNodesByDepth(nodes, depths);
  
  // Find the maximum number of nodes at any level (for spacing calculation)
  let maxNodesAtLevel = 0;
  nodesByDepth.forEach(nodesAtLevel => {
    maxNodesAtLevel = Math.max(maxNodesAtLevel, nodesAtLevel.length);
  });
  
  // Calculate positions for each node
  const positionedNodes = nodes.map(node => {
    const depth = depths.get(node.id);
    const nodesAtThisDepth = sortNodesAtLevel(nodesByDepth.get(depth), edges);
    const indexAtDepth = nodesAtThisDepth.findIndex(n => n.id === node.id);
    const countAtDepth = nodesAtThisDepth.length;
    
    // Calculate horizontal position - center the row
    const totalRowWidth = countAtDepth * nodeWidth + (countAtDepth - 1) * horizontalSpacing;
    const startX = (canvasWidth - totalRowWidth) / 2;
    const x = startX + indexAtDepth * (nodeWidth + horizontalSpacing);
    
    // Calculate vertical position
    const y = 50 + depth * (nodeHeight + verticalSpacing);
    
    return {
      ...node,
      position: { x, y }
    };
  });
  
  return positionedNodes;
}

/**
 * Alternative layout that uses subtree width calculation for better spacing
 * Better for trees with varying branch sizes
 */
export function layoutTreeSubtree(nodes, edges, options = {}) {
  const {
    nodeWidth = 220,
    nodeHeight = 110,
    horizontalSpacing = 40,
    verticalSpacing = 100,
  } = options;
  
  if (!nodes || nodes.length === 0) {
    return nodes;
  }
  
  // Build parent-child relationships
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [], parent: null }]));
  
  edges.forEach(edge => {
    const parent = nodeMap.get(edge.source);
    const child = nodeMap.get(edge.target);
    if (parent && child) {
      parent.children.push(child);
      if (!child.parent) {
        child.parent = parent;
      }
    }
  });
  
  // Find roots
  const roots = Array.from(nodeMap.values()).filter(n => !n.parent);
  
  // Calculate subtree widths (post-order traversal)
  function calculateSubtreeWidth(node) {
    if (node.children.length === 0) {
      node.subtreeWidth = nodeWidth;
      return nodeWidth;
    }
    
    const childrenWidth = node.children.reduce((sum, child) => {
      return sum + calculateSubtreeWidth(child) + horizontalSpacing;
    }, -horizontalSpacing); // Remove extra spacing after last child
    
    node.subtreeWidth = Math.max(nodeWidth, childrenWidth);
    return node.subtreeWidth;
  }
  
  // Calculate total width
  let totalWidth = roots.reduce((sum, root) => {
    return sum + calculateSubtreeWidth(root) + horizontalSpacing;
  }, -horizontalSpacing);
  
  // Assign positions (pre-order traversal)
  function assignPositions(node, x, y) {
    // Center node within its subtree width
    node.position = {
      x: x + (node.subtreeWidth - nodeWidth) / 2,
      y: y
    };
    
    // Position children
    let childX = x;
    node.children.forEach(child => {
      assignPositions(child, childX, y + nodeHeight + verticalSpacing);
      childX += child.subtreeWidth + horizontalSpacing;
    });
  }
  
  // Start positioning from centered position
  let startX = 100;
  roots.forEach(root => {
    assignPositions(root, startX, 50);
    startX += root.subtreeWidth + horizontalSpacing;
  });
  
  // Return nodes with positions
  return nodes.map(node => ({
    ...node,
    position: nodeMap.get(node.id).position
  }));
}

export default layoutTree;
