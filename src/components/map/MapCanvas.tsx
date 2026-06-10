// src/components/map/MapCanvas.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
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

  // Transform states and refs
  const [displayScale, setDisplayScale] = useState(1);
  const [dummyState, setDummyState] = useState(0);
  const transformRef = useRef<Transform>({ scale: 1, x: 0, y: 0 });

  const isPanningRef = useRef<boolean>(false);
  const [isPanningCursor, setIsPanningCursor] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  const rafIdRef = useRef<number>(0);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const applyTransform = () => {
    if (!wrapperRef.current) return;
    const { scale, x, y } = transformRef.current;
    wrapperRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };

  const scheduleTransform = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(applyTransform);
  };

  const setShapeRendering = (value: 'optimizeSpeed' | 'geometricPrecision') => {
    if (!wrapperRef.current) return;
    const svgEl = wrapperRef.current.querySelector('svg');
    if (svgEl) {
      svgEl.setAttribute('shape-rendering', value);
    }
  };

  // Callback ref for map injection (untouched logic as requested)
  const mapRef = useCallback((node: HTMLDivElement | null) => {
    wrapperRef.current = node;
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

  // Imperative event listeners with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

      const { scale, x, y } = transformRef.current;
      const newScale = clamp(scale * zoomFactor, MIN_SCALE, MAX_SCALE);
      const newX = mouseX - (mouseX - x) * (newScale / scale);
      const newY = mouseY - (mouseY - y) * (newScale / scale);

      transformRef.current = { scale: newScale, x: newX, y: newY };
      setShapeRendering('optimizeSpeed');
      scheduleTransform();

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        setShapeRendering('geometricPrecision');
        setDisplayScale(transformRef.current.scale);
        setDummyState(prev => prev + 1);
      }, 150);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      try {
        container.setPointerCapture(e.pointerId);
      } catch (err) {}
      isPanningRef.current = true;
      setIsPanningCursor(true);
      setShapeRendering('optimizeSpeed');
      startXRef.current = e.clientX - transformRef.current.x;
      startYRef.current = e.clientY - transformRef.current.y;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      const newX = e.clientX - startXRef.current;
      const newY = e.clientY - startYRef.current;
      transformRef.current = {
        ...transformRef.current,
        x: newX,
        y: newY
      };
      scheduleTransform();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isPanningRef.current) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (err) {}
        isPanningRef.current = false;
        setIsPanningCursor(false);
        setShapeRendering('geometricPrecision');
        setDisplayScale(transformRef.current.scale);
        setDummyState(prev => prev + 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches;
      setShapeRendering('optimizeSpeed');

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

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches;

      if (t.length === 1 && isPanningRef.current) {
        const newX = t[0].clientX - startXRef.current;
        const newY = t[0].clientY - startYRef.current;
        transformRef.current = {
          ...transformRef.current,
          x: newX,
          y: newY
        };
        scheduleTransform();
      } else if (t.length === 2 && touchStartRef.current.isPinching) {
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

        const rect = container.getBoundingClientRect();
        const midX = clientMidX - rect.left;
        const midY = clientMidY - rect.top;

        const newX = midX - (midX - initialTransform.x) * (newScale / initialTransform.scale);
        const newY = midY - (midY - initialTransform.y) * (newScale / initialTransform.scale);

        transformRef.current = {
          scale: newScale,
          x: newX,
          y: newY
        };
        scheduleTransform();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        isPanningRef.current = false;
        setIsPanningCursor(false);
        touchStartRef.current.isPinching = false;
        setShapeRendering('geometricPrecision');
        setDisplayScale(transformRef.current.scale);
        setDummyState(prev => prev + 1);
      } else if (e.touches.length === 1) {
        isPanningRef.current = true;
        setIsPanningCursor(true);
        touchStartRef.current.isPinching = false;
        const t = e.touches;
        startXRef.current = t[0].clientX - transformRef.current.x;
        startYRef.current = t[0].clientY - transformRef.current.y;
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('pointerdown', onPointerDown, { passive: false });
    container.addEventListener('pointermove', onPointerMove, { passive: false });
    container.addEventListener('pointerup', onPointerUp, { passive: false });
    container.addEventListener('pointerleave', onPointerUp, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });
    container.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [svgContent]);

  const zoomToCenter = (direction: 'in' | 'out') => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const zoomFactor = direction === 'in' ? 1.25 : 0.8;
    const { scale, x, y } = transformRef.current;
    const newScale = clamp(scale * zoomFactor, MIN_SCALE, MAX_SCALE);
    const newX = centerX - (centerX - x) * (newScale / scale);
    const newY = centerY - (centerY - y) * (newScale / scale);
    transformRef.current = { scale: newScale, x: newX, y: newY };
    applyTransform();
    setDisplayScale(newScale);
  };

  const resetTransform = () => {
    if (!wrapperRef.current) return;
    wrapperRef.current.style.transition = 'transform 0.3s ease';
    wrapperRef.current.style.transform = 'translate(0px, 0px) scale(1)';
    transformRef.current = { scale: 1, x: 0, y: 0 };
    setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transition = 'none';
      }
    }, 300);
    setDisplayScale(1);
    setDummyState(prev => prev + 1);
  };

  const showReset = (displayScale !== 1 || transformRef.current.x !== 0 || transformRef.current.y !== 0) && dummyState !== -99999;

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
          transformOrigin: '0 0',
        }}
        className={`${isPanningCursor ? 'cursor-grabbing' : 'cursor-grab'} w-full h-full`}
        dangerouslySetInnerHTML={{ __html: svgContent ?? '' }}
      />

      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2">
        <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => zoomToCenter('in')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer border-b border-[var(--border)]"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => zoomToCenter('out')}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
        </div>

        {showReset && (
          <button
            onClick={resetTransform}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all shadow-sm cursor-pointer"
          >
            <Maximize2 size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
