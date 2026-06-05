// src/hooks/useGraph.ts
import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/mapStore';
import { fetchNodes, fetchEdges, fetchBuildings, fetchFloors } from '@/lib/api';

/** React hook that initiates graph data loading on mount and stores it in the Zustand store. */
export function useGraph(): {
  isLoading: boolean;
  error: string | null;
  isGraphLoaded: boolean;
} {
  const {
    isGraphLoaded,
    isLoading,
    error,
    setGraph,
    setFloors,
    setLoading,
    setError,
  } = useMapStore();

  const fetchStarted = useRef(false);

  useEffect(() => {
    if (isGraphLoaded || fetchStarted.current) {
      return;
    }
    fetchStarted.current = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [nodes, edges, buildings] = await Promise.all([
          fetchNodes(),
          fetchEdges(),
          fetchBuildings(),
        ]);

        const graph = { nodes, edges, buildings };
        setGraph(graph);
        useMapStore.setState({ isGraphLoaded: true });

        const floors = await fetchFloors();
        setFloors(floors);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch graph data';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isGraphLoaded, setGraph, setFloors, setLoading, setError]);

  return {
    isLoading,
    error,
    isGraphLoaded,
  };
}
