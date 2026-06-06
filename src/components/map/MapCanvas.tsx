// src/components/map/MapCanvas.tsx
import { useEffect, useRef } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useFloorMap } from '@/hooks/useFloorMap';
import { useSvgMap } from '@/hooks/useSvgMap';
import { fetchFloors } from '@/lib/api';
import '../../styles/map.css';

interface MapCanvasProps {
  className?: string;
}

export default function MapCanvas({ className = '' }: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const setActiveMap = useMapStore((state) => state.setActiveMap);
  const setActiveFloor = useMapStore((state) => state.setActiveFloor);
  const setFloors = useMapStore((state) => state.setFloors);

  // Set hardcoded defaults on mount and fetch floors from API
  useEffect(() => {
    setActiveMap('Campus_Map');
    setActiveFloor(1);

    let active = true;
    async function loadFloors() {
      try {
        const data = await fetchFloors();
        if (active) {
          // Map Campus_Map metadata to match building="Campus_Map" and floor=1
          // so that the activeMap="Campus_Map" / activeFloor=1 defaults resolve correctly.
          const mapped = data.map(f => {
            if (f.map === 'Campus_Map') {
              return {
                ...f,
                building: 'Campus_Map',
                floor: 1,
              };
            }
            return f;
          });
          setFloors(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch floors from API', err);
      }
    }
    loadFloors();

    return () => {
      active = false;
    };
  }, [setActiveMap, setActiveFloor, setFloors]);

  const { svgUrl } = useFloorMap();
  const { svgContent, isLoading, error } = useSvgMap(svgUrl);

  // Post-injection: ensure the SVG element fills the container
  useEffect(() => {
    if (!mapRef.current || !svgContent) return;
    const svgElement = mapRef.current.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
    }
  }, [svgContent]);

  return (
    <div className={`w-full h-full relative bg-[var(--bg-card)] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/80 z-20">
          <div className="animate-spin border-2 border-navy-500 rounded-full w-8 h-8 border-t-transparent" />
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-red-400 text-[13px] font-medium">
            Failed to load map. Please try again.
          </div>
        </div>
      )}

      {!isLoading && !error && !svgContent && (
        <div className="absolute inset-0 flex items-center justify-center z-20 text-[var(--text-secondary)] opacity-60 text-xs">
          No map available
        </div>
      )}

      <div
        ref={mapRef}
        className="map-container map-svg w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgContent || '' }}
      />
    </div>
  );
}
