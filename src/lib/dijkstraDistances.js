/**
 * Dijkstra variant that returns the shortest distance from `start`
 * to all reachable nodes in the graph.
 *
 * @param {object} graph - { [nodeId]: Array<{ node: string, weight: number }> }
 * @param {string} start - Starting node ID
 * @returns {Record<string, number>} distances map (Infinity for unreachable nodes)
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

export function dijkstraDistances(graph, start) {
  if (!graph || typeof graph !== 'object' || start == null) return {};

  const distances = {};

  // Initialize all distances to Infinity
  Object.keys(graph).forEach((node) => {
    distances[node] = Infinity;
  });

  // If start isn't in the graph, return an empty map.
  if (!(start in distances)) return {};

  distances[start] = 0;

  const heap = new MinHeap();
  heap.push([0, start]);

  while (heap.size > 0) {
    const popped = heap.pop();
    if (!popped) break;
    const [d, u] = popped;
    if (d !== distances[u]) continue; // stale entry

    const neighbours = graph?.[u] ?? [];
    for (const neighbour of neighbours) {
      if (!neighbour || typeof neighbour.node !== 'string' || typeof neighbour.weight !== 'number') continue;
      const v = neighbour.node;
      if (!(v in distances)) distances[v] = Infinity;

      const newDist = distances[u] + neighbour.weight;
      if (newDist < distances[v]) {
        distances[v] = newDist;
        heap.push([newDist, v]);
      }
    }
  }

  return distances;
}

/**
 * Non-blocking async Dijkstra distances (yields during the main loop).
 *
 * @param {object} graph
 * @param {string} start
 * @param {{
 *   signal?: AbortSignal,
 *   yieldEvery?: number,
 *   targetNodeIds?: string[]|undefined
 * }} [options]
 * @returns {Promise<Record<string, number>>}
 */
export async function dijkstraDistancesAsync(graph, start, options = {}) {
  if (!graph || typeof graph !== 'object' || start == null) return {};

  const { signal = null, yieldEvery = 2000, targetNodeIds } = options;

  // Fast-path: no target set provided => preserve original behavior:
  // return a distance for every node in the graph.
  if (!Array.isArray(targetNodeIds) || targetNodeIds.length === 0) {
    const distances = {};

    Object.keys(graph).forEach((node) => {
      distances[node] = Infinity;
    });

    if (!(start in distances)) return {};

    distances[start] = 0;

    const heap = new MinHeap();
    heap.push([0, start]);

    let lastYieldTime = performance.now();
    while (heap.size > 0) {
      if (signal?.aborted) return {};

      const popped = heap.pop();
      if (!popped) break;
      const [d, u] = popped;
      if (d !== distances[u]) continue; // stale entry

      const neighbours = graph?.[u] ?? [];
      for (const neighbour of neighbours) {
        if (signal?.aborted) return {};
        if (!neighbour || typeof neighbour.node !== 'string' || typeof neighbour.weight !== 'number') continue;
        const v = neighbour.node;
        if (!(v in distances)) distances[v] = Infinity;

        const newDist = distances[u] + neighbour.weight;
        if (newDist < distances[v]) {
          distances[v] = newDist;
          heap.push([newDist, v]);
        }
      }

      if (performance.now() - lastYieldTime > 10) {
        await yieldToMainThread();
        lastYieldTime = performance.now();
      }
    }

    return distances;
  }

  // Targeted mode:
  // - stop early once all targets are finalized
  // - return distances only for reachable targets (others omitted)
  const targetSet = new Set(targetNodeIds);
  const finalizedTargets = new Set();

  // Only store discovered node distances to reduce memory/payload size.
  const distances = Object.create(null);
  distances[start] = 0;

  const heap = new MinHeap();
  heap.push([0, start]);

  let lastYieldTime = performance.now();
  while (heap.size > 0) {
    if (signal?.aborted) return {};

    const popped = heap.pop();
    if (!popped) break;
    const [d, u] = popped;

    if (distances[u] == null || d !== distances[u]) continue; // stale entry

    if (targetSet.has(u) && !finalizedTargets.has(u)) {
      finalizedTargets.add(u);
      if (finalizedTargets.size >= targetSet.size) break;
    }

    const neighbours = graph?.[u] ?? [];
    for (const neighbour of neighbours) {
      if (signal?.aborted) return {};
      if (!neighbour || typeof neighbour.node !== 'string' || typeof neighbour.weight !== 'number') continue;
      const v = neighbour.node;
      const prevDist = distances[v] == null ? Infinity : distances[v];

      const newDist = d + neighbour.weight;
      if (newDist < prevDist) {
        distances[v] = newDist;
        heap.push([newDist, v]);
      }
    }

    if (performance.now() - lastYieldTime > 10) {
      await yieldToMainThread();
      lastYieldTime = performance.now();
    }
  }

  // Return only reachable targets (omit unreachable to reduce payload).
  const result = Object.create(null);
  for (const t of targetNodeIds) {
    if (distances[t] != null) result[t] = distances[t];
  }
  return result;
}
