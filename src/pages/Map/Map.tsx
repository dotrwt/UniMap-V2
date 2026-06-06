// src/pages/Map/Map.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useFloorMap } from '@/hooks/useFloorMap';
import { useMapStore } from '@/store/mapStore';
import { useSvgMap } from '@/hooks/useSvgMap';
import '../../styles/map.css';

const FALLBACK_MAP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkQe5Y6LmcybzLqnrbl_DIRWcQRX2p2x1o_B8abRkPBs9TbNQLwVnASXUSFRaYbS6p77T66KH-5dhchsa6tOwB4z9geis9A3E6kXJ7Vo-zIcgCGqy25E3ievQTrJ63iAlX1GH3k_mA3eKaaQizFLLVwztTV0ADwWS_kjhEprNKX7iS25jXu-KiojXH8Sw5guFwh2TnKUu4CF6WKbxcBMel0KZESOysIfubkCKn2eHjbZK9AP64Sw7oupDhi-7Ac3FdCV971OKajUCH';

/** Map component loads and renders the active floor map, rendering an animated route overlay. */
export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { svgUrl } = useFloorMap();
  const { svgContent, isLoading, error } = useSvgMap(svgUrl);
  const { graph, activeMap, activeFloor, selectedFrom, selectedTo, currentRoute, setSelectedFrom, setSelectedTo } = useMapStore();

  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const activeMapUrl = svgUrl || FALLBACK_MAP_URL;

  // Resolve active map dimensions to keep layout scalable
  useEffect(() => {
    // If we have parsed SVG content, read dimensions directly from the SVG element
    if (svgContent && mapRef.current) {
      const svgElement = mapRef.current.querySelector('svg');
      if (svgElement) {
        // Ensure the injected SVG element fills the container
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');

        const viewBoxStr = svgElement.getAttribute('viewBox');
        if (viewBoxStr) {
          const parts = viewBoxStr.trim().split(/[\s,]+/);
          if (parts.length === 4) {
            const width = parseFloat(parts[2]);
            const height = parseFloat(parts[3]);
            if (!isNaN(width) && !isNaN(height)) {
              setDimensions({ width, height });
              setImgLoaded(true);
              return;
            }
          }
        }

        const widthAttr = svgElement.getAttribute('width');
        const heightAttr = svgElement.getAttribute('height');
        if (widthAttr && heightAttr) {
          const width = parseFloat(widthAttr);
          const height = parseFloat(heightAttr);
          if (!isNaN(width) && !isNaN(height)) {
            setDimensions({ width, height });
            setImgLoaded(true);
            return;
          }
        }
      }
    }

    // Fallback: If no SVG content is present (e.g. loading fallback map image), load via Image preloader
    if (!svgContent) {
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
    }
  }, [activeMapUrl, svgContent]);

  // Post-injection attribute enforcement
  useEffect(() => {
    if (!mapRef.current || !svgContent) return;
    const svgElement = mapRef.current.querySelector('svg');
    if (svgElement) {
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
    }
  }, [svgContent]);

  // Resolve target map ID (e.g. "MainBuilding_gf")
  const targetMapId = useMemo(() => {
    if (!graph || !activeMap || activeFloor === null) return null;
    if (activeMap === 'Campus_Map') return 'Campus_Map';
    const activeBuilding = graph.buildings.find(b => b.id === activeMap);
    return activeBuilding ? activeBuilding.floorIds[activeFloor] : null;
  }, [graph, activeMap, activeFloor]);

  // Nodes belonging to the active map floor to render as interactive markers
  const activeFloorNodes = useMemo(() => {
    if (!graph || !targetMapId) return [];
    return graph.nodes.filter(node => node.map === targetMapId);
  }, [graph, targetMapId]);

  // Compute the route path string in the SVG coordinates, filtered to active floor segments
  const pathD = useMemo(() => {
    if (!currentRoute || !graph || !targetMapId) return '';
    const points: string[] = [];

    let prevNode = currentRoute.from;

    for (const step of currentRoute.steps) {
      const currNode = graph.nodes.find(n => n.id === step.nodeId);
      if (prevNode && currNode) {
        // Draw segment only if both nodes belong to the active floor
        if (prevNode.map === targetMapId && currNode.map === targetMapId) {
          points.push(`M ${prevNode.x} ${prevNode.y} L ${currNode.x} ${currNode.y}`);
        }
      }
      prevNode = currNode || prevNode;
    }

    return points.join(' ');
  }, [currentRoute, graph, targetMapId]);

  return (
    <div className="map-bg overflow-hidden flex items-center justify-center relative w-full h-full">
      {/* Map Content */}
      {svgContent ? (
        <div
          ref={mapRef}
          className="w-full h-full map-svg transition-opacity duration-300 opacity-85"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <img
          alt="University Map"
          className="w-full h-full object-cover transition-opacity duration-300 opacity-60 grayscale-[20%]"
          src={activeMapUrl}
        />
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/85 z-20">
          <div className="animate-spin border-2 border-navy-500 rounded-full w-8 h-8 border-t-transparent" />
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-red-400 text-[13px] font-medium bg-[var(--bg-card)]/90 px-4 py-2 rounded-xl border border-outline-variant/30">
            Failed to load map. Please try again.
          </div>
        </div>
      )}

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
