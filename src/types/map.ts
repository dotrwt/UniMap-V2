// src/types/map.ts
import { MapNode } from './graph';
import { Route } from './route';

/** Represents a specific floor plan map for a building. */
export interface FloorMap {
  building: string;
  floor: number;
  svgUrl: string;
  label: string;
}

/** Represents the global map navigation state in the app. */
export interface MapState {
  activeBuilding: string | null;
  activeFloor: number | null;
  activeFloorMap: FloorMap | null;
  selectedFrom: MapNode | null;
  selectedTo: MapNode | null;
  currentRoute: Route | null;
  isLoading: boolean;
  error: string | null;
}
