// src/pages/Map/CampusMapPage.tsx
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Navigation, ArrowRight, Menu, ArrowUpDown, School, Flame, BookOpen, Compass, ArrowLeft, X, MapPin, CornerUpRight, CornerUpLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui';
import SearchDestination from '@/components/ui/SearchDestination';
import SearchCurrentLocation from '@/components/ui/SearchCurrentLocation';
import NavigationPanel from '@/components/ui/NavigationPanel';
import MapBox from '@/components/ui/MapBox';
import logoWebp from '@/assets/UNIMAP.webp';
import clgLogo from '@/assets/clg_logo.webp';
import { fetchNodes, fetchEdges, fetchBuildings, fetchFloors } from '@/lib/api';
import { computeMultiMapRouteAsync, buildNodesMap, buildGlobalGraph } from '@/lib/multiMapNavigation';
import type { NavigationStep } from '@/lib/multiMapNavigation';
import { buildUndirectedEdgeIndex } from '@/lib/navigation_instructions';
import { buildNavigationStepViewModel } from './services/navigationStepService';
import type { MapNode, MapEdge, Building, FloorMap } from '@/types';

interface CampusMapPageProps {
  userName?: string;
  onLogout?: () => void;
}

// Room Name Parser helper
const CATEGORIES: Array<[RegExp, string]> = [
  [/Lab/i, 'Lab'],
  [/Office|Dean|HOD|Department|Dr\.|Prof\.|Ar\./i, 'Office'],
  [/Studio/i, 'Studio'],
  [/LT-|Lecture/i, 'Classroom'],
  [/Washroom/i, 'Washroom'],
  [/SH-|^PL-/, 'Common'],
  [/Centre|Center/i, 'Facility']
];

const parseRoomName = (nodeId: string) => ({
  name: nodeId.replace(/^[A-Z0-9]+_/, '').replace(/_/g, ' '),
  category: CATEGORIES.find(([re]) => re.test(nodeId))?.[1] ?? 'Room'
});

export default function CampusMapPage({ userName: _userName, onLogout: _onLogout }: CampusMapPageProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Database datasets
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [edges, setEdges] = useState<MapEdge[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<FloorMap[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile UI States
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'start' | 'dest' | null>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation state
  const [destination, setDestination] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isComputingRoute, setIsComputingRoute] = useState(false);
  const [pathPoints, setPathPoints] = useState('');
  const [navigationDirections, setNavigationDirections] = useState<any[]>([]);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoFitNonce, setAutoFitNonce] = useState(0);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const unmountedRef = useRef(false);
  const routeAbortRef = useRef<AbortController | null>(null);
  const routeRequestIdRef = useRef(0);

  // Load datasets from backend APIs
  useEffect(() => {
    let active = true;
    Promise.all([
      fetchNodes(),
      fetchEdges(),
      fetchBuildings(),
      fetchFloors()
    ]).then(([fetchedNodes, fetchedEdges, fetchedBuildings, fetchedFloors]) => {
      if (!active) return;
      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      setBuildings(fetchedBuildings);
      setFloors(fetchedFloors);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load map data from APIs", err);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      unmountedRef.current = true;
      routeAbortRef.current?.abort();
      routeAbortRef.current = null;
    };
  }, []);

  // Compute lookup structures
  const nodesMap = useMemo(() => buildNodesMap(nodes), [nodes]);
  const graph = useMemo(() => buildGlobalGraph(edges), [edges]);
  const edgeIndex = useMemo(() => buildUndirectedEdgeIndex(edges), [edges]);

  // Compute searchable location objects
  const campusLocations = useMemo(() => {
    const mapsById = Object.fromEntries(floors.map((m) => [m.map, m]));
    const buildingsById = Object.fromEntries(buildings.map((b) => [b.id, b]));

    return nodes
      .filter((n) => n.type !== 'corridor' && n.type !== 'junction')
      .map((n) => {
        const parsed = parseRoomName(n.id);
        const mapMeta = n.map ? mapsById[n.map] : null;
        const buildingMeta = mapMeta && mapMeta.building ? buildingsById[mapMeta.building] : null;

        const name = n.name || parsed.name;
        const searchName = String(name || '').toLowerCase();

        return {
          id: n.id,
          name,
          searchName,
          map: n.map || null,
          building: buildingMeta?.name || (mapMeta?.building === 'campus' ? 'Campus' : 'MITS - DU'),
          floor: typeof mapMeta?.floor === 'number' ? mapMeta.floor : null,
          category: parsed.category,
          x: n.x,
          y: n.y,
        };
      });
  }, [nodes, floors, buildings]);

  const handleDestinationSelect = useCallback((location: any) => {
    if (isNavigating || isComputingRoute) {
      routeAbortRef.current?.abort();
      setIsNavigating(false);
      setIsComputingRoute(false);
      setPathPoints('');
      setNavigationDirections([]);
    }
    setDestination(location);
    setSelectedMapId(null);
  }, [isNavigating, isComputingRoute]);

  const handleResetNavigation = useCallback(() => {
    routeAbortRef.current?.abort();
    routeAbortRef.current = null;
    setIsNavigating(false);
    setIsComputingRoute(false);
    setDestination(null);
    setCurrentLocation(null);
    setPathPoints('');
    setNavigationDirections([]);
    setNavigationSteps([]);
    setActiveStepIndex(0);
    setAutoFitNonce((n) => n + 1);
    setSelectedMapId(null);
  }, []);

  const handleDestinationClear = useCallback(() => {
    setDestination(null);
    setSelectedMapId(null);
    if (isNavigating || isComputingRoute) {
      handleResetNavigation();
    }
  }, [isNavigating, isComputingRoute, handleResetNavigation]);

  const handleCurrentLocationSelect = useCallback((location: any) => {
    if (isNavigating || isComputingRoute) {
      routeAbortRef.current?.abort();
      setIsNavigating(false);
      setIsComputingRoute(false);
      setPathPoints('');
      setNavigationDirections([]);
    }
    setCurrentLocation(location);
    setSelectedMapId(null);
  }, [isNavigating, isComputingRoute]);

  const handleCurrentLocationClear = useCallback(() => {
    setCurrentLocation(null);
    setDestination(null);
    setSelectedMapId(null);
    if (isNavigating || isComputingRoute) {
      handleResetNavigation();
    }
  }, [isNavigating, isComputingRoute, handleResetNavigation]);

  const handleSwapLocations = useCallback(() => {
    const temp = currentLocation;
    setCurrentLocation(destination);
    setDestination(temp);
    setSelectedMapId(null);
    if (isNavigating || isComputingRoute) {
      setPathPoints('');
      setNavigationDirections([]);
      setNavigationSteps([]);
      setIsNavigating(false);
    }
  }, [currentLocation, destination, isNavigating, isComputingRoute]);

  const activateStep = useCallback(
    (step: NavigationStep) => {
      const { pathPoints, navigationDirections } = buildNavigationStepViewModel(
        step,
        nodesMap,
        edgeIndex
      );
      setPathPoints(pathPoints);
      setNavigationDirections(navigationDirections);
    },
    [nodesMap, edgeIndex]
  );

  const handleStartNavigation = useCallback(async () => {
    if (!destination || !currentLocation) return;

    setIsComputingRoute(true);
    const requestId = ++routeRequestIdRef.current;
    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;

    try {
      const result = await computeMultiMapRouteAsync(
        nodes,
        edges,
        currentLocation.id,
        destination.id,
        {
          signal: controller.signal,
          yieldEvery: 2000,
          includeFullPath: false,
          nodesMap,
          graph,
        }
      );

      if (controller.signal.aborted || requestId !== routeRequestIdRef.current) return;

      if (!result || !result.steps || result.steps.length === 0) {
        setPathPoints('');
        setNavigationDirections([
          {
            direction: 'straight',
            instruction: 'No path found between these locations',
            distance: '',
          },
        ]);
        setNavigationSteps([]);
        setIsNavigating(true);
        return;
      }

      setNavigationSteps(result.steps);
      setActiveStepIndex(0);
      setIsNavigating(true);
      activateStep(result.steps[0]);
      setAutoFitNonce((n) => n + 1);
    } finally {
      if (requestId === routeRequestIdRef.current) {
        setIsComputingRoute(false);
      }
    }
  }, [destination, currentLocation, nodes, edges, nodesMap, graph, activateStep]);





  const activeStep = navigationSteps[activeStepIndex] || null;
  const activeMapId =
    selectedMapId ||
    (isNavigating && activeStep?.map) ||
    currentLocation?.map ||
    destination?.map ||
    'Campus_Map';

  const filteredSuggestions = useMemo(() => {
    const q = mobileSearchQuery.trim().toLowerCase();
    if (!q) return campusLocations.slice(0, 10);
    return campusLocations.filter(loc =>
      (loc.searchName ?? loc.name.toLowerCase()).includes(q)
    );
  }, [mobileSearchQuery, campusLocations]);

  const renderDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'right':
        return <CornerUpRight className="w-4 h-4 text-blue-600" />;
      case 'left':
        return <CornerUpLeft className="w-4 h-4 text-blue-600" />;
      case 'up':
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-blue-600" />;
      case 'straight':
      default:
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#ff602e] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-650 text-sm font-semibold">Loading campus navigation...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    const isRouteActive = destination && currentLocation;

    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#fcfaf6] select-none flex flex-col">
        {/* Full Screen Interactive Map Canvas */}
        <div className="flex-1 relative w-full h-full z-0">
          <MapBox
            mapId={activeMapId}
            destination={destination}
            currentLocation={currentLocation}
            isNavigating={isNavigating}
            pathPoints={pathPoints}
            autoFitNonce={autoFitNonce}
            floors={floors}
            buildings={buildings}
            onMapChange={setSelectedMapId}
          />
        </div>

        {/* Floating Search Bar / Capsule (Top) */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2">
          {!isRouteActive ? (
            /* Single Search Bar (When no route is active) */
            <div className="bg-white rounded-2xl shadow-lg border border-black/5 p-3.5 flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-3 w-40 bg-white rounded-xl shadow-xl border border-black/[0.04] p-1.5 flex flex-col gap-0.5 z-30"
                    >
                      <button
                        onClick={() => {
                          navigate('/');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors cursor-pointer"
                      >
                        Home
                      </button>
                      <button
                        onClick={() => {
                          navigate('/support');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors cursor-pointer"
                      >
                        Support
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                onClick={() => setActiveSearchField('dest')}
                className="flex-1 flex items-center gap-2 cursor-pointer text-gray-400"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold">Search destination room, lab, washroom...</span>
              </div>
            </div>
          ) : (
            /* Dual Stacked Capsule (When route is active) */
            <div className="bg-white rounded-2xl shadow-lg border border-black/5 p-3 flex items-center gap-3">
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-700 transition-colors cursor-pointer"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-3 w-40 bg-white rounded-xl shadow-xl border border-black/[0.04] p-1.5 flex flex-col gap-0.5 z-30"
                    >
                      <button
                        onClick={() => {
                          navigate('/');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors cursor-pointer"
                      >
                        Home
                      </button>
                      <button
                        onClick={() => {
                          navigate('/support');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors cursor-pointer"
                      >
                        Support
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stacked inputs */}
              <div className="flex-1 flex flex-col gap-1.5 relative py-1">
                {/* From Input */}
                <div
                  onClick={() => setActiveSearchField('start')}
                  className="flex items-center bg-[#f1f3f4] rounded-xl px-3 py-1.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white mr-2 flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-800 truncate">
                    {currentLocation?.name || 'Choose starting point...'}
                  </span>
                </div>

                {/* To Input */}
                <div
                  onClick={() => setActiveSearchField('dest')}
                  className="flex items-center bg-[#f1f3f4] rounded-xl px-3 py-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500 mr-1.5 flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-800 truncate">
                    {destination?.name || 'Choose destination...'}
                  </span>
                </div>

                {/* Connector Line */}
                <div className="absolute left-[13px] top-[22px] bottom-[22px] w-[2px] bg-gray-300 pointer-events-none" />
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwapLocations}
                className="w-10 h-10 rounded-full bg-[#f1f3f4] hover:bg-orange-50 hover:text-[#ff602e] flex items-center justify-center text-gray-500 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Swap locations"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Search Overlay Modal */}
        <AnimatePresence>
          {activeSearchField !== null && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-50 bg-[#fcfaf6] flex flex-col p-4"
            >
              {/* Header with Back and search input */}
              <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md border border-black/5 p-2 mb-4">
                <button
                  onClick={() => {
                    setActiveSearchField(null);
                    setMobileSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-655 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <input
                  autoFocus
                  type="text"
                  placeholder={activeSearchField === 'start' ? "Search starting point..." : "Search destination..."}
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-sm font-semibold text-gray-800 py-1"
                />
                {mobileSearchQuery && (
                  <button
                    onClick={() => setMobileSearchQuery('')}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((location) => {
                    return (
                      <button
                        key={location.id}
                        onClick={() => {
                          if (activeSearchField === 'start') {
                            handleCurrentLocationSelect(location);
                          } else {
                            handleDestinationSelect(location);
                          }
                          setActiveSearchField(null);
                          setMobileSearchQuery('');
                        }}
                        className="w-full bg-white px-4 py-3 rounded-2xl border border-black/[0.03] shadow-sm hover:bg-orange-50/55 flex items-start gap-3 text-left transition-all cursor-pointer"
                      >
                        <div className="p-2 bg-orange-50 text-[#ff602e] rounded-xl">
                          <School className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{location.name}</p>
                          <p className="text-xs text-gray-400 font-semibold mt-0.5">
                            {location.building} • Floor {location.floor === 0 ? 'G' : `F${location.floor}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-[#ff602e] bg-orange-50 px-2 py-1 rounded-md shrink-0">
                          {location.category}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs font-semibold text-gray-400">
                    No matching locations found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Sheet Drawer */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] border-t border-black/5 z-30 transition-transform duration-300 ease-out flex flex-col ${
            isBottomSheetExpanded ? 'translate-y-0 h-[80vh]' : 'translate-y-[calc(80vh-140px)] h-[80vh]'
          }`}
        >
          {/* Drag Handle */}
          <div
            onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
            className="w-full py-3 flex justify-center cursor-pointer select-none"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {isRouteActive ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Route Summary */}
              <div className="px-6 pb-4 flex items-center justify-between">
                <div
                  onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-gray-900">
                      {isComputingRoute ? 'Computing...' : '4 mins'}
                    </span>
                    <span className="text-sm font-bold text-gray-400">
                      (320m)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-green-600 mt-0.5">
                    Fastest route via Main Atrium
                  </p>
                </div>

                {/* Share Button */}
                <button className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer">
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l4.646-2.323m0 7.162l-4.646-2.323M21 12a3 3 0 11-6 0 3 3 0 016 0zm-11-7a3 3 0 11-6 0 3 3 0 016 0zm0 14a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Step list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 border-t border-gray-100">
                {navigationDirections.length > 0 ? (
                  <div className="relative pl-8 space-y-6">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-[15px] top-4 bottom-8 w-[2px] bg-blue-100 pointer-events-none" />

                    {navigationDirections.map((step, idx) => {
                      const isLast = idx === navigationDirections.length - 1;
                      return (
                        <div key={idx} className="relative flex flex-col gap-1">
                          {/* Step Icon */}
                          <div className={`absolute -left-[32px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            isLast ? 'bg-red-50 border border-red-100 text-red-500' : 'bg-blue-50 border border-blue-100 text-blue-600'
                          }`}>
                            {isLast ? <MapPin className="w-4 h-4" /> : renderDirectionIcon(step.direction)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-snug">
                              {step.instruction}
                            </p>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                              {step.distance}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs font-semibold text-gray-400">
                    No steps generated. Tap Start Navigation to compute path.
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!isNavigating) {
                      handleStartNavigation();
                    } else {
                      handleResetNavigation();
                    }
                  }}
                  className="flex-1 h-12 rounded-2xl bg-[#2f55d4] hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4 fill-white" />
                  {isNavigating ? 'End Navigation' : 'Start Navigation'}
                </button>
                <button
                  onClick={handleResetNavigation}
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-blue-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden px-6">
              {/* Collapsed/Empty Route Mode: Popular spots preview */}
              <div className="pb-3 select-none">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Explore Campus</h3>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">Select a destination to plan your route</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 py-2">
                {[
                  { id: 'room_J101', name: 'Colloquium', map: 'Main_FF', x: 341.3025, y: 489.9517, building: 'Main', floor: 1, category: 'Academic', desc: 'Conference Hall', color: 'bg-yellow-500/10 text-yellow-600', icon: BookOpen },
                  { id: 'room_J001', name: 'Conclave', map: 'Main_GF', x: 406.8033, y: 487.5583, building: 'Main', floor: 0, category: 'Academic', desc: 'Seminar Room', color: 'bg-orange-500/10 text-orange-600', icon: School },
                  { id: 'room_J102', name: 'SH-7', map: 'Main_FF', x: 156.9493, y: 469.9952, building: 'Main', floor: 1, category: 'Academic', desc: 'Lecture Hall 7', color: 'bg-cyan-500/10 text-cyan-600', icon: Flame },
                  { id: 'Jubilee_Gate', name: 'Jubilee Gate', map: 'Campus_Map', x: 749.9669, y: 127.5277, building: 'Campus', floor: 0, category: 'Gate', desc: 'Main Campus Entrance', color: 'bg-blue-500/10 text-blue-600', icon: Compass }
                ].map((loc) => {
                  const Icon = loc.icon;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        handleDestinationSelect(loc);
                        // default current location if empty
                        if (!currentLocation) {
                          const defaultStart = campusLocations.find(l => l.id === 'Jubilee_Gate') || {
                            id: 'room_J001',
                            name: 'Conclave',
                            searchName: 'conclave',
                            map: 'Main_GF',
                            building: 'Main',
                            floor: 0,
                            category: 'Academic',
                            x: 406.8033,
                            y: 487.5583,
                          };
                          handleCurrentLocationSelect(defaultStart);
                        }
                      }}
                      className="w-full bg-white border border-black/5 hover:border-orange-200 rounded-2xl p-3 shadow-sm flex items-center gap-3 transition-all text-left active:scale-[0.98] cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-xl ${loc.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{loc.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{loc.desc}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {loc.building} • F{loc.floor}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#fcfaf6] select-none flex flex-col">
      {/* Full Screen Interactive Map Canvas */}
      <div className="flex-1 relative w-full h-full z-0">
        <MapBox
          mapId={activeMapId}
          destination={destination}
          currentLocation={currentLocation}
          isNavigating={isNavigating}
          pathPoints={pathPoints}
          autoFitNonce={autoFitNonce}
          floors={floors}
          buildings={buildings}
          onMapChange={setSelectedMapId}
        />
      </div>

      {/* Floating Header Capsule (Top Right) */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-4 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-black/[0.04]">
        <div className="flex items-center gap-2">
          <img src={clgLogo} alt="College Logo" className="h-8 w-auto" decoding="async" />
          <span className="text-gray-300 text-sm">×</span>
          <img src={logoWebp} alt="UniMap Logo" className="h-8 w-auto" decoding="async" />
        </div>
        <div className="h-4 w-[1px] bg-gray-200" />
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-50 hover:text-[#ff602e] text-gray-700 transition-all duration-200 pointer-events-auto cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-3.5 w-32 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-black/[0.04] p-1.5 flex flex-col gap-0.5 z-20 pointer-events-auto"
              >
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    navigate('/support');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors cursor-pointer"
                >
                  Support
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Search & Route Drawer (Left Side) */}
      <div className="absolute top-6 left-6 z-10 w-[385px] h-[calc(100vh-48px)] flex flex-col bg-gradient-to-b from-white/95 via-white/95 to-[#faf8f5]/98 backdrop-blur-md rounded-[24px] shadow-2xl border border-black/[0.04] overflow-hidden pointer-events-auto">
        {/* Drawer Mini Header */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-[#ff602e]/5 to-[#ff7b52]/5">
          <span className="text-base font-black text-gray-900 tracking-wider uppercase">UniMap Navigation</span>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Search Inputs Card */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-4.5 h-4.5 text-[#ff602e]" />
              Plan Your Route
            </h2>

            <div className="space-y-4">
            <div className="relative flex items-center">
              <div className="flex-1 space-y-4 pr-10">
                <SearchCurrentLocation
                  currentLocation={currentLocation}
                  onCurrentLocationSelect={handleCurrentLocationSelect}
                  onCurrentLocationClear={handleCurrentLocationClear}
                  campusLocations={campusLocations}
                />

                <SearchDestination
                  destination={destination}
                  onDestinationSelect={handleDestinationSelect}
                  onDestinationClear={handleDestinationClear}
                  currentLocation={currentLocation}
                  campusLocations={campusLocations}
                  graph={graph}
                />
              </div>

              <button
                type="button"
                onClick={handleSwapLocations}
                className="absolute right-0 top-[54%] -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#ff602e] hover:border-orange-300 transition-all duration-200 z-10 pointer-events-auto cursor-pointer"
                title="Swap locations"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {destination && currentLocation && !isNavigating && !isComputingRoute && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Button
                    onClick={handleStartNavigation}
                    className="w-full h-11 rounded-xl bg-[#ff602e] hover:bg-[#ff7b52] text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 group font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1" />
                    Start Navigation
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>

          {/* Navigation Panel */}
          {isNavigating && (
            <div className="border-t border-gray-100 pt-4">
              <NavigationPanel
                isNavigating={isNavigating}
                navigationDirections={navigationDirections}
                onResetNavigation={handleResetNavigation}
              />
            </div>
          )}

          {/* Welcome Guide & Popular spots (only visible when not navigating) */}
          {!isNavigating && (
            <>
              {/* Campus Guide Card */}
              <div className="bg-gradient-to-br from-[#ff602e]/10 to-[#ff7b52]/5 border border-[#ff602e]/15 rounded-2xl p-4 flex items-start gap-3.5 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="w-9 h-9 rounded-xl bg-[#ff602e]/10 text-[#ff602e] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Campus Explorer</h4>
                  <p className="text-[10px] text-gray-500 leading-normal mt-1">
                    Search rooms, pan the map freely, or select popular highlights below to quickly preview indoor routing and navigation.
                  </p>
                </div>
              </div>

              {/* Popular Spots Grid */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Popular Destinations</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'room_J101', name: 'Colloquium', map: 'Main_FF', x: 341.3025, y: 489.9517, building: 'Main', floor: 1, category: 'Academic', desc: 'Conference Hall', color: 'bg-yellow-500/10 text-yellow-600', icon: BookOpen },
                    { id: 'room_J001', name: 'Conclave', map: 'Main_GF', x: 406.8033, y: 487.5583, building: 'Main', floor: 0, category: 'Academic', desc: 'Seminar Room', color: 'bg-orange-500/10 text-orange-600', icon: School },
                    { id: 'room_J102', name: 'SH-7', map: 'Main_FF', x: 156.9493, y: 469.9952, building: 'Main', floor: 1, category: 'Academic', desc: 'Lecture Hall 7', color: 'bg-cyan-500/10 text-cyan-600', icon: Flame },
                    { id: 'Jubilee_Gate', name: 'Jubilee Gate', map: 'Campus_Map', x: 749.9669, y: 127.5277, building: 'Campus', floor: 0, category: 'Gate', desc: 'Main Campus Entrance', color: 'bg-blue-500/10 text-blue-600', icon: Compass }
                  ].map((loc) => {
                    const Icon = loc.icon;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleDestinationSelect(loc)}
                        className="bg-white/60 hover:bg-orange-50/25 border border-black/5 hover:border-orange-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 text-left active:scale-[0.98] group pointer-events-auto cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-full ${loc.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#ff602e] transition-colors truncate">{loc.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{loc.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100/60 px-2 py-1 rounded-md">
                            {loc.building} • F{loc.floor}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
