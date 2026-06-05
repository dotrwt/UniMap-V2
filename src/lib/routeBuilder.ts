// src/lib/routeBuilder.ts
import type { CampusGraph, MapNode, MapEdge, Route, RouteStep, RouteOptions } from '@/types';
import { WALKING_SPEED_MPS } from '@/constants';
import { getNodeById, getEdgesBetween } from './graphUtils';

/** Helper to parse floor index from map ID string. */
function getFloorFromMapId(mapId: string): number {
  const parts = mapId.split('_');
  const suffix = parts[parts.length - 1]?.toLowerCase();
  if (suffix === 'gf') return 0;
  if (suffix === 'ff') return 1;
  if (suffix === 'sf') return 2;
  if (suffix === 'tf') return 3;
  const num = parseInt(suffix, 10);
  if (!isNaN(num)) return num;
  return 0;
}

/** Generates a human-readable navigation instruction for a step. */
export function generateInstruction(
  _current: MapNode,
  next: MapNode,
  edge: MapEdge | undefined
): string {
  const nextFloor = getFloorFromMapId(next.map);
  if (edge?.type === 'stairs') {
    return `Take the stairs to floor ${nextFloor}`;
  }
  if (edge?.type === 'lift') {
    return `Take the lift to floor ${nextFloor}`;
  }
  if (edge?.type === 'outdoor') {
    return `Head outside towards ${next.name}`;
  }
  if (next.type === 'entrance' || next.type === 'exit') {
    return `Enter ${next.name}`;
  }
  if (next.type === 'landmark') {
    return `Pass ${next.name}`;
  }
  if (next.type === 'room') {
    return `Arrive at ${next.name}`;
  }
  return `Continue to ${next.name}`;
}

/** Formats a distance in metres to a readable string. */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)}m`;
  }
  const km = (metres / 1000).toFixed(1);
  return `${km}km`;
}

/** Formats a time duration in seconds to a readable string. */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return 'less than a minute';
  }
  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} min`;
  }
  const totalMinutes = Math.ceil(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

/** Builds a complete Route object from an array of node IDs. */
export function buildRoute(
  graph: CampusGraph,
  nodeIds: string[],
  _options: RouteOptions
): Route | null {
  try {
    if (nodeIds.length < 2) {
      return null;
    }

    const resolvedNodes: MapNode[] = [];
    for (const id of nodeIds) {
      const node = getNodeById(graph, id);
      if (!node) {
        return null;
      }
      resolvedNodes.push(node);
    }

    const steps: RouteStep[] = [];
    for (let i = 1; i < resolvedNodes.length; i++) {
      const prev = resolvedNodes[i - 1];
      const curr = resolvedNodes[i];
      const edges = getEdgesBetween(graph, prev.id, curr.id);
      const edge = edges[0];

      const distanceFromPrev = edge ? edge.distance : 0;
      const type = edge ? edge.type : 'corridor';
      const instruction = generateInstruction(prev, curr, edge);

      steps.push({
        nodeId: curr.id,
        label: curr.name,
        instruction,
        distanceFromPrev,
        type,
      });
    }

    const totalDistance = steps.reduce((sum, step) => sum + step.distanceFromPrev, 0);
    const estimatedTime = totalDistance / WALKING_SPEED_MPS;

    return {
      from: resolvedNodes[0],
      to: resolvedNodes[resolvedNodes.length - 1],
      steps,
      totalDistance,
      estimatedTime,
      nodeIds,
    };
  } catch (error) {
    return null;
  }
}
