/**
 * Dijkstra's Algorithm Implementation
 * 
 * Finds the shortest path between two nodes in a weighted graph.
 * Uses a greedy approach to explore nodes and find the optimal route.
 * 
 * @param {object} graph - Graph representation as an object where keys are node IDs
 *                        and values are arrays of {node: string, weight: number} objects
 * @param {string} start - Starting node ID
 * @param {string} end - Destination node ID
 * @returns {array|null} - Array of node IDs representing the shortest path, or null if no path exists
 * 
 * @example
 * const graph = {
 *   'A': [{node: 'B', weight: 1}, {node: 'C', weight: 4}],
 *   'B': [{node: 'A', weight: 1}, {node: 'C', weight: 2}],
 *   'C': [{node: 'A', weight: 4}, {node: 'B', weight: 2}]
 * };
 * dijkstra(graph, 'A', 'C'); // Returns ['A', 'B', 'C']
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }
  push(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }
  get size() {
    return this.heap.length;
  }
  bubbleUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p][0] <= this.heap[i][0]) return;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }
  bubbleDown(i) {
    const n = this.heap.length;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
      if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;
      if (smallest === i) return;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

async function yieldToMainThread() {
  // Allow long CPU loops to be interrupted by the browser UI thread.
  if (typeof requestAnimationFrame === 'function') {
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export function dijkstra(graph, start, end) {
    // Distances and predecessor map for path reconstruction
    const distances = {};
    const prev = {};

    // Initialize known nodes to Infinity
    for (const node of Object.keys(graph ?? {})) {
      distances[node] = Infinity;
    }

    if (start == null || end == null) return null;
    if (!(start in distances)) distances[start] = Infinity;
    if (!(end in distances)) distances[end] = Infinity;

    distances[start] = 0;
    const heap = new MinHeap();
    heap.push([0, start]);

    // Main algorithm: pop the current best distance each time.
    // We don't need a decrease-key: we push updates and ignore stale heap entries.
    while (heap.size > 0) {
      const popped = heap.pop();
      if (!popped) break;
      const [d, u] = popped;
      if (d !== distances[u]) continue; // stale entry
      if (u === end) break;

      const neighbours = graph?.[u] ?? [];
      for (const neighbour of neighbours) {
        if (!neighbour || typeof neighbour.node !== 'string') continue;
        const v = neighbour.node;
        const w = neighbour.weight;
        if (!(v in distances)) distances[v] = Infinity;

        const newDist = distances[u] + w;
        if (newDist < distances[v]) {
          distances[v] = newDist;
          prev[v] = u;
          heap.push([newDist, v]);
        }
      }
    }

    // If we never improved distance to `end`, there is no path.
    if (distances[end] === Infinity) return null;

    // Reconstruct path from end to start without O(K^2) unshift shifting.
    const path = [];
    let current = end;
    while (current != null) {
      path.push(current);
      if (current === start) break;
      current = prev[current];
    }

    if (path[path.length - 1] !== start) return null;
    path.reverse();
    return path;
  }

/**
 * Non-blocking async Dijkstra (yields during the main loop).
 *
 * @param {object} graph
 * @param {string} start
 * @param {string} end
 * @param {{ signal?: AbortSignal, yieldEvery?: number }} [options]
 * @returns {Promise<string[]|null>}
 */
export async function dijkstraAsync(graph, start, end, options = {}) {
  const { signal = null, yieldEvery = 2000 } = options;

  const distances = {};
  const prev = {};

  for (const node of Object.keys(graph ?? {})) {
    distances[node] = Infinity;
  }

  if (start == null || end == null) return null;
  if (!(start in distances)) distances[start] = Infinity;
  if (!(end in distances)) distances[end] = Infinity;

  distances[start] = 0;
  const heap = new MinHeap();
  heap.push([0, start]);

  let lastYieldTime = performance.now();
  while (heap.size > 0) {
    if (signal?.aborted) return null;

    const popped = heap.pop();
    if (!popped) break;
    const [d, u] = popped;
    if (d !== distances[u]) continue; // stale entry
    if (u === end) break;

    const neighbours = graph?.[u] ?? [];
    for (const neighbour of neighbours) {
      if (signal?.aborted) return null;
      if (!neighbour || typeof neighbour.node !== 'string') continue;
      const v = neighbour.node;
      const w = neighbour.weight;
      if (!(v in distances)) distances[v] = Infinity;

      const newDist = distances[u] + w;
      if (newDist < distances[v]) {
        distances[v] = newDist;
        prev[v] = u;
        heap.push([newDist, v]);
      }
    }

    if (performance.now() - lastYieldTime > 10) {
      await yieldToMainThread();
      lastYieldTime = performance.now();
    }
  }

  if (distances[end] === Infinity) return null;

  const path = [];
  let current = end;
  while (current != null) {
    path.push(current);
    if (current === start) break;
    current = prev[current];
  }

  if (path[path.length - 1] !== start) return null;
  path.reverse();
  return path;
}