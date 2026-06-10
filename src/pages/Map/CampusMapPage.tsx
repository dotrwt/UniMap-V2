// src/pages/Map/CampusMapPage.tsx
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Navigation, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui';
import SearchDestination from '@/components/ui/SearchDestination';
import SearchCurrentLocation from '@/components/ui/SearchCurrentLocation';
import NavigationPanel from '@/components/ui/NavigationPanel';
import QuickAccess from './QuickAccess';
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
  onOpenDeveloperPage: () => void;
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

export default function CampusMapPage({ userName: _userName, onLogout: _onLogout, onOpenDeveloperPage }: CampusMapPageProps) {
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
      <div className="absolute inset-0 w-full h-full z-0">
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
        <div className="h-4 w-[1px] bg-gray-205" />
        <Button
          variant="ghost"
          onClick={onOpenDeveloperPage}
          className="flex items-center gap-1.5 hover:bg-orange-50 hover:text-[#ff602e] rounded-full px-3 py-1.5 h-auto text-xs font-semibold text-gray-700 transition-all duration-200"
        >
          <User className="w-3.5 h-3.5" />
          <span>Developer Page</span>
        </Button>
      </div>

      {/* Floating Search & Route Drawer (Left Side) */}
      <div className="absolute top-6 left-6 z-10 w-[385px] max-h-[calc(100vh-48px)] flex flex-col bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl border border-black/[0.04] overflow-hidden pointer-events-auto">
        {/* Drawer Mini Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff602e]" />
          <span className="text-sm font-bold text-gray-900 tracking-wide">UniMap Navigation</span>
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
              <SearchCurrentLocation
                currentLocation={currentLocation}
                onCurrentLocationSelect={handleCurrentLocationSelect}
                onCurrentLocationClear={handleCurrentLocationClear}
                campusLocations={campusLocations}
              />

              <AnimatePresence initial={false} mode="popLayout">
                {currentLocation ? (
                  <motion.div
                    key="destination-search"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SearchDestination
                      destination={destination}
                      onDestinationSelect={handleDestinationSelect}
                      onDestinationClear={handleDestinationClear}
                      currentLocation={currentLocation}
                      campusLocations={campusLocations}
                      graph={graph}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="destination-hint"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-dashed border-gray-250 bg-gray-50/60 px-4 py-3"
                  >
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      Set your starting location to view and select destinations.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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

          {/* Quick Access List */}
          {!isNavigating && (
            <div className="border-t border-gray-100 pt-4">
              <QuickAccess
                isNavigating={isNavigating}
                onDestinationSelect={handleDestinationSelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
