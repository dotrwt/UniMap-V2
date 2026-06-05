// src/lib/dijkstra.ts
import type { CampusGraph, MapEdge, RouteOptions } from '@/types';
import { ACCESSIBLE_EDGE_TYPES } from '@/constants';

/** Builds an adjacency list from the graph's edges respecting routing options. */
export function buildAdjacencyList(
  graph: CampusGraph,
  options: RouteOptions
): Map<string, Array<{ nodeId: string; edge: MapEdge }>> {
  const adjList = new Map<string, Array<{ nodeId: string; edge: MapEdge }>>();

  for (const node of graph.nodes) {
    adjList.set(node.id, []);
  }

  for (const edge of graph.edges) {
    if (options.accessibleOnly && !ACCESSIBLE_EDGE_TYPES.includes(edge.type)) {
      continue;
    }
    if (options.avoidStairs && edge.type === 'stairs') {
      continue;
    }

    const from = edge.from_node;
    const to = edge.to_node;

    let fromList = adjList.get(from);
    if (!fromList) {
      fromList = [];
      adjList.set(from, fromList);
    }
    fromList.push({ nodeId: to, edge });

    let toList = adjList.get(to);
    if (!toList) {
      toList = [];
      adjList.set(to, toList);
    }
    toList.push({ nodeId: from, edge });
  }

  return adjList;
}

/** Runs Dijkstra's algorithm to find the shortest path between two nodes. */
export function dijkstra(
  graph: CampusGraph,
  fromId: string,
  toId: string,
  options: RouteOptions
): string[] | null {
  try {
    const nodeIdsInGraph = new Set(graph.nodes.map(n => n.id));
    if (!nodeIdsInGraph.has(fromId) || !nodeIdsInGraph.has(toId)) {
      return null;
    }

    const adjList = buildAdjacencyList(graph, options);

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visited = new Set<string>();

    for (const node of graph.nodes) {
      distances[node.id] = Infinity;
      previous[node.id] = null;
    }

    distances[fromId] = 0;

    const pq: Array<[string, number]> = [[fromId, 0]];

    while (pq.length > 0) {
      pq.sort((a, b) => b[1] - a[1]);
      const popped = pq.pop();
      if (!popped) {
        break;
      }
      const [u, distU] = popped;

      if (visited.has(u)) {
        continue;
      }
      visited.add(u);

      if (u === toId) {
        break;
      }

      const neighbors = adjList.get(u) || [];
      for (const neighbor of neighbors) {
        const v = neighbor.nodeId;
        if (visited.has(v)) {
          continue;
        }

        const alt = distU + neighbor.edge.distance;
        const currentDistV = distances[v] !== undefined ? distances[v] : Infinity;

        if (alt < currentDistV) {
          distances[v] = alt;
          previous[v] = u;
          pq.push([v, alt]);
        }
      }
    }

    if (distances[toId] === Infinity) {
      return null;
    }

    const path: string[] = [];
    let curr: string | null = toId;
    while (curr !== null) {
      path.push(curr);
      if (curr === fromId) {
        break;
      }
      curr = previous[curr] ?? null;
    }

    if (path[path.length - 1] !== fromId) {
      return null;
    }

    return path.reverse();
  } catch (error) {
    return null;
  }
}
