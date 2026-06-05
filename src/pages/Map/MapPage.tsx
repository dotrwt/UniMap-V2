// src/pages/Map/MapPage.tsx
import { useEffect } from 'react';
import { useGraph } from '@/hooks/useGraph';
import { useMapStore } from '@/store/mapStore';
import Map from './Map';
import { SearchPanel, RoutePanel } from './Navigation';
import '@/styles/map.css';

/** The primary campus navigation page component containing the interactive map, search panel, and route details. */
export default function MapPage() {
  const { isLoading, error, isGraphLoaded } = useGraph();
  const { graph, activeMap, setActiveMap, setActiveFloor } = useMapStore();

  // Automatically select the first building and floor when the graph loads
  useEffect(() => {
    if (isGraphLoaded && graph && !activeMap) {
      const defaultBuilding = graph.buildings[0];
      if (defaultBuilding) {
        setActiveMap(defaultBuilding.id);
        setActiveFloor(0);
      }
    }
  }, [isGraphLoaded, graph, activeMap, setActiveMap, setActiveFloor]);

  if (isLoading && !isGraphLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--bg)] text-[var(--text-secondary)]">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin mb-4" />
        <span className="text-sm font-medium">Loading campus maps and data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--bg)] text-red-500">
        <span className="text-lg font-bold mb-2">Failed to Load Map</span>
        <span className="text-sm text-[var(--text-muted)] mb-4">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden bg-[var(--bg)] h-[calc(100vh-56px)]">
      {/* Sidebar navigation control */}
      <div className="w-full md:w-[420px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-card)] flex flex-col z-20 shadow-lg md:shadow-none">
        <SearchPanel />
        <RoutePanel />
      </div>

      {/* Main interactive map view */}
      <div className="flex-1 relative h-full bg-[var(--bg)] z-10">
        <Map />
      </div>
    </div>
  );
}
