// src/components/ui/MapBox.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ZoomIn, ZoomOut, RotateCcw, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';
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
  stepCount?: number;
  activeStepIndex?: number;
  onPrevStep?: () => void;
  onNextStep?: () => void;
  floors: FloorMap[];
  buildings: Building[];
}

export default function MapBox({
  mapId,
  destination,
  currentLocation,
  isNavigating,
  pathPoints,
  autoFitNonce,
  stepCount = 0,
  activeStepIndex = 0,
  onPrevStep,
  onNextStep,
  floors,
  buildings,
}: MapBoxProps) {
  const prefersReducedMotion = useReducedMotion();

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
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

  const activeFloor = destination?.floor || currentLocation?.floor || null;
  const showFloorPlan = !!mapId && (destination !== null || currentLocation !== null);
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

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="lg:col-span-2"
    >
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-3 sm:p-5 border border-gray-100 min-h-[360px] h-[66svh] sm:h-[600px] lg:h-full lg:min-h-[700px] flex flex-col">
        {/* Map Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <h2 className="text-lg text-gray-900">Campus Map</h2>
          <div className="flex flex-wrap items-center gap-2">
            {shouldShowDestination && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                {destination.building}
              </Badge>
            )}

            {isNavigating && stepCount > 1 ? (
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="accent" className="text-xs">
                  Step {activeStepIndex + 1}/{stepCount}
                </Badge>
                <Button
                  onClick={onPrevStep}
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={!onPrevStep || activeStepIndex <= 0}
                  aria-label="Previous step"
                  title="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onNextStep}
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={!onNextStep || activeStepIndex >= stepCount - 1}
                  aria-label="Next step"
                  title="Next step"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ) : null}

            {isNavigating && ((showFloorPlan && activeFloor !== null) || destination || currentLocation) ? (
              <div className="flex flex-wrap items-center gap-1 sm:ml-2">
                <Button
                  onClick={handleZoomOut}
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={zoom <= 0.5}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleResetZoom}
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  title="Reset zoom and pan"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  onClick={handleZoomIn}
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={zoom >= 5}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={containerRef}
          className="relative w-full flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200"
        >
          {showFloorPlan && mapSrc ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
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
                        stroke="#93c5fd"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.4}
                      />
                      {prefersReducedMotion ? (
                        <polyline
                          points={pathPoints}
                          stroke="#3b82f6"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <motion.polyline
                          points={pathPoints}
                          stroke="#3b82f6"
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
                        fill="#3b82f6"
                        opacity="0.3"
                      />
                      {!prefersReducedMotion ? (
                        <motion.circle
                          cx={destination.x}
                          cy={destination.y}
                          r="8"
                          fill="#3b82f6"
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
                        fill="#3b82f6"
                      />
                      <text
                        x={destination.x}
                        y={destination.y - 25}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#1e40af"
                        fontWeight="bold"
                        className="pointer-events-auto"
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
                        className="pointer-events-auto"
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
        </div>
      </div>
    </motion.div>
  );
}
