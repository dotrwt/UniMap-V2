// src/components/ui/MapBox.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ZoomIn, ZoomOut, RotateCcw, Building2, ChevronUp } from 'lucide-react';
import type { FloorMap, Building } from '@/types';
import MainCover from '@/assets/Main_Cover.webp';
import AICover from '@/assets/AI_Cover.webp';

interface Point {
  x: number;
  y: number;
}

interface Bbox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

const mapViewBoxes: Record<string, { width: number; height: number }> = {
  Campus_Map: { width: 1088.7814, height: 659.5655 },
  Main_GF: { width: 848.4096, height: 609.5946 },
  Main_FF: { width: 696.4, height: 576.6927 },
  Main_SF: { width: 743.9135, height: 482.3806 },
  AI_GF: { width: 842, height: 595 },
  AI_FF: { width: 705.6, height: 283.32 },
  AI_SF: { width: 719.4, height: 220.32 },
};

function parsePoints(pointsString: string): Point[] {
  if (!pointsString || typeof pointsString !== 'string') return [];
  return pointsString
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [xStr, yStr] = pair.split(',');
      const x = Number(xStr);
      const y = Number(yStr);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    })
    .filter((p): p is Point => p !== null);
}

function computeBbox(points: Point[]): Bbox | null {
  if (!points || points.length === 0) return null;
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

interface MapBoxProps {
  mapId: string | null;
  destination: any | null;
  currentLocation: any | null;
  isNavigating: boolean;
  pathPoints: string;
  autoFitNonce?: number | null;
  floors: FloorMap[];
  buildings: Building[];
  onMapChange?: (mapId: string) => void;
}

export default function MapBox({
  mapId,
  destination,
  currentLocation,
  isNavigating,
  pathPoints,
  autoFitNonce,
  floors,
  buildings,
  onMapChange,
}: MapBoxProps) {
  const prefersReducedMotion = useReducedMotion();

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isBuildingDropdownOpen, setIsBuildingDropdownOpen] = useState(false);
  const zoomRef = useRef(zoom);
  const panRef = useRef({ x: panX, y: panY });
  const gestureRef = useRef<{
    pointers: Map<number, { x: number; y: number }>;
    dragStart: { pointerId: number; x: number; y: number; panX: number; panY: number } | null;
    pinchStart: { dist: number; zoom: number; panX: number; panY: number; midX: number; midY: number } | null;
    rafId: number;
    pending: { zoom?: number; panX?: number; panY?: number } | null;
  }>({
    pointers: new Map(),
    dragStart: null,
    pinchStart: null,
    rafId: 0,
    pending: null,
  });
  const unmountedRef = useRef(false);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      if (gestureRef.current.rafId) {
        cancelAnimationFrame(gestureRef.current.rafId);
      }
      gestureRef.current.rafId = 0;
      gestureRef.current.pending = null;
      gestureRef.current.pointers.clear();
      gestureRef.current.dragStart = null;
      gestureRef.current.pinchStart = null;
    };
  }, []);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = { x: panX, y: panY };
  }, [panX, panY]);

  useEffect(() => {
    if (!isNavigating) {
      setZoom(1);
      setPanX(0);
      setPanY(0);
    }
  }, [mapId, isNavigating]);

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev * 1.2, 5)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev / 1.2, 0.5)), []);
  const handleResetZoom = useCallback(() => { setZoom(1); setPanX(0); setPanY(0); }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  const commitGestureUpdate = useCallback((next: { zoom?: number; panX?: number; panY?: number }) => {
    gestureRef.current.pending = next;
    if (gestureRef.current.rafId) return;
    gestureRef.current.rafId = requestAnimationFrame(() => {
      if (unmountedRef.current) return;
      const pending = gestureRef.current.pending;
      gestureRef.current.pending = null;
      gestureRef.current.rafId = 0;
      if (!pending) return;

      if (pending.zoom != null) setZoom(pending.zoom);
      if (pending.panX != null) setPanX(pending.panX);
      if (pending.panY != null) setPanY(pending.panY);
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el?.setPointerCapture) el.setPointerCapture(e.pointerId);

    const pointers = gestureRef.current.pointers;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      gestureRef.current.dragStart = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      gestureRef.current.pinchStart = null;
      return;
    }

    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      gestureRef.current.pinchStart = {
        dist,
        zoom: zoomRef.current,
        panX: panRef.current.x,
        panY: panRef.current.y,
        midX,
        midY,
      };
      gestureRef.current.dragStart = null;
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const pointers = gestureRef.current.pointers;
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2 && gestureRef.current.pinchStart) {
      const [a, b] = Array.from(pointers.values());
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;

      const start = gestureRef.current.pinchStart;
      const ratio = dist / start.dist;
      const nextZoom = Math.max(0.5, Math.min(5, start.zoom * ratio));
      const scaleRatio = nextZoom / start.zoom;

      const nextPanX = start.panX * scaleRatio + midX * (1 - scaleRatio);
      const nextPanY = start.panY * scaleRatio + midY * (1 - scaleRatio);

      commitGestureUpdate({ zoom: nextZoom, panX: nextPanX, panY: nextPanY });
      return;
    }

    if (pointers.size === 1 && gestureRef.current.dragStart) {
      const start = gestureRef.current.dragStart;
      if (start.pointerId !== e.pointerId) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      commitGestureUpdate({ panX: start.panX + dx, panY: start.panY + dy });
    }
  }, [commitGestureUpdate]);

  const handlePointerUpOrCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const pointers = gestureRef.current.pointers;
    if (pointers.has(e.pointerId)) pointers.delete(e.pointerId);

    if (pointers.size === 1) {
      const remainingId = Array.from(pointers.keys())[0];
      const remaining = pointers.get(remainingId);
      if (remaining) {
        gestureRef.current.dragStart = {
          pointerId: remainingId,
          x: remaining.x,
          y: remaining.y,
          panX: panRef.current.x,
          panY: panRef.current.y,
        };
      }
      gestureRef.current.pinchStart = null;
    } else if (pointers.size === 0) {
      gestureRef.current.dragStart = null;
      gestureRef.current.pinchStart = null;
    }
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastAutoFitRef = useRef<number | null | undefined>(null);

  const showFloorPlan = !!mapId;
  const shouldShowDestination = !!destination && destination.map === mapId;
  const shouldShowCurrentLocation = !!currentLocation && currentLocation.map === mapId;

  // Resolve Cloudinary Map URL dynamically from the floors data array
  const mapSrc = useMemo(() => {
    if (!mapId) return '';
    const floorMeta = floors.find((f) => f.map === mapId);
    return floorMeta?.svgUrl || '';
  }, [mapId, floors]);

  const viewBoxConfig = (mapId ? mapViewBoxes[mapId] : null) ?? mapViewBoxes.Main_GF;
  const svgWidth = viewBoxConfig.width;
  const svgHeight = viewBoxConfig.height;

  const pathBbox = useMemo(() => {
    if (!isNavigating || !pathPoints) return null;
    const pts = parsePoints(pathPoints);
    return computeBbox(pts);
  }, [isNavigating, pathPoints]);

  useEffect(() => {
    if (!isNavigating) return;
    if (!pathBbox) return;
    if (autoFitNonce == null) return;
    if (lastAutoFitRef.current === autoFitNonce) return;

    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!(w > 0 && h > 0)) return;

    const baseScale = Math.min(w / svgWidth, h / svgHeight) || 1;
    const offsetX = (w - svgWidth * baseScale) / 2;
    const offsetY = (h - svgHeight * baseScale) / 2;

    const minX = pathBbox.minX * baseScale + offsetX;
    const maxX = pathBbox.maxX * baseScale + offsetX;
    const minY = pathBbox.minY * baseScale + offsetY;
    const maxY = pathBbox.maxY * baseScale + offsetY;

    const bboxW = Math.max(1, maxX - minX);
    const bboxH = Math.max(1, maxY - minY);
    const pad = Math.max(24, Math.min(w, h) * 0.06);
    const availW = Math.max(1, w - 2 * pad);
    const availH = Math.max(1, h - 2 * pad);

    const nextZoom = Math.max(0.5, Math.min(5, Math.min(availW / bboxW, availH / bboxH)));

    const bboxCenterX = (minX + maxX) / 2;
    const bboxCenterY = (minY + maxY) / 2;
    const centerX = w / 2;
    const centerY = h / 2;

    const nextPanX = -nextZoom * (bboxCenterX - centerX);
    const nextPanY = -nextZoom * (bboxCenterY - centerY);

    lastAutoFitRef.current = autoFitNonce;
    setZoom(nextZoom);
    setPanX(nextPanX);
    setPanY(nextPanY);
  }, [autoFitNonce, isNavigating, pathBbox, svgHeight, svgWidth]);

  // Resolve current building floors
  const activeFloorMeta = useMemo(() => floors.find((f) => f.map === mapId), [floors, mapId]);
  const activeBuildingId = activeFloorMeta?.building || null;
  
  const activeBuildingName = useMemo(() => {
    if (mapId === 'Campus_Map') return 'Campus Map';
    const b = buildings.find((x) => x.id === activeBuildingId);
    return b ? b.name : 'Campus Map';
  }, [mapId, buildings, activeBuildingId]);

  const buildingFloors = useMemo(() => {
    if (!activeBuildingId || activeBuildingId === 'campus') return [];
    return floors
      .filter((f) => f.building === activeBuildingId)
      .sort((a, b) => a.floor - b.floor);
  }, [floors, activeBuildingId]);

  const handleSelectBuilding = useCallback(
    (buildingId: string | 'campus') => {
      setIsBuildingDropdownOpen(false);
      if (buildingId === 'campus') {
        onMapChange?.('Campus_Map');
      } else {
        const bFloors = floors.filter((f) => f.building === buildingId).sort((a, b) => a.floor - b.floor);
        if (bFloors.length > 0) {
          onMapChange?.(bFloors[0].map);
        }
      }
    },
    [floors, onMapChange]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full relative"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full bg-[#fcfaf6] overflow-hidden"
      >
        {showFloorPlan && mapSrc ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-0"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrCancel}
            onPointerCancel={handlePointerUpOrCancel}
            style={{
              transform: `scale(${zoom}) translate3d(${panX / zoom}px, ${panY / zoom}px, 0)`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={mapSrc}
                alt={mapId || 'Map'}
                className="w-full h-full object-contain pointer-events-none select-none"
                decoding="async"
              />

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ mixBlendMode: 'normal' }}
              >
                {isNavigating && pathPoints && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <polyline
                      points={pathPoints}
                      stroke="#ff602e"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.2}
                    />
                    {prefersReducedMotion ? (
                      <polyline
                        points={pathPoints}
                        stroke="#ff602e"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <motion.polyline
                        points={pathPoints}
                        stroke="#ff602e"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </motion.g>
                )}

                {shouldShowDestination && destination.x !== undefined && destination.y !== undefined && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      transform: `scale(${1 / zoom})`,
                      transformOrigin: `${destination.x}px ${destination.y - 10}px`
                    }}
                  >
                    <circle
                      cx={destination.x}
                      cy={destination.y}
                      r="8"
                      fill="#ff602e"
                      opacity="0.3"
                    />
                    {!prefersReducedMotion ? (
                      <motion.circle
                        cx={destination.x}
                        cy={destination.y}
                        r="8"
                        fill="#ff602e"
                        opacity="0.3"
                        animate={{
                          r: [8, 16, 8],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2
                        }}
                      />
                    ) : null}
                    <circle
                      cx={destination.x}
                      cy={destination.y}
                      r="3"
                      fill="#ff602e"
                    />
                    <text
                      x={destination.x}
                      y={destination.y - 25}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#7c2d12"
                      fontWeight="bold"
                      className="pointer-events-auto select-none"
                    >
                      {destination.name}
                    </text>
                  </motion.g>
                )}

                {shouldShowCurrentLocation && currentLocation.x !== undefined && currentLocation.y !== undefined && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      transform: `scale(${1 / zoom})`,
                      transformOrigin: `${currentLocation.x}px ${currentLocation.y - 10}px`
                    }}
                  >
                    <circle
                      cx={currentLocation.x}
                      cy={currentLocation.y}
                      r="8"
                      fill="#10b981"
                      opacity="0.3"
                    />
                    {!prefersReducedMotion ? (
                      <motion.circle
                        cx={currentLocation.x}
                        cy={currentLocation.y}
                        r="8"
                        fill="#10b981"
                        opacity="0.3"
                        animate={{
                          r: [8, 16, 8],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5
                        }}
                      />
                    ) : null}
                    <circle
                      cx={currentLocation.x}
                      cy={currentLocation.y}
                      r="3"
                      fill="#10b981"
                    />
                    <text
                      x={currentLocation.x}
                      y={currentLocation.y - 25}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#059669"
                      fontWeight="bold"
                      className="pointer-events-auto select-none"
                    >
                      You are here
                    </text>
                  </motion.g>
                )}
              </svg>
            </div>
          </motion.div>
        ) : (
          <div className="absolute inset-0 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full">
              {buildings.map((building, idx) => {
                const buildingImage = building.id === 'main' ? MainCover : building.id === 'ai' ? AICover : '';
                return (
                  <motion.div
                    key={building.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * idx }}
                    className="relative rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all overflow-hidden"
                  >
                    {buildingImage ? (
                      <img
                        src={buildingImage}
                        alt={`${building.name}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <p className="text-xs truncate">{building.name}</p>
                      <p className="text-xs opacity-90">{building.floors} floors</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Map Controls overlay (Bottom Right) */}
        {mapId && (
          <div className="absolute bottom-6 right-6 z-20 flex items-end gap-3 pointer-events-none select-none">
            {/* Building & Floor Selector */}
            <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-black/[0.04] p-1.5 gap-1.5 pointer-events-auto relative">
              {/* Building Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setIsBuildingDropdownOpen(!isBuildingDropdownOpen)}
                  className="px-3.5 h-10 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] transition-all duration-200"
                >
                  <Building2 className="w-4 h-4 text-[#ff602e]" />
                  <span>{activeBuildingName}</span>
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isBuildingDropdownOpen && (
                  <div className="absolute bottom-full mb-2 right-0 w-40 bg-white rounded-xl shadow-xl border border-black/[0.04] p-1.5 flex flex-col gap-0.5 z-30">
                    <button
                      onClick={() => handleSelectBuilding('campus')}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                        mapId === 'Campus_Map'
                          ? 'bg-orange-50 text-[#ff602e]'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-[#ff602e]'
                      }`}
                    >
                      Campus Map
                    </button>
                    {buildings.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBuilding(b.id)}
                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                          activeBuildingId === b.id
                            ? 'bg-orange-50 text-[#ff602e]'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-[#ff602e]'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Buttons (Horizontal) */}
              {buildingFloors.length > 0 && (
                <>
                  <div className="h-6 w-[1px] bg-gray-200" />
                  <div className="flex items-center gap-1">
                    {buildingFloors.map((f) => {
                      const isActive = f.map === mapId;
                      const label = f.floor === 0 ? 'G' : `F${f.floor}`;
                      return (
                        <button
                          key={f.map}
                          onClick={() => onMapChange?.(f.map)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                            isActive
                              ? 'bg-[#ff602e] text-white shadow-md shadow-orange-500/20'
                              : 'text-gray-700 hover:bg-orange-50 hover:text-[#ff602e]'
                          }`}
                          title={f.label}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Zoom & Recenter Control Stack */}
            <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-black/[0.04] p-1.5 gap-1.5 pointer-events-auto">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] transition-all duration-200"
                disabled={zoom >= 5}
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <button
                onClick={handleZoomOut}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] transition-all duration-200"
                disabled={zoom <= 0.5}
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              <div className="h-[1px] bg-gray-100 mx-1" />

              <button
                onClick={handleResetZoom}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] transition-all duration-200"
                title="Reset Zoom & Center"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
