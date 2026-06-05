// src/store/mapStore.ts
import { create } from 'zustand';
import type { CampusGraph, FloorMap, MapNode, Route } from '@/types';

export interface MapStoreState {
  graph: CampusGraph | null;
  floors: FloorMap[];
  isGraphLoaded: boolean;
  activeMap: string | null;
  activeFloor: number | null;
  activeFloorMap: FloorMap | null;
  selectedFrom: MapNode | null;
  selectedTo: MapNode | null;
  currentRoute: Route | null;
  isLoading: boolean;
  error: string | null;

  setGraph: (graph: CampusGraph) => void;
  setFloors: (floors: FloorMap[]) => void;
  setActiveMap: (map: string | null) => void;
  setActiveFloor: (floor: number | null) => void;
  setActiveFloorMap: (floorMap: FloorMap | null) => void;
  setSelectedFrom: (node: MapNode | null) => void;
  setSelectedTo: (node: MapNode | null) => void;
  setCurrentRoute: (route: Route | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRoute: () => void;
  reset: () => void;
}

const initialState = {
  graph: null,
  floors: [],
  isGraphLoaded: false,
  activeMap: null,
  activeFloor: null,
  activeFloorMap: null,
  selectedFrom: null,
  selectedTo: null,
  currentRoute: null,
  isLoading: false,
  error: null,
};

/** Zustand hook representing the central map navigation state store. */
export const useMapStore = create<MapStoreState>((set) => ({
  ...initialState,

  setGraph: (graph) => set({ graph }),
  setFloors: (floors) => set({ floors }),
  setActiveMap: (activeMap) => set({ activeMap }),
  setActiveFloor: (activeFloor) => set({ activeFloor }),
  setActiveFloorMap: (activeFloorMap) => set({ activeFloorMap }),
  setSelectedFrom: (selectedFrom) => set({ selectedFrom }),
  setSelectedTo: (selectedTo) => set({ selectedTo }),
  setCurrentRoute: (currentRoute) => set({ currentRoute }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  clearRoute: () => set({ selectedFrom: null, selectedTo: null, currentRoute: null }),
  reset: () => set(initialState),
}));
