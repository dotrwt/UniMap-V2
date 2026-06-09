// src/lib/navigation_instructions.ts
import type { MapNode, MapEdge } from '@/types';

const DIRECTION_MAP: Record<string, string> = {
  straight: 'Go straight',
  left: 'Turn left',
  right: 'Turn right',
  'slight left': 'Bear left',
  'slight right': 'Bear right',
  'sharp left': 'Make a sharp left turn',
  'sharp right': 'Make a sharp right turn',
  'u-turn': 'Make a U-turn',
};

const EDGE_DESCRIPTIONS: Record<string, string> = {
  corridor_to_corridor: 'along the corridor',
  room_to_corridor: 'entering the corridor',
  entry_to_corridor: 'from the entrance',
  corridor_to_intersection: 'to the intersection',
  entry_to_room: 'entering the room',
  room_to_room: 'between rooms',
};

export interface BasicNavigationInstruction {
  action: 'start' | 'continue' | 'turn' | 'arrive' | 'error';
  location?: string;
  message: string;
  distance: number;
  direction?: string;
  distanceInMeters?: number;
  from?: string;
  to?: string;
  firstStepTo?: string;
  edgeType?: string;
  landmark?: string;
}

/**
 * Calculate the angle between two vectors
 * Returns angle in degrees (-180 to 180)
 */
function calculateAngle(p1: MapNode, p2: MapNode, p3: MapNode): number {
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const angle1 = Math.atan2(v1.y, v1.x);
  const angle2 = Math.atan2(v2.y, v2.x);
  
  let angle = (angle2 - angle1) * (180 / Math.PI);
  
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  
  return angle;
}

/**
 * Determine turn direction from angle
 * (Negated for screen/SVG coords where Y increases downward)
 */
function getTurnDirection(angle: number): string {
  const flipped = -angle;
  const absAngle = Math.abs(flipped);
  
  if (absAngle < 20) {
    return 'straight';
  } else if (absAngle > 160) {
    return 'u-turn';
  } else if (flipped > 0) {
    if (absAngle < 60) return 'slight left';
    if (absAngle < 120) return 'left';
    return 'sharp left';
  } else {
    if (absAngle < 60) return 'slight right';
    if (absAngle < 120) return 'right';
    return 'sharp right';
  }
}

/**
 * Calculate distance between two nodes
 */
function calculateDistance(node1: MapNode, node2: MapNode): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Format instruction message
 */
function formatInstruction(direction: string, distanceInMeters: number): string {
  const action = DIRECTION_MAP[direction] || 'Continue';
  
  if (distanceInMeters < 1) {
    return `${action}`;
  } else {
    return `${action} for ${distanceInMeters}m`;
  }
}

/**
 * Generate navigation instructions from a path
 */
export function generateNavigationInstructions(path: string[], nodes: Record<string, MapNode>): BasicNavigationInstruction[] {
  if (!path || path.length < 2) {
    return [{ action: 'error', message: 'Invalid path', distance: 0 }];
  }
  
  const instructions: BasicNavigationInstruction[] = [];
  
  // Start instruction
  instructions.push({
    action: 'start',
    location: path[0],
    message: `Starting at ${path[0]}`,
    distance: 0
  });
  
  // Process each segment
  let currentDirection: string | null = null;
  let accumulatedDistance = 0;
  let segmentStart = 0;
  
  for (let i = 1; i < path.length; i++) {
    const prevNode = nodes[path[i - 1]];
    const currentNode = nodes[path[i]];
    if (!prevNode || !currentNode) continue;
    
    const segmentDistance = calculateDistance(prevNode, currentNode);
    
    // Determine direction for this segment
    let direction = 'straight';
    if (i < path.length - 1) {
      const nextNode = nodes[path[i + 1]];
      if (nextNode) {
        const angle = calculateAngle(prevNode, currentNode, nextNode);
        direction = getTurnDirection(angle);
      }
    }
    
    // If direction changes or last segment, create instruction
    if (direction !== currentDirection || i === path.length - 1) {
      if (currentDirection !== null) {
        const totalDist = accumulatedDistance + (i === path.length - 1 ? segmentDistance : 0);
        
        instructions.push({
          action: currentDirection === 'straight' ? 'continue' : 'turn',
          direction: currentDirection,
          distance: Math.round(totalDist * 100) / 100,
          distanceInMeters: Math.round(totalDist / 10),
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
 * Enhanced version with edge type information
 */
export function buildUndirectedEdgeIndex(edges: MapEdge[]): Map<string, MapEdge> {
  if (!Array.isArray(edges)) return new Map();
  const index = new Map<string, MapEdge>();
  edges.forEach((e) => {
    const from = e.from_node ?? (e as any).from;
    const to = e.to_node ?? (e as any).to;
    if (!from || !to) return;
    const keyA = `${from}|${to}`;
    const keyB = `${to}|${from}`;
    index.set(keyA, e);
    index.set(keyB, e);
  });
  return index;
}

export function generateDetailedNavigationInstructions(
  path: string[],
  nodes: Record<string, MapNode>,
  edgesOrIndex: MapEdge[] | Map<string, MapEdge>
): BasicNavigationInstruction[] {
  const basicInstructions = generateNavigationInstructions(path, nodes);
  const edgeIndex =
    edgesOrIndex instanceof Map ? edgesOrIndex : buildUndirectedEdgeIndex(edgesOrIndex);
  
  return basicInstructions.map((instruction) => {
    if (instruction.action === 'continue' || instruction.action === 'turn') {
      const fromNode = instruction.from;
      const toNode = instruction.firstStepTo || instruction.to;
      
      if (edgeIndex && fromNode && toNode) {
        const edge = edgeIndex.get(`${fromNode}|${toNode}`);
        
        if (edge) {
          instruction.edgeType = edge.type;
          instruction.landmark = EDGE_DESCRIPTIONS[edge.type] || '';
        }
      }
    }
    
    return instruction;
  });
}
