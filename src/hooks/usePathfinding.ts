// src/hooks/usePathfinding.ts
import { useEffect, useState } from 'react';
import { useMapStore } from '@/store/mapStore';
import { dijkstra } from '@/lib/dijkstra';
import { buildRoute } from '@/lib/routeBuilder';
import { DEFAULT_ROUTE_OPTIONS } from '@/constants';
import type { Route } from '@/types';

/** React hook that runs Dijkstra's pathfinding algorithm when both source and destination are selected. */
export function usePathfinding(): {
  route: Route | null;
  isComputing: boolean;
} {
  const graph = useMapStore(state => state.graph);
  const selectedFrom = useMapStore(state => state.selectedFrom);
  const selectedTo = useMapStore(state => state.selectedTo);
  const currentRoute = useMapStore(state => state.currentRoute);
  const clearRoute = useMapStore(state => state.clearRoute);
  const setCurrentRoute = useMapStore(state => state.setCurrentRoute);
  const setError = useMapStore(state => state.setError);

  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (!selectedFrom || !selectedTo) {
      clearRoute();
      return;
    }

    if (!graph) {
      return;
    }

    setIsComputing(true);
    const runPathfinding = () => {
      try {
        const nodeIds = dijkstra(
          graph,
          selectedFrom.id,
          selectedTo.id,
          DEFAULT_ROUTE_OPTIONS
        );

        if (!nodeIds) {
          setError('No route found');
          setCurrentRoute(null);
        } else {
          const route = buildRoute(graph, nodeIds, DEFAULT_ROUTE_OPTIONS);
          if (!route) {
            setError('No route found');
            setCurrentRoute(null);
          } else {
            setError(null);
            setCurrentRoute(route);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error computing route';
        setError(message);
        setCurrentRoute(null);
      } finally {
        setIsComputing(false);
      }
    };

    runPathfinding();
  }, [graph, selectedFrom, selectedTo, clearRoute, setCurrentRoute, setError]);

  return {
    route: currentRoute,
    isComputing,
  };
}
