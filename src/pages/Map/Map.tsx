// src/pages/Map/Map.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useFloorMap } from '@/hooks/useFloorMap';
import { useMapStore } from '@/store/mapStore';
import type { Transform } from '@/store/mapStore';
import { useSvgMap } from '@/hooks/useSvgMap';
import '../../styles/map.css';

const FALLBACK_MAP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQe5Y6LmcybzLqnrbl_DIRWcQRX2p2x1o_B8abRkPBs9TbNQLwVnASXUSFRaYbS6p77T66KH-5dhchsa6tOwB4z9geis9A3E6kXJ7Vo-zIcgCGqy25E3ievQTrJ63iAlX1GH3k_mA3eKaaQizFLLVwztTV0ADwWS_kjhEprNKX7iS25jXu-KiojXH8Sw5guFwh2TnKUu4CF6WKbxcBMel0KZESOysIfubkCKn2eHjbZK9AP64Sw7oupDhi-7Ac3FdCV971OKajUCH';

const MIN_SCALE = 0.5;
const MAX_SCALE = 4.0;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** Map component loads and renders the active floor map, rendering an animated route overlay. */
export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { svgUrl } = useFloorMap();
  const { svgContent, isLoading, error } = useSvgMap(svgUrl);
  const {
    graph,
    activeMap,
    activeFloor,
    selectedFrom,
    selectedTo,
    currentRoute,
    setSelectedFrom,
    setSelectedTo,
    transform,
    setTransform,
  } = useMapStore();

  const [viewBox, setViewBox] = useState({ minX: 0, minY: 0, width: 1000, height: 1000 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const activeMapUrl = svgUrl || FALLBACK_MAP_URL;

  // Zoom/pan state and refs to avoid stale closures
  const transformRef = useRef<Transform>(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const isPanningRef = useRef<boolean>(false);
  const [isPanningCursor, setIsPanningCursor] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  const wasDraggingRef = useRef<boolean>(false);
  const startPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
    isPinching: false,
  });

  // Resolve active map dimensions to keep layout scalable
  useEffect(() => {
    if (svgContent && mapRef.current) {
      const svgElement = mapRef.current.querySelector('svg');
      if (svgElement) {
        // Ensure the injected SVG element fills the container
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');

        const viewBoxStr = svgElement.getAttribute('viewBox');
        if (viewBoxStr) {
          const parts = viewBoxStr.trim().split(/[\s,]+/);
          if (parts.length === 4) {
            const minX = parseFloat(parts[0]);
            const minY = parseFloat(parts[1]);
            const width = parseFloat(parts[2]);
            const height = parseFloat(parts[3]);
            if (!isNaN(minX) && !isNaN(minY) && !isNaN(width) && !isNaN(height)) {
              setViewBox({ minX, minY, width, height });
              setImgLoaded(true);
              return;
            }
          }
        }

        const widthAttr = svgElement.getAttribute('width');
        const heightAttr = svgElement.getAttribute('height');
        if (widthAttr && heightAttr) {
          const width = parseFloat(widthAttr);
          const height = parseFloat(heightAttr);
          if (!isNaN(width) && !isNaN(height)) {
            setViewBox({ minX: 0, minY: 0, width, height });
            setImgLoaded(true);
            return;
          }
        }
      }
    }

    if (!svgContent) {
      setImgLoaded(false);
      const img = new Image();
      img.src = activeMapUrl;
      img.onload = () => {
        setViewBox({
          minX: 0,
          minY: 0,
          width: img.naturalWidth || 1000,
          height: img.naturalHeight || 1000,
        });
        setImgLoaded(true);
      };
      img.onerror = () => {
        setViewBox({ minX: 0, minY: 0, width: 1000, height: 1000 });
        setImgLoaded(true);
      };
    }
  }, [activeMapUrl, svgContent]);

  // Handle wheel zoom (zoom to mouse cursor)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

      const prev = transformRef.current;
      const newScale = clamp(prev.scale * zoomFactor, MIN_SCALE, MAX_SCALE);
      const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
      const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
      setTransform({ scale: newScale, x: newX, y: newY });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [setTransform]);

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isPanningRef.current = true;
    setIsPanningCursor(true);
    startXRef.current = e.clientX - transformRef.current.x;
    startYRef.current = e.clientY - transformRef.current.y;

    wasDraggingRef.current = false;
    startPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    const moveDist = Math.hypot(
      e.clientX - startPointerPosRef.current.x,
      e.clientY - startPointerPosRef.current.y
    );
    if (moveDist > 5) {
      wasDraggingRef.current = true;
    }
    const newX = e.clientX - startXRef.current;
    const newY = e.clientY - startYRef.current;
    setTransform({
      scale: transformRef.current.scale,
      x: newX,
      y: newY,
    });
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
    const t = e.touches;

    wasDraggingRef.current = false;
    if (t.length === 1) {
      isPanningRef.current = true;
      setIsPanningCursor(true);
      startXRef.current = t[0].clientX - transformRef.current.x;
      startYRef.current = t[0].clientY - transformRef.current.y;
      startPointerPosRef.current = { x: t[0].clientX, y: t[0].clientY };
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
        isPinching: true,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches;

    if (t.length === 1 && isPanningRef.current) {
      const moveDist = Math.hypot(
        t[0].clientX - startPointerPosRef.current.x,
        t[0].clientY - startPointerPosRef.current.y
      );
      if (moveDist > 5) {
        wasDraggingRef.current = true;
      }
      const newX = t[0].clientX - startXRef.current;
      const newY = t[0].clientY - startYRef.current;
      setTransform({
        scale: transformRef.current.scale,
        x: newX,
        y: newY,
      });
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
        y: newY,
      });
    }
  };

  const handleTouchEnd = () => {
    isPanningRef.current = false;
    setIsPanningCursor(false);
    touchStartRef.current.isPinching = false;
  };

  // Resolve target map ID
  const targetMapId = useMemo(() => {
    if (!graph || !activeMap || activeFloor === null) return null;
    if (activeMap === 'Campus_Map') return 'Campus_Map';
    const activeBuilding = graph.buildings.find((b) => b.id === activeMap);
    return activeBuilding ? activeBuilding.floorIds[activeFloor] : null;
  }, [graph, activeMap, activeFloor]);

  // Nodes belonging to the active map floor
  const activeFloorNodes = useMemo(() => {
    if (!graph || !targetMapId) return [];
    return graph.nodes.filter((node) => node.map === targetMapId);
  }, [graph, targetMapId]);

  // Compute the route path string in the SVG coordinates, filtered to active floor segments
  const pathD = useMemo(() => {
    if (!currentRoute || !graph || !targetMapId) return '';
    const points: string[] = [];

    let prevNode = currentRoute.from;

    for (const step of currentRoute.steps) {
      const currNode = graph.nodes.find((n) => n.id === step.nodeId);
      if (prevNode && currNode) {
        if (prevNode.map === targetMapId && currNode.map === targetMapId) {
          points.push(`M ${prevNode.x} ${prevNode.y} L ${currNode.x} ${currNode.y}`);
        }
      }
      prevNode = currNode || prevNode;
    }

    return points.join(' ');
  }, [currentRoute, graph, targetMapId]);

  // List of active floor nodes inside the current route
  const activeFloorNodesInRoute = useMemo(() => {
    if (!currentRoute || !graph || !targetMapId) return [];
    const nodes: typeof graph.nodes = [];
    for (const step of currentRoute.steps) {
      const node = graph.nodes.find((n) => n.id === step.nodeId);
      if (node && node.map === targetMapId) {
        nodes.push(node);
      }
    }
    if (selectedFrom && selectedFrom.map === targetMapId) nodes.push(selectedFrom);
    if (selectedTo && selectedTo.map === targetMapId) nodes.push(selectedTo);
    return nodes;
  }, [currentRoute, graph, targetMapId, selectedFrom, selectedTo]);

  // Bounding box of the path on the active floor
  const pathBbox = useMemo(() => {
    if (activeFloorNodesInRoute.length === 0) return null;
    let minX = activeFloorNodesInRoute[0].x;
    let maxX = activeFloorNodesInRoute[0].x;
    let minY = activeFloorNodesInRoute[0].y;
    let maxY = activeFloorNodesInRoute[0].y;
    for (let i = 1; i < activeFloorNodesInRoute.length; i++) {
      const p = activeFloorNodesInRoute[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }, [activeFloorNodesInRoute]);

  // Auto-fit coordinates to container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !imgLoaded) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!(w > 0 && h > 0)) return;

    let targetBbox = {
      minX: viewBox.minX,
      minY: viewBox.minY,
      maxX: viewBox.minX + viewBox.width,
      maxY: viewBox.minY + viewBox.height,
    };
    let pad = 20;

    if (pathBbox) {
      targetBbox = pathBbox;
      pad = Math.max(30, Math.min(w, h) * 0.08); // extra padding for paths
    }

    const bboxW = targetBbox.maxX - targetBbox.minX;
    const bboxH = targetBbox.maxY - targetBbox.minY;

    const scale = clamp(
      Math.min((w - 2 * pad) / Math.max(1, bboxW), (h - 2 * pad) / Math.max(1, bboxH)),
      MIN_SCALE,
      MAX_SCALE
    );

    const bboxCenterX = (targetBbox.minX + targetBbox.maxX) / 2;
    const bboxCenterY = (targetBbox.minY + targetBbox.maxY) / 2;

    const x = w / 2 - bboxCenterX * scale;
    const y = h / 2 - bboxCenterY * scale;

    setTransform({ scale, x, y });
  }, [viewBox, pathBbox, activeMap, activeFloor, imgLoaded, setTransform]);

  // Inject Markers, Path, Pins INSIDE the background SVG element
  useEffect(() => {
    const logDebug = (msg: string, data?: any) => {
      const formatted = `[MAP_DEBUG] ${msg} ${data ? JSON.stringify(data) : ''}`;
      console.log(formatted);
      if (typeof window !== 'undefined') {
        (window as any).mapDebugLogs = (window as any).mapDebugLogs || [];
        (window as any).mapDebugLogs.push(formatted);
      }
    };

    logDebug('useEffect triggered', {
      hasMapRef: !!mapRef.current,
      hasSvgContent: !!svgContent,
      targetMapId,
      activeFloorNodesCount: activeFloorNodes.length,
      hasPathD: !!pathD,
    });

    if (!mapRef.current || !svgContent) return;
    const svgElement = mapRef.current.querySelector('svg');
    if (!svgElement) {
      logDebug('svgElement not found inside mapRef');
      return;
    }

    // 1. Clean up previously injected elements
    const cleaned = svgElement.querySelectorAll('.custom-map-element');
    logDebug(`Cleaning up ${cleaned.length} existing custom elements`);
    cleaned.forEach((el) => el.remove());

    // 2. Render path overlay first (so it stays below markers)
    if (pathD) {
      logDebug('Injecting path element', { pathD });
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathD);
      pathEl.setAttribute('class', 'custom-map-element route-line');
      pathEl.setAttribute('fill', 'none');
      pathEl.setAttribute('stroke', '#1a73e8');
      pathEl.setAttribute('stroke-linecap', 'round');
      pathEl.setAttribute('stroke-linejoin', 'round');
      pathEl.setAttribute('stroke-width', '6');
      svgElement.appendChild(pathEl);
    }

    // 3. Render clickable nodes
    logDebug(`Appending ${activeFloorNodes.length} node markers`);
    activeFloorNodes.forEach((node) => {
      const isStart = selectedFrom?.id === node.id;
      const isEnd = selectedTo?.id === node.id;
      const isSelected = isStart || isEnd;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'custom-map-element cursor-pointer group pointer-events-auto');

      // Click callback
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wasDraggingRef.current) return;

        if (!useMapStore.getState().selectedFrom) {
          setSelectedFrom(node);
        } else if (!useMapStore.getState().selectedTo && node.id !== useMapStore.getState().selectedFrom?.id) {
          setSelectedTo(node);
        } else {
          setSelectedFrom(node);
          setSelectedTo(null);
        }
      });

      // Outer pulsing circle if selected
      if (isSelected) {
        const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulseCircle.setAttribute('cx', String(node.x));
        pulseCircle.setAttribute('cy', String(node.y));
        pulseCircle.setAttribute('r', '8');
        pulseCircle.setAttribute('fill', isStart ? '#1a73e8' : '#ea4335');
        pulseCircle.setAttribute('opacity', '0.3');

        const animateR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateR.setAttribute('attributeName', 'r');
        animateR.setAttribute('values', '8;18;8');
        animateR.setAttribute('dur', '2s');
        animateR.setAttribute('repeatCount', 'indefinite');
        pulseCircle.appendChild(animateR);

        const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('values', '0.4;0;0.4');
        animateOpacity.setAttribute('dur', '2s');
        animateOpacity.setAttribute('repeatCount', 'indefinite');
        pulseCircle.appendChild(animateOpacity);

        g.appendChild(pulseCircle);
      }

      // Main inner node circle marker
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(node.x));
      circle.setAttribute('cy', String(node.y));
      circle.setAttribute('r', isSelected ? '10' : '7');

      let fill = '#4a7fa7';
      if (isStart) fill = '#1a73e8';
      else if (isEnd) fill = '#ea4335';

      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute(
        'class',
        `transition-all duration-150 ${!isSelected ? 'opacity-45 hover:opacity-100' : ''}`
      );
      g.appendChild(circle);

      // Larger invisible hover target
      const hoverTarget = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hoverTarget.setAttribute('cx', String(node.x));
      hoverTarget.setAttribute('cy', String(node.y));
      hoverTarget.setAttribute('r', '16');
      hoverTarget.setAttribute('fill', 'transparent');
      hoverTarget.setAttribute('stroke', 'transparent');
      hoverTarget.setAttribute('class', 'stroke-transparent group-hover:stroke-primary/20 stroke-2');
      g.appendChild(hoverTarget);

      svgElement.appendChild(g);
    });

    // 4. Render pins if present
    if (selectedFrom && selectedFrom.map === targetMapId) {
      const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pin.setAttribute('cx', String(selectedFrom.x));
      pin.setAttribute('cy', String(selectedFrom.y));
      pin.setAttribute('fill', '#ffffff');
      pin.setAttribute('r', '5');
      pin.setAttribute('stroke', '#1a73e8');
      pin.setAttribute('stroke-width', '3');
      pin.setAttribute('class', 'custom-map-element pointer-events-none');
      svgElement.appendChild(pin);
    }

    if (selectedTo && selectedTo.map === targetMapId) {
      const pinGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      pinGroup.setAttribute('class', 'custom-map-element pointer-events-none');

      const pinPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pinPath.setAttribute(
        'd',
        `M ${selectedTo.x},${selectedTo.y - 30} L ${selectedTo.x + 15},${selectedTo.y} L ${selectedTo.x},${selectedTo.y + 30} L ${selectedTo.x - 15},${selectedTo.y} Z`
      );
      pinPath.setAttribute('fill', '#ea4335');
      pinGroup.appendChild(pinPath);

      const pinInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pinInner.setAttribute('cx', String(selectedTo.x));
      pinInner.setAttribute('cy', String(selectedTo.y));
      pinInner.setAttribute('fill', '#ffffff');
      pinInner.setAttribute('r', '4');
      pinGroup.appendChild(pinInner);

      svgElement.appendChild(pinGroup);
    }
  }, [
    svgContent,
    activeFloorNodes,
    selectedFrom,
    selectedTo,
    pathD,
    targetMapId,
    setSelectedFrom,
    setSelectedTo,
  ]);

  return (
    <div
      ref={containerRef}
      className="map-bg overflow-hidden flex items-center justify-center relative w-full h-full touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isPanningCursor ? 'none' : 'transform 0.1s ease',
        }}
        className={`w-full h-full relative ${isPanningCursor ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Map Content */}
        {svgContent ? (
          <div
            ref={mapRef}
            className="w-full h-full map-svg transition-opacity duration-300 opacity-85 pointer-events-none"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <img
            alt="University Map"
            className="w-full h-full object-cover transition-opacity duration-300 opacity-60 grayscale-[20%] pointer-events-none"
            src={activeMapUrl}
          />
        )}

        {/* Fallback image case overlay SVG */}
        {!svgContent && imgLoaded && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
          >
            {/* Shortest Path Overlay Route line */}
            {pathD && (
              <path
                d={pathD}
                className="route-line"
                fill="none"
                stroke="#1a73e8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="6"
              />
            )}

            {/* Interactive clickable nodes */}
            {activeFloorNodes.map((node) => {
              const isStart = selectedFrom?.id === node.id;
              const isEnd = selectedTo?.id === node.id;
              const isSelected = isStart || isEnd;

              return (
                <g
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (wasDraggingRef.current) return;
                    if (!selectedFrom) {
                      setSelectedFrom(node);
                    } else if (!selectedTo && node.id !== selectedFrom.id) {
                      setSelectedTo(node);
                    } else {
                      setSelectedFrom(node);
                      setSelectedTo(null);
                    }
                  }}
                  className="cursor-pointer group pointer-events-auto"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 10 : 7}
                    className={`transition-all duration-150 stroke-white stroke-2 ${
                      isStart
                        ? 'fill-[var(--route-from)]'
                        : isEnd
                        ? 'fill-[var(--route-to)]'
                        : 'fill-primary hover:fill-primary-container opacity-45 hover:opacity-100'
                    }`}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    className="fill-transparent stroke-transparent group-hover:stroke-primary/20 stroke-2"
                  />
                </g>
              );
            })}

            {/* Start Selection Pin Marker */}
            {selectedFrom && selectedFrom.map === targetMapId && (
              <circle
                cx={selectedFrom.x}
                cy={selectedFrom.y}
                fill="#ffffff"
                r="5"
                stroke="#1a73e8"
                strokeWidth="3"
              />
            )}

            {/* End Selection Pin Marker */}
            {selectedTo && selectedTo.map === targetMapId && (
              <g>
                <path
                  d={`M ${selectedTo.x},${selectedTo.y - 30} L ${selectedTo.x + 15},${selectedTo.y} L ${selectedTo.x},${selectedTo.y + 30} L ${selectedTo.x - 15},${selectedTo.y} Z`}
                  fill="#ea4335"
                />
                <circle cx={selectedTo.x} cy={selectedTo.y} fill="#ffffff" r="4" />
              </g>
            )}
          </svg>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/85 z-20">
          <div className="animate-spin border-2 border-navy-500 rounded-full w-8 h-8 border-t-transparent" />
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-red-400 text-[13px] font-medium bg-[var(--bg-card)]/90 px-4 py-2 rounded-xl border border-outline-variant/30">
            Failed to load map. Please try again.
          </div>
        </div>
      )}
    </div>
  );
}
