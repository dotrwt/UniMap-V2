// src/pages/Map/Map.tsx
import { useEffect, useState, useMemo } from 'react';
import { useFloorMap } from '@/hooks/useFloorMap';
import { useMapStore } from '@/store/mapStore';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui';

/** Map component loads and renders the active floor map and overlays the pathfinding route. */
export default function Map() {
  const { svgUrl, floorMap } = useFloorMap();
  const { graph, activeMap, activeFloor, selectedFrom, selectedTo, currentRoute, setSelectedFrom, setSelectedTo } = useMapStore();
  
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [imgLoaded, setImgLoaded] = useState(false);

  // Dynamically resolve SVG dimensions to set the viewBox
  useEffect(() => {
    if (svgUrl) {
      setImgLoaded(false);
      const img = new Image();
      img.src = svgUrl;
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
  }, [svgUrl]);

  // Compute the current active map floor ID (e.g. "MainBuilding_gf")
  const targetMapId = useMemo(() => {
    if (!graph || !activeMap || activeFloor === null) return null;
    const activeBuilding = graph.buildings.find(b => b.id === activeMap);
    return activeBuilding ? activeBuilding.floorIds[activeFloor] : null;
  }, [graph, activeMap, activeFloor]);

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

  // Nodes belonging to the active map floor to render as interactive markers
  const activeFloorNodes = useMemo(() => {
    if (!graph || !targetMapId) return [];
    return graph.nodes.filter(node => node.map === targetMapId);
  }, [graph, targetMapId]);

  if (!svgUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 bg-[var(--bg-card)] text-[var(--text-muted)]">
        <div className="text-center flex flex-col items-center gap-2">
          <Info size={36} className="text-[var(--text-muted)]/40" />
          <span className="text-sm">Select building and floor from the sidebar to view campus maps.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[var(--bg-card)] flex items-center justify-center p-4">
      {!imgLoaded && (
        <div className="absolute inset-0 bg-[var(--bg-card)]/80 z-10 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
        </div>
      )}

      <div className="relative max-w-full max-h-full aspect-video shadow-md rounded-xl border border-[var(--border)] overflow-hidden bg-white">
        <svg
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="w-full h-full select-none"
        >
          <image
            href={svgUrl}
            x="0"
            y="0"
            width={dimensions.width}
            height={dimensions.height}
          />

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
                aria-label={`Select node ${node.name}`}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 10 : 6}
                  className={`transition-all duration-150 stroke-white stroke-2 ${
                    isStart
                      ? 'fill-[var(--route-from)]'
                      : isEnd
                      ? 'fill-[var(--route-to)]'
                      : 'fill-[var(--accent)] hover:fill-[var(--accent-hover)] opacity-40 hover:opacity-100'
                  }`}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 18 : 12}
                  className="fill-transparent stroke-transparent group-hover:stroke-[var(--accent)]/20 stroke-2"
                />
              </g>
            );
          })}

          {pathD && (
            <path
              d={pathD}
              className="route-path"
              style={{
                stroke: 'var(--accent)',
                strokeWidth: '4px',
                fill: 'none',
              }}
            />
          )}

          {selectedFrom && selectedFrom.map === targetMapId && (
            <g transform={`translate(${selectedFrom.x}, ${selectedFrom.y - 12})`}>
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="var(--route-from)"
                className="scale-75 -translate-x-3 -translate-y-4"
              />
            </g>
          )}

          {selectedTo && selectedTo.map === targetMapId && (
            <g transform={`translate(${selectedTo.x}, ${selectedTo.y - 12})`}>
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="var(--route-to)"
                className="scale-75 -translate-x-3 -translate-y-4"
              />
            </g>
          )}
        </svg>
      </div>

      {floorMap && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10 pointer-events-none">
          <Badge variant="default" className="shadow-md py-1.5 px-3 bg-[var(--bg-card)]/90 backdrop-blur-sm">
            <span className="font-semibold text-xs tracking-wide">{floorMap.label}</span>
          </Badge>
        </div>
      )}
    </div>
  );
}
