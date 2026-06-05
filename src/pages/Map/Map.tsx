// src/pages/Map/Map.tsx
import { useEffect, useState, useMemo } from 'react';
import { useFloorMap } from '@/hooks/useFloorMap';
import { useMapStore } from '@/store/mapStore';

const FALLBACK_MAP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQe5Y6LmcybzLqnrbl_DIRWcQRX2p2x1o_B8abRkPBs9TbNQLwVnASXUSFRaYbS6p77T66KH-5dhchsa6tOwB4z9geis9A3E6kXJ7Vo-zIcgCGqy25E3ievQTrJ63iAlX1GH3k_mA3eKaaQizFLLVwztTV0ADwWS_kjhEprNKX7iS25jXu-KiojXH8Sw5guFwh2TnKUu4CF6WKbxcBMel0KZESOysIfubkCKn2eHjbZK9AP64Sw7oupDhi-7Ac3FdCV971OKajUCH';

/** Map component loads and renders the active floor map, rendering an animated route overlay. */
export default function Map() {
  const { svgUrl } = useFloorMap();
  const { graph, activeMap, activeFloor, selectedFrom, selectedTo, currentRoute, setSelectedFrom, setSelectedTo } = useMapStore();

  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const activeMapUrl = svgUrl || FALLBACK_MAP_URL;

  // Resolve active map dimensions to keep layout scalable
  useEffect(() => {
    setImgLoaded(false);
    const img = new Image();
    img.src = activeMapUrl;
    img.onload = () => {
      setDimensions({
        width: img.naturalWidth || 1000,
        height: img.naturalHeight || 1000,
      });
      setImgLoaded(true);
    };
    img.onerror = () => {
      setDimensions({ width: 1000, height: 1000 });
      setImgLoaded(true);
    };
  }, [activeMapUrl]);

  // Resolve target map ID (e.g. "MainBuilding_gf")
  const targetMapId = useMemo(() => {
    if (!graph || !activeMap || activeFloor === null) return null;
    const activeBuilding = graph.buildings.find(b => b.id === activeMap);
    return activeBuilding ? activeBuilding.floorIds[activeFloor] : null;
  }, [graph, activeMap, activeFloor]);

  // Nodes belonging to the active map floor to render as interactive markers
  const activeFloorNodes = useMemo(() => {
    if (!graph || !targetMapId) return [];
    return graph.nodes.filter(node => node.map === targetMapId);
  }, [graph, targetMapId]);

  // Compute the route path string in the SVG coordinates
  const pathD = useMemo(() => {
    if (!currentRoute || !graph) return '';
    const points: string[] = [];

    const startNode = currentRoute.from;
    if (startNode) {
      points.push(`M ${startNode.x} ${startNode.y}`);
    }

    for (const step of currentRoute.steps) {
      const node = graph.nodes.find(n => n.id === step.nodeId);
      if (node) {
        points.push(`L ${node.x} ${node.y}`);
      }
    }

    return points.join(' ');
  }, [currentRoute, graph]);

  return (
    <div className="map-bg overflow-hidden flex items-center justify-center relative w-full h-full">
      {/* Background Map Image */}
      <img
        alt="University Map"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          svgUrl ? 'opacity-85' : 'opacity-60 grayscale-[20%]'
        }`}
        src={activeMapUrl}
      />

      {/* SVG Route Overlay Canvas */}
      {imgLoaded && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          {/* Interactive clickable nodes */}
          {activeFloorNodes.map((node) => {
            const isStart = selectedFrom?.id === node.id;
            const isEnd = selectedTo?.id === node.id;
            const isSelected = isStart || isEnd;

            return (
              <g
                key={node.id}
                onClick={() => {
                  if (!selectedFrom) {
                    setSelectedFrom(node);
                  } else if (!selectedTo && node.id !== selectedFrom.id) {
                    setSelectedTo(node);
                  } else {
                    setSelectedFrom(node);
                    setSelectedTo(null);
                  }
                }}
                className="cursor-pointer group"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 10 : 7}
                  className={`transition-all duration-150 stroke-white stroke-2 ${
                    isStart
                      ? 'fill-[var(--route-from)]'
                      : isEnd
                      ? 'fill-[var(--route-to)]'
                      : 'fill-primary hover:fill-primary-container opacity-45 hover:opacity-100'
                  }`}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={16}
                  className="fill-transparent stroke-transparent group-hover:stroke-primary/20 stroke-2"
                />
              </g>
            );
          })}

          {/* Shortest Path Overlay Route line */}
          {pathD && (
            <path
              d={pathD}
              className="route-line"
              fill="none"
              stroke="#1a73e8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="6"
            />
          )}

          {/* Start Selection Pin Marker (Material Symbols style) */}
          {selectedFrom && selectedFrom.map === targetMapId && (
            <circle
              cx={selectedFrom.x}
              cy={selectedFrom.y}
              fill="#ffffff"
              r="8"
              stroke="#1a73e8"
              strokeWidth="3"
            />
          )}

          {/* End Selection Pin Marker (Material Symbols style) */}
          {selectedTo && selectedTo.map === targetMapId && (
            <g>
              <path
                d={`M ${selectedTo.x},${selectedTo.y - 30} L ${selectedTo.x + 15},${selectedTo.y} L ${selectedTo.x},${selectedTo.y + 30} L ${selectedTo.x - 15},${selectedTo.y} Z`}
                fill="#ea4335"
              />
              <circle cx={selectedTo.x} cy={selectedTo.y} fill="#ffffff" r="4" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
