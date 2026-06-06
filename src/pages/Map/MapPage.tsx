// src/pages/Map/MapPage.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGraph } from '@/hooks/useGraph';
import { useMapStore } from '@/store/mapStore';
import { usePathfinding } from '@/hooks/usePathfinding';
import { searchNodes } from '@/lib/graphUtils';
import { formatDistance, formatTime } from '@/lib/routeBuilder';
import Map from './Map';
import { ThemeToggle } from '@/components/ui';

export default function MapPage() {
  const navigate = useNavigate();
  const { isLoading, error: graphError } = useGraph();
  const {
    graph,
    activeMap,
    activeFloor,
    setActiveMap,
    setActiveFloor,
    selectedFrom,
    selectedTo,
    setSelectedFrom,
    setSelectedTo,
    clearRoute,
    currentRoute,
    error: routeError,
  } = useMapStore();

  const { isComputing } = usePathfinding();

  // Search input query states
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Filter chips selection states
  const [activeChip, setActiveChip] = useState<'shortest' | 'accessible' | 'stairs'>('shortest');

  const fromContainerRef = useRef<HTMLDivElement>(null);
  const toContainerRef = useRef<HTMLDivElement>(null);

  // Automatically select Campus_Map and floor 1 when the graph loads
  useEffect(() => {
    if (graph && !activeMap) {
      setActiveMap('Campus_Map');
      setActiveFloor(1);
    }
  }, [graph, activeMap, setActiveMap, setActiveFloor]);

  // Sync inputs with selected store nodes
  useEffect(() => {
    setFromQuery(selectedFrom ? selectedFrom.name : '');
  }, [selectedFrom]);

  useEffect(() => {
    setToQuery(selectedTo ? selectedTo.name : '');
  }, [selectedTo]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromContainerRef.current && !fromContainerRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toContainerRef.current && !toContainerRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fromSuggestions = useMemo(() => {
    if (!graph || fromQuery.length < 2 || (selectedFrom && selectedFrom.name === fromQuery)) return [];
    return searchNodes(graph, fromQuery);
  }, [fromQuery, graph, selectedFrom]);

  const toSuggestions = useMemo(() => {
    if (!graph || toQuery.length < 2 || (selectedTo && selectedTo.name === toQuery)) return [];
    return searchNodes(graph, toQuery);
  }, [toQuery, graph, selectedTo]);

  const activeBuilding = useMemo(() => {
    if (!graph || !activeMap || activeMap === 'Campus_Map') return null;
    return graph.buildings.find(b => b.id === activeMap) || null;
  }, [graph, activeMap]);

  const handleSwap = () => {
    const temp = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(temp);
  };

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bId = e.target.value;
    setActiveMap(bId);
    setActiveFloor(bId === 'Campus_Map' ? 1 : 0);
  };

  const handleStartNavigation = () => {
    alert('Simulating voice navigation start...');
  };

  // Helper to determine step icons
  const getStepIcon = (type: string, isLast: boolean) => {
    if (isLast) return 'location_on';
    if (type === 'stairs') return 'stairs';
    if (type === 'lift') return 'elevator';
    if (type === 'outdoor') return 'open_in_new';
    return 'north';
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center text-on-surface-variant gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading campus maps and data...</span>
      </div>
    );
  }

  if (graphError) {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center text-error gap-2 text-center p-4">
        <span className="material-symbols-outlined text-[48px]">warning</span>
        <span className="font-bold">Failed to load campus data</span>
        <span className="text-xs text-on-surface-variant">{graphError}</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative text-on-surface">
      {/* Top App Bar Header */}
      <header className="fixed top-4 left-4 right-4 rounded-full bg-surface shadow-md dark:shadow-none z-50 flex justify-between items-center px-6 py-2 max-w-7xl mx-auto border border-outline-variant/30">
        <div className="flex items-center gap-4">
          <span
            className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-variant rounded-full cursor-pointer"
            onClick={() => navigate('/')}
            role="button"
            aria-label="Back to home"
          >
            arrow_back
          </span>
          <h1 className="text-headline-md font-headline-md font-extrabold text-primary select-none">
            UniMap
          </h1>
        </div>

        {/* Building Select inline in Header */}
        {graph && (
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">apartment</span>
            <select
              value={activeMap || ''}
              onChange={handleBuildingChange}
              className="bg-transparent border-none text-xs font-semibold text-on-surface-variant focus:ring-0 focus:outline-none cursor-pointer py-1 pr-6"
            >
              <option value="Campus_Map">Campus Map</option>
              {graph.buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => navigate('/about')}
            className="p-2 hover:bg-surface-variant transition-colors rounded-full"
            aria-label="About page"
          >
            <span className="material-symbols-outlined text-on-surface-variant">info</span>
          </button>
        </div>
      </header>

      {/* Sidebar Navigation Card */}
      <aside className="fixed left-4 top-24 bottom-4 w-80 bg-surface shadow-lg rounded-3xl border border-outline-variant/40 flex flex-col p-4 z-40 max-h-[calc(100vh-120px)]">
        {/* Search Panel Card */}
        <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/30 mb-3 relative">
          <div className="flex flex-col gap-2 relative">
            {/* Start Node Input */}
            <div className="relative" ref={fromContainerRef}>
              <div className="flex items-center gap-2.5 px-1 py-0.5">
                <span className="material-symbols-outlined text-outline text-[18px]">radio_button_checked</span>
                <input
                  type="text"
                  placeholder="Search starting location..."
                  value={fromQuery}
                  onChange={(e) => {
                    setFromQuery(e.target.value);
                    setShowFromSuggestions(true);
                  }}
                  onFocus={() => setShowFromSuggestions(true)}
                  className="w-full text-xs font-semibold border-none p-0 focus:ring-0 bg-transparent text-on-surface focus:outline-none"
                  aria-label="Starting location"
                />
              </div>

              {showFromSuggestions && fromSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 max-h-40 overflow-y-auto bg-surface border border-outline-variant rounded-xl shadow-lg z-50 divide-y divide-outline-variant/20">
                  {fromSuggestions.map((node) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFrom(node);
                          setFromQuery(node.name);
                          setShowFromSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-primary-container/20 text-on-surface transition-colors"
                      >
                        {node.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="h-[1px] bg-outline-variant/30 ml-7"></div>

            {/* Destination Node Input */}
            <div className="relative" ref={toContainerRef}>
              <div className="flex items-center gap-2.5 px-1 py-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                <input
                  type="text"
                  placeholder="Search destination..."
                  value={toQuery}
                  onChange={(e) => {
                    setToQuery(e.target.value);
                    setShowToSuggestions(true);
                  }}
                  onFocus={() => setShowToSuggestions(true)}
                  className="w-full text-xs font-semibold border-none p-0 focus:ring-0 bg-transparent text-on-surface focus:outline-none"
                  aria-label="Destination location"
                />
              </div>

              {showToSuggestions && toSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 max-h-40 overflow-y-auto bg-surface border border-outline-variant rounded-xl shadow-lg z-50 divide-y divide-outline-variant/20">
                  {toSuggestions.map((node) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTo(node);
                          setToQuery(node.name);
                          setShowToSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] hover:bg-primary-container/20 text-on-surface transition-colors"
                      >
                        {node.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Swap Vert Button */}
            <button
              onClick={handleSwap}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-surface border border-outline-variant p-1 rounded-full shadow-sm hover:bg-surface-variant transition-colors flex items-center justify-center"
              aria-label="Swap locations"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">swap_vert</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1.5 no-scrollbar shrink-0">
          <button
            onClick={() => setActiveChip('shortest')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all border ${
              activeChip === 'shortest'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span> Shortest
          </button>
          <button
            onClick={() => setActiveChip('accessible')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all border ${
              activeChip === 'accessible'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">accessible</span> Accessible
          </button>
          <button
            onClick={() => setActiveChip('stairs')}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all border ${
              activeChip === 'stairs'
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">layers_clear</span> Avoid stairs
          </button>
        </div>

        {/* Route Details Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isComputing && (
            <div className="flex-1 flex items-center justify-center text-xs text-on-surface-variant gap-2">
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Computing best path...
            </div>
          )}

          {routeError && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-error p-3">
              <span className="material-symbols-outlined text-[32px] mb-1">warning</span>
              <span className="font-bold">Routing Unavailable</span>
              <span className="text-[10px] text-on-surface-variant mt-0.5">{routeError}</span>
            </div>
          )}

          {!currentRoute && !isComputing && !routeError && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-on-surface-variant/60 p-4">
              <span className="material-symbols-outlined text-[36px] mb-2 text-on-surface-variant/40">explore</span>
              Enter origin and destination locations above, or click points on the map to compute routes.
            </div>
          )}

          {currentRoute && !isComputing && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Route Summary */}
              <div className="mb-4 shrink-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-md font-bold text-secondary">
                    {formatTime(currentRoute.estimatedTime)}
                  </span>
                  <span className="text-body-md text-on-surface-variant">
                    ({formatDistance(currentRoute.totalDistance)})
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                  Via campus corridors • Fastest route
                </p>
              </div>

              {/* Step-by-Step Directions */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider select-none">
                  Directions
                </h3>

                {currentRoute.steps.map((step, index) => {
                  const isLast = index === currentRoute.steps.length - 1;
                  return (
                    <div key={index} className="flex gap-3.5">
                      <div className="flex flex-col items-center shrink-0">
                        <span className={`material-symbols-outlined ${isLast ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {getStepIcon(step.type, isLast)}
                        </span>
                        {!isLast && (
                          <div className="w-[1.5px] h-full bg-outline-variant/40 mt-1"></div>
                        )}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-xs ${isLast ? 'font-bold text-on-surface' : 'text-on-surface font-medium'}`}>
                          {step.instruction}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {formatDistance(step.distanceFromPrev)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary CTA */}
              <div className="pt-3 border-t border-outline-variant/30 mt-3 shrink-0">
                <button
                  onClick={handleStartNavigation}
                  className="w-full bg-primary-container text-on-primary-container py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">navigation</span>
                  Start Navigation
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Interactive Map Layout */}
      <main className="w-full h-full relative z-0">
        <Map />
      </main>

      {/* Floating Floor Switcher and controls (bottom right) */}
      <div className="fixed bottom-6 right-6 flex items-end gap-3 z-30">
        {/* Floor Switcher */}
        <div className="bg-surface shadow-md rounded-2xl p-1 border border-outline-variant/30 flex gap-1 items-center">
          {activeMap === 'Campus_Map' ? (
            <button
              className="px-3.5 py-1 text-xs font-bold rounded-xl bg-primary-container text-on-primary-container"
            >
              L1
            </button>
          ) : (
            activeBuilding?.floorIds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFloor(idx)}
                className={`px-3.5 py-1 text-xs font-bold rounded-xl transition-all ${
                  activeFloor === idx
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface hover:bg-surface-variant'
                }`}
              >
                {idx === 0 ? 'G' : `L${idx}`}
              </button>
            ))
          )}
        </div>

        {/* Map zoom controls */}
        <div className="flex flex-col bg-surface shadow-md rounded-2xl overflow-hidden border border-outline-variant/30">
          <button className="p-2.5 hover:bg-surface-variant transition-colors border-b border-outline-variant/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">add</span>
          </button>
          <button className="p-2.5 hover:bg-surface-variant transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">remove</span>
          </button>
        </div>

        <button
          onClick={clearRoute}
          className="bg-surface shadow-md rounded-2xl p-3 border border-outline-variant/30 hover:bg-surface-variant transition-colors flex items-center justify-center"
          aria-label="Recenter navigation"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">my_location</span>
        </button>
      </div>
    </div>
  );
}
