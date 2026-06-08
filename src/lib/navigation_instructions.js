/**
 * Navigation Instructions Generator
 * Converts a path from Dijkstra into human-readable turn-by-turn directions
 */

const DIRECTION_MAP = {
  straight: 'Go straight',
  left: 'Turn left',
  right: 'Turn right',
  'slight left': 'Bear left',
  'slight right': 'Bear right',
  'sharp left': 'Make a sharp left turn',
  'sharp right': 'Make a sharp right turn',
  'u-turn': 'Make a U-turn',
};

const EDGE_DESCRIPTIONS = {
  corridor_to_corridor: 'along the corridor',
  room_to_corridor: 'entering the corridor',
  entry_to_corridor: 'from the entrance',
  corridor_to_intersection: 'to the intersection',
  entry_to_room: 'entering the room',
  room_to_room: 'between rooms',
};

/**
 * Calculate the angle between two vectors
 * Returns angle in degrees (-180 to 180)
 */
function calculateAngle(p1, p2, p3) {
  // Vector from p1 to p2
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  // Vector from p2 to p3
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  // Calculate angles
  const angle1 = Math.atan2(v1.y, v1.x);
  const angle2 = Math.atan2(v2.y, v2.x);
  
  // Difference in angles
  let angle = (angle2 - angle1) * (180 / Math.PI);
  
  // Normalize to -180 to 180
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  
  return angle;
}

/**
 * Determine turn direction from angle
 * (Negated for screen/SVG coords where Y increases downward)
 */
function getTurnDirection(angle) {
  const flipped = -angle; // Fix for screen coords: left/right were reversed from user perspective
  const absAngle = Math.abs(flipped);
  
  if (absAngle < 20) {
    return 'straight';
  } else if (absAngle > 160) {
    return 'u-turn';
  } else if (flipped > 0) {
    // Positive = left turn (from user perspective)
    if (absAngle < 60) return 'slight left';
    if (absAngle < 120) return 'left';
    return 'sharp left';
  } else {
    // Negative = right turn (from user perspective)
    if (absAngle < 60) return 'slight right';
    if (absAngle < 120) return 'right';
    return 'sharp right';
  }
}

/**
 * Calculate distance between two nodes
 */
function calculateDistance(node1, node2) {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate navigation instructions from a path
 * 
 * @param {Array<string>} path - Array of node IDs from Dijkstra
 * @param {Object} nodes - Nodes dataset with coordinates
 * @param {Array} edges - Optional: edges dataset for getting edge types
 * @returns {Array<Object>} Navigation instructions
 */
function generateNavigationInstructions(path, nodes) {
  if (!path || path.length < 2) {
    return [{ action: 'error', message: 'Invalid path' }];
  }
  
  const instructions = [];
  
  // Start instruction
  instructions.push({
    action: 'start',
    location: path[0],
    message: `Starting at ${path[0]}`,
    distance: 0
  });
  
  // Process each segment
  let currentDirection = null;
  let accumulatedDistance = 0;
  let segmentStart = 0;
  
  for (let i = 1; i < path.length; i++) {
    const prevNode = nodes[path[i - 1]];
    const currentNode = nodes[path[i]];
    const segmentDistance = calculateDistance(prevNode, currentNode);
    
    // Determine direction for this segment
    let direction = 'straight';
    if (i < path.length - 1) {
      const nextNode = nodes[path[i + 1]];
      const angle = calculateAngle(prevNode, currentNode, nextNode);
      direction = getTurnDirection(angle);
    }
    
    // If direction changes or last segment, create instruction
    if (direction !== currentDirection || i === path.length - 1) {
      if (currentDirection !== null) {
        // Add instruction for accumulated segment
        const totalDist = accumulatedDistance + (i === path.length - 1 ? segmentDistance : 0);
        
        instructions.push({
          action: currentDirection === 'straight' ? 'continue' : 'turn',
          direction: currentDirection,
          distance: Math.round(totalDist * 100) / 100, // Round to 2 decimals
          distanceInMeters: Math.round(totalDist / 10), // Approximate: 10 units = 1 meter
          from: path[segmentStart],
          to: i === path.length - 1 ? path[i] : path[i - 1],
          firstStepTo: path[segmentStart + 1],
          message: formatInstruction(currentDirection, Math.round(totalDist / 10))
        });
        
        accumulatedDistance = 0;
        segmentStart = i - 1;
      }
      
      currentDirection = direction;
    }
    
    accumulatedDistance += segmentDistance;
  }
  
  // Arrival instruction
  instructions.push({
    action: 'arrive',
    location: path[path.length - 1],
    message: `You have arrived at ${path[path.length - 1]}`,
    distance: 0
  });
  
  return instructions;
}

/**
 * Format instruction message
 */
function formatInstruction(direction, distanceInMeters) {
  const action = DIRECTION_MAP[direction] || 'Continue';
  
  if (distanceInMeters < 1) {
    return `${action}`;
  } else {
    return `${action} for ${distanceInMeters}m`;
  }
}

/**
 * Enhanced version with edge type information
 */
function buildUndirectedEdgeIndex(edges) {
  if (!Array.isArray(edges)) return new Map();
  const index = new Map();
  edges.forEach((e) => {
    const from = e.from_node ?? e.from;
    const to = e.to_node ?? e.to;
    if (!from || !to) return;
    const keyA = `${from}|${to}`;
    const keyB = `${to}|${from}`;
    index.set(keyA, e);
    index.set(keyB, e);
  });
  return index;
}

function generateDetailedNavigationInstructions(path, nodes, edgesOrIndex) {
  const basicInstructions = generateNavigationInstructions(path, nodes);
  const edgeIndex =
    edgesOrIndex instanceof Map ? edgesOrIndex : buildUndirectedEdgeIndex(edgesOrIndex);
  
  // Add edge type information
  return basicInstructions.map((instruction) => {
    if (instruction.action === 'continue' || instruction.action === 'turn') {
      // Find the edge for this segment
      const fromNode = instruction.from;
      const toNode = instruction.firstStepTo || instruction.to;
      
      if (edgeIndex && fromNode && toNode) {
        const edge = edgeIndex.get(`${fromNode}|${toNode}`);
        
        if (edge) {
          instruction.edgeType = edge.type;
          instruction.landmark = getEdgeDescription(edge.type, fromNode, toNode);
        }
      }
    }
    
    return instruction;
  });
}

/**
 * Get human-readable edge description
 */
function getEdgeDescription(edgeType, fromNode, toNode) {
  void fromNode;
  void toNode;
  return EDGE_DESCRIPTIONS[edgeType] || '';
}

export {
  buildUndirectedEdgeIndex,
  generateDetailedNavigationInstructions,
};
