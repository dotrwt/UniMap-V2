// src/types/graph.ts

/** Union type of string literals representing every kind of campus node. */
export type NodeType =
  | 'room'
  | 'corridor'
  | 'junction'
  | 'staircase'
  | 'lift'
  | 'entrance'
  | 'exit'
  | 'landmark'
  | 'outdoor';

/** Union type of string literals representing walkable paths. */
export type EdgeType = 'corridor' | 'stairs' | 'lift' | 'outdoor' | 'ramp';

/** Represents a building and its existing floors. */
export interface Building {
  id: string;
  label: string;
  floors: number[];
}

/** Represents a single point or location on the campus map. */
export interface MapNode {
  id: string;
  label: string;
  type: NodeType;
  building: string;
  floor: number;
  x: number;
  y: number;
  svgElementId?: string;
  accessible: boolean;
  keywords?: string[];
}

/** Represents a physical path connecting two nodes. */
export interface MapEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  type: EdgeType;
  bidirectional: boolean;
  accessible: boolean;
}

/** Represents the complete graph structure of the campus. */
export interface CampusGraph {
  nodes: MapNode[];
  edges: MapEdge[];
  buildings: Building[];
}
