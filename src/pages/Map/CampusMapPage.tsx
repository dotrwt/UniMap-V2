// src/pages/Map/CampusMapPage.tsx
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Navigation, ArrowRight, Menu, ArrowUpDown, School, Flame, BookOpen, Compass } from 'lucide-react';
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
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-50 hover:text-[#ff602e] text-gray-700 transition-all duration-200 pointer-events-auto"
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
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    navigate('/support');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#ff602e] rounded-lg transition-colors"
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
                className="absolute right-0 top-[54%] -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#ff602e] hover:border-orange-300 transition-all duration-200 z-10 pointer-events-auto"
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
                    className="w-full h-11 rounded-xl bg-[#ff602e] hover:bg-[#ff7b52] text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30 group font-bold text-xs flex items-center justify-center gap-1.5"
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
                        className="bg-white/60 hover:bg-orange-50/25 border border-black/5 hover:border-orange-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 text-left active:scale-[0.98] group pointer-events-auto"
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
