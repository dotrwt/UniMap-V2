/**
 * Builds a polyline points string from a Dijkstra path.
 * Uses exact node coordinates in the same coordinate system as the SVG viewBox.
 *
 * @param {string[]} shortestPathNodes - Ordered array of node IDs from Dijkstra
 * @param {object} nodes - Map of node IDs to {x, y} objects
 * @returns {string} Space-separated "x,y" pairs for SVG polyline points
 */
export function buildPolylinePoints(shortestPathNodes, nodes) {
  return shortestPathNodes
    .filter((nodeId) => nodes[nodeId] && nodes[nodeId].x != null && nodes[nodeId].y != null)
    .map((nodeId) => {
      const node = nodes[nodeId];
      return `${node.x},${node.y}`;
    })
    .join(' ');
}
