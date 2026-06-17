// src/hooks/useCampusNavigation.tsx
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { fetchNodes, fetchEdges, fetchBuildings, fetchFloors } from '@/lib/api';
import { computeMultiMapRouteAsync, buildNodesMap, buildGlobalGraph } from '@/lib/multiMapNavigation';
import type { NavigationStep } from '@/lib/multiMapNavigation';
import { buildUndirectedEdgeIndex } from '@/lib/navigation_instructions';
import { buildNavigationStepViewModel } from '@/pages/Map/services/navigationStepService';
import type { MapNode, MapEdge, Building, FloorMap } from '@/types';
import { parseRoomName } from '@/lib/roomParser';

// Module-level caches to avoid multiple fetch requests on StrictMode double-mounting
let cachedNodes: MapNode[] | null = null;
let cachedEdges: MapEdge[] | null = null;
let cachedBuildings: Building[] | null = null;
let cachedFloors: FloorMap[] | null = null;
let fetchPromise: Promise<[MapNode[], MapEdge[], Building[], FloorMap[]]> | null = null;

export interface CampusNavigationContextType {
  nodes: MapNode[];
  edges: MapEdge[];
  buildings: Building[];
  floors: FloorMap[];
  loading: boolean;
  isMobile: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isBottomSheetExpanded: boolean;
  setIsBottomSheetExpanded: (expanded: boolean) => void;
  activeSearchField: 'start' | 'dest' | null;
  setActiveSearchField: (field: 'start' | 'dest' | null) => void;
  mobileSearchQuery: string;
  setMobileSearchQuery: (query: string) => void;
  destination: any;
  currentLocation: any;
  isNavigating: boolean;
  isComputingRoute: boolean;
  pathPoints: string;
  navigationDirections: any[];
  navigationSteps: NavigationStep[];
  activeStepIndex: number;
  autoFitNonce: number;
  selectedMapId: string | null;
  activeMapId: string;
  filteredSuggestions: any[];
  handleDestinationSelect: (location: any) => void;
  handleDestinationClear: () => void;
  handleCurrentLocationSelect: (location: any) => void;
  handleCurrentLocationClear: () => void;
  handleResetNavigation: () => void;
  handleSwapLocations: () => void;
  handleStartNavigation: () => Promise<void>;
  setActiveStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedMapId: React.Dispatch<React.SetStateAction<string | null>>;
  campusLocations: any[];
  nodesMap: Record<string, MapNode>;
}

const CampusNavigationContext = createContext<CampusNavigationContextType | undefined>(undefined);

export function CampusNavigationProvider({ children }: { children: React.ReactNode }) {
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

    if (cachedNodes && cachedEdges && cachedBuildings && cachedFloors) {
      setNodes(cachedNodes);
      setEdges(cachedEdges);
      setBuildings(cachedBuildings);
      setFloors(cachedFloors);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = Promise.all([
        fetchNodes(),
        fetchEdges(),
        fetchBuildings(),
        fetchFloors()
      ]).then((data) => {
        cachedNodes = data[0];
        cachedEdges = data[1];
        cachedBuildings = data[2];
        cachedFloors = data[3];
        return data;
      });
    }

    fetchPromise.then(([fetchedNodes, fetchedEdges, fetchedBuildings, fetchedFloors]) => {
      if (!active) return;
      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      setBuildings(fetchedBuildings);
      setFloors(fetchedFloors);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load map data from APIs", err);
      if (active) setLoading(false);
      fetchPromise = null;
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

  // Effect 1: Update SVG/instructions when activeStepIndex changes
  useEffect(() => {
    if (isNavigating && navigationSteps[activeStepIndex]) {
      activateStep(navigationSteps[activeStepIndex]);
      setSelectedMapId(null); // Clear manual map override to snap to the step's map!
      setAutoFitNonce((n) => n + 1);
    }
  }, [activeStepIndex, isNavigating, navigationSteps, activateStep]);

  // Effect 2: Update activeStepIndex if the user manually switches activeMapId
  useEffect(() => {
    if (isNavigating && navigationSteps.length > 0) {
      const currentMapOfStep = navigationSteps[activeStepIndex]?.map;
      if (currentMapOfStep !== activeMapId) {
        const matchingStepIdx = navigationSteps.findIndex(s => s.map === activeMapId);
        if (matchingStepIdx !== -1) {
          setActiveStepIndex(matchingStepIdx);
        }
      }
    }
  }, [activeMapId, isNavigating, navigationSteps, activeStepIndex]);

  const contextValue = useMemo(() => ({
    nodes,
    edges,
    buildings,
    floors,
    loading,
    isMobile,
    isMenuOpen,
    setIsMenuOpen,
    isBottomSheetExpanded,
    setIsBottomSheetExpanded,
    activeSearchField,
    setActiveSearchField,
    mobileSearchQuery,
    setMobileSearchQuery,
    destination,
    currentLocation,
    isNavigating,
    isComputingRoute,
    pathPoints,
    navigationDirections,
    navigationSteps,
    activeStepIndex,
    autoFitNonce,
    selectedMapId,
    activeMapId,
    filteredSuggestions,
    handleDestinationSelect,
    handleDestinationClear,
    handleCurrentLocationSelect,
    handleCurrentLocationClear,
    handleResetNavigation,
    handleSwapLocations,
    handleStartNavigation,
    setActiveStepIndex,
    setSelectedMapId,
    campusLocations,
    nodesMap,
  }), [
    nodes,
    edges,
    buildings,
    floors,
    loading,
    isMobile,
    isMenuOpen,
    isBottomSheetExpanded,
    activeSearchField,
    mobileSearchQuery,
    destination,
    currentLocation,
    isNavigating,
    isComputingRoute,
    pathPoints,
    navigationDirections,
    navigationSteps,
    activeStepIndex,
    autoFitNonce,
    selectedMapId,
    activeMapId,
    filteredSuggestions,
    handleDestinationSelect,
    handleDestinationClear,
    handleCurrentLocationSelect,
    handleCurrentLocationClear,
    handleResetNavigation,
    handleSwapLocations,
    handleStartNavigation,
    campusLocations,
    nodesMap,
  ]);

  return (
    <CampusNavigationContext.Provider value={contextValue}>
      {children}
    </CampusNavigationContext.Provider>
  );
}

export function useCampusNavigation() {
  const context = useContext(CampusNavigationContext);
  if (context === undefined) {
    throw new Error('useCampusNavigation must be used within a CampusNavigationProvider');
  }
  return context;
}
