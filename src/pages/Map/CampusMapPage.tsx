// src/pages/Map/CampusMapPage.tsx
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Navigation, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import Header from '@/components/ui/Header';
import SearchDestination from '@/components/ui/SearchDestination';
import SearchCurrentLocation from '@/components/ui/SearchCurrentLocation';
import NavigationPanel from '@/components/ui/NavigationPanel';
import QuickAccess from './QuickAccess';
import MapBox from '@/components/ui/MapBox';
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
  }, []);

  const handleDestinationClear = useCallback(() => {
    setDestination(null);
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
  }, [isNavigating, isComputingRoute]);

  const handleCurrentLocationClear = useCallback(() => {
    setCurrentLocation(null);
    setDestination(null);
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

  const jumpToStep = useCallback((nextIndex: number) => {
    setActiveStepIndex((prevIndex) => {
      const clampedIndex = Math.max(0, Math.min(nextIndex, navigationSteps.length - 1));
      if (clampedIndex === prevIndex) return prevIndex;

      const nextStep = navigationSteps[clampedIndex];
      if (nextStep) {
        activateStep(nextStep);
        setAutoFitNonce((n) => n + 1);
      }
      return clampedIndex;
    });
  }, [activateStep, navigationSteps]);

  const handlePrevStep = useCallback(() => {
    jumpToStep(activeStepIndex - 1);
  }, [activeStepIndex, jumpToStep]);

  const handleNextStep = useCallback(() => {
    jumpToStep(activeStepIndex + 1);
  }, [activeStepIndex, jumpToStep]);

  const activeStep = navigationSteps[activeStepIndex] || null;
  const activeMapId =
    (isNavigating && activeStep?.map) ||
    currentLocation?.map ||
    destination?.map ||
    'Main_GF';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Loading campus data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header onOpenDeveloperPage={onOpenDeveloperPage} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Sidebar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-4 lg:space-y-6"
          >
            {/* Route Planning Card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
              <h2 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
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
                      className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <p className="text-sm text-gray-600">
                        Set your current location to unlock destination search.
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
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl group"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Start Navigation
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Directions Panel */}
            <NavigationPanel
              isNavigating={isNavigating}
              navigationDirections={navigationDirections}
              onResetNavigation={handleResetNavigation}
            />

            {/* Quick Access Panel */}
            <QuickAccess isNavigating={isNavigating} onDestinationSelect={handleDestinationSelect} />
          </motion.div>

          {/* Right Side - Maps */}
          {destination && currentLocation && !isNavigating ? (
            currentLocation.map === destination.map ? (
              <MapBox
                mapId={destination.map}
                destination={destination}
                currentLocation={currentLocation}
                isNavigating={false}
                pathPoints=""
                autoFitNonce={autoFitNonce}
                floors={floors}
                buildings={buildings}
              />
            ) : (
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <MapBox
                  mapId={currentLocation.map}
                  destination={null}
                  currentLocation={currentLocation}
                  isNavigating={false}
                  pathPoints=""
                  autoFitNonce={autoFitNonce}
                  floors={floors}
                  buildings={buildings}
                />
                <MapBox
                  mapId={destination.map}
                  destination={destination}
                  currentLocation={null}
                  isNavigating={false}
                  pathPoints=""
                  autoFitNonce={autoFitNonce}
                  floors={floors}
                  buildings={buildings}
                />
              </div>
            )
          ) : (
            <MapBox
              mapId={activeMapId}
              destination={destination}
              currentLocation={currentLocation}
              isNavigating={isNavigating}
              pathPoints={pathPoints}
              stepCount={navigationSteps.length}
              activeStepIndex={activeStepIndex}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              autoFitNonce={autoFitNonce}
              floors={floors}
              buildings={buildings}
            />
          )}
        </div>
      </main>
    </div>
  );
}
