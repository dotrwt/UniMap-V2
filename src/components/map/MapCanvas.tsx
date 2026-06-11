// src/components/map/MapCanvas.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2 } from 'lucide-react';
import { useMapStore } from '@/store/mapStore';
import { useFloorMap } from '@/hooks/useFloorMap';
import { useSvgMap } from '@/hooks/useSvgMap';
import { fetchFloors } from '@/lib/api';
import '../../styles/map.css';

interface MapCanvasProps {
  className?: string;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export default function MapCanvas({ className = '' }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement | null>(null);

  const graph = useMapStore((state) => state.graph);
  const activeMap = useMapStore((state) => state.activeMap);
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
            // @ts-ignore
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

  // Transform state and references to avoid stale closure issues
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const transformRef = useRef<Transform>(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const isPanningRef = useRef<boolean>(false);
  const [isPanningCursor, setIsPanningCursor] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  // Touch zoom/pan ref
  const touchStartRef = useRef<{
    initialDistance: number;
    initialScale: number;
    initialTransform: Transform;
    isPinching: boolean;
  }>({
    initialDistance: 0,
    initialScale: 1,
    initialTransform: { scale: 1, x: 0, y: 0 },
    isPinching: false
  });

  // Callback ref for map injection
  const mapRef = useCallback((node: HTMLDivElement | null) => {
    svgWrapperRef.current = node;
    if (node) {
      const svgElement = node.querySelector('svg');
      if (svgElement) {
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');

        // Remove existing custom nodes
        svgElement.querySelectorAll('circle[id^="node-"]')
          .forEach(el => el.remove());

        // Append markers in SVG space
        if (graph && activeMap) {
          const filteredNodes = graph.nodes.filter(n => n.map === activeMap);
          filteredNodes.forEach(nodeData => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', String(nodeData.x));
            circle.setAttribute('cy', String(nodeData.y));
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', '#4A7FA7');
            circle.setAttribute('id', `node-${nodeData.id}`);
            circle.setAttribute('style', 'cursor:pointer');
            svgElement.appendChild(circle);
          });
        }
      }
    }
  }, [svgContent, graph, activeMap]);

  // Handle wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

      setTransform(prev => {
        const newScale = clamp(prev.scale * zoomFactor, MIN_SCALE, MAX_SCALE);
        const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
        return { scale: newScale, x: newX, y: newY };
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isPanningRef.current = true;
    setIsPanningCursor(true);
    startXRef.current = e.clientX - transformRef.current.x;
    startYRef.current = e.clientY - transformRef.current.y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    const newX = e.clientX - startXRef.current;
    const newY = e.clientY - startYRef.current;
    setTransform(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanningRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isPanningRef.current = false;
      setIsPanningCursor(false);
    }
  };

  // Touch zoom/pan handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const t = e.touches;

    if (t.length === 1) {
      isPanningRef.current = true;
      setIsPanningCursor(true);
      startXRef.current = t[0].clientX - transformRef.current.x;
      startYRef.current = t[0].clientY - transformRef.current.y;
      touchStartRef.current.isPinching = false;
    } else if (t.length === 2) {
      isPanningRef.current = false;
      setIsPanningCursor(false);

      const dist = Math.hypot(
        t[1].clientX - t[0].clientX,
        t[1].clientY - t[0].clientY
      );

      touchStartRef.current = {
        initialDistance: dist,
        initialScale: transformRef.current.scale,
        initialTransform: { ...transformRef.current },
        isPinching: true
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const t = e.touches;

    if (t.length === 1 && isPanningRef.current) {
      const newX = t[0].clientX - startXRef.current;
      const newY = t[0].clientY - startYRef.current;
      setTransform(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (t.length === 2 && touchStartRef.current.isPinching && containerRef.current) {
      const dist = Math.hypot(
        t[1].clientX - t[0].clientX,
        t[1].clientY - t[0].clientY
      );

      const { initialDistance, initialScale, initialTransform } = touchStartRef.current;
      if (initialDistance === 0) return;

      const factor = dist / initialDistance;
      const newScale = clamp(initialScale * factor, MIN_SCALE, MAX_SCALE);

      const clientMidX = (t[0].clientX + t[1].clientX) / 2;
      const clientMidY = (t[0].clientY + t[1].clientY) / 2;

      const rect = containerRef.current.getBoundingClientRect();
      const midX = clientMidX - rect.left;
      const midY = clientMidY - rect.top;

      const newX = midX - (midX - initialTransform.x) * (newScale / initialTransform.scale);
      const newY = midY - (midY - initialTransform.y) * (newScale / initialTransform.scale);

      setTransform({
        scale: newScale,
        x: newX,
        y: newY
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    isPanningRef.current = false;
    setIsPanningCursor(false);
    touchStartRef.current.isPinching = false;
  };

  const showReset = transform.scale !== 1 || transform.x !== 0 || transform.y !== 0;

  return (
    <div
      ref={containerRef}
      className={`map-container w-full h-full relative overflow-hidden bg-[var(--bg-card)] ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/80 z-20">
          <div className="animate-spin border-2 border-navy-500 rounded-full w-8 h-8 border-t-transparent" />
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-red-400 text-[13px] font-medium bg-[var(--bg-card)]/90 px-4 py-2 rounded-xl border border-[var(--border)]">
            Failed to load map. Please try again.
          </div>
        </div>
      )}

      {!svgUrl && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 text-[var(--text-secondary)] opacity-60 text-xs">
          No map available
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isPanningCursor ? 'none' : 'transform 0.1s ease',
        }}
        className={isPanningCursor ? 'cursor-grabbing w-full h-full' : 'cursor-grab w-full h-full'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        dangerouslySetInnerHTML={{ __html: svgContent ?? '' }}
      />

      {showReset && (
        <button
          onClick={() => setTransform({ scale: 1, x: 0, y: 0 })}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all shadow-sm cursor-pointer"
        >
          <Maximize2 size={13} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
