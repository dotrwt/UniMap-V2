// src/lib/graphUtils.ts
import { CampusGraph, MapNode, MapEdge } from '@/types';

/** Returns the map node with the specified ID. */
export function getNodeById(graph: CampusGraph, id: string): MapNode | undefined {
  return graph.nodes.find(node => node.id === id);
}

/** Returns all map nodes located in the specified building. */
export function getNodesByBuilding(graph: CampusGraph, building: string): MapNode[] {
  return graph.nodes.filter(node => node.building === building);
}

/** Returns all map nodes located on the specified building floor. */
export function getNodesByFloor(
  graph: CampusGraph,
  building: string,
  floor: number
): MapNode[] {
  return graph.nodes.filter(node => node.building === building && node.floor === floor);
}

/** Performs a case-insensitive search on node labels and keywords. */
export function searchNodes(graph: CampusGraph, query: string): MapNode[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) {
    return [];
  }
  return graph.nodes.filter(node => {
    const labelMatch = node.label.toLowerCase().includes(trimmed);
    const keywordMatch = node.keywords?.some(kw => kw.toLowerCase().includes(trimmed)) ?? false;
    return labelMatch || keywordMatch;
  });
}

/** Returns all staircase, lift, entrance, and exit transition nodes. */
export function getTransitionNodes(graph: CampusGraph): MapNode[] {
  const transitionTypes = new Set(['staircase', 'lift', 'entrance', 'exit']);
  return graph.nodes.filter(node => transitionTypes.has(node.type));
}

/** Returns all edges between two nodes in either direction. */
export function getEdgesBetween(
  graph: CampusGraph,
  nodeIdA: string,
  nodeIdB: string
): MapEdge[] {
  return graph.edges.filter(
    edge =>
      (edge.from === nodeIdA && edge.to === nodeIdB) ||
      (edge.from === nodeIdB && edge.to === nodeIdA)
  );
}

/** Validates the graph structure and returns warnings. */
export function validateGraph(graph: CampusGraph): string[] {
  const warnings: string[] = [];

  if (graph.nodes.length === 0) {
    warnings.push('Graph has no nodes.');
  }

  if (graph.edges.length === 0) {
    warnings.push('Graph has no edges.');
  }

  const nodeIds = new Set(graph.nodes.map(node => node.id));

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from)) {
      warnings.push(`Edge ${edge.id} references non-existent start node ${edge.from}.`);
    }
    if (!nodeIds.has(edge.to)) {
      warnings.push(`Edge ${edge.id} references non-existent end node ${edge.to}.`);
    }
    if (edge.weight <= 0) {
      warnings.push(`Edge ${edge.id} has an invalid weight of ${edge.weight}.`);
    }
  }

  return warnings;
}
