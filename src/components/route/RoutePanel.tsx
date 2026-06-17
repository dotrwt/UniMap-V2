// src/components/route/RoutePanel.tsx
import { memo } from 'react';
import { 
  Navigation, 
  CornerUpRight, 
  CornerUpLeft, 
  ArrowUp, 
  ArrowDown, 
  MapPin, 
  School, 
  BookOpen, 
  Flame, 
  Compass, 
  ArrowRight, 
  ArrowLeft,
  X
} from 'lucide-react';
import { useCampusNavigation } from '@/hooks/useCampusNavigation';
import { parseRoomName } from '@/lib/roomParser';
import { formatTime, formatDistance } from '@/lib/routeBuilder';

export interface RoutePanelProps {}

const POPULAR_SPOTS = [
  { id: 'room_J101', name: 'Colloquium', map: 'Main_FF', x: 341.3025, y: 489.9517, building: 'Main', floor: 1, category: 'Academic', desc: 'Conference Hall', color: 'bg-yellow-500/10 text-yellow-600', icon: BookOpen },
  { id: 'room_J001', name: 'Conclave', map: 'Main_GF', x: 406.8033, y: 487.5583, building: 'Main', floor: 0, category: 'Academic', desc: 'Seminar Room', color: 'bg-orange-500/10 text-orange-600', icon: School },
  { id: 'room_J102', name: 'SH-7', map: 'Main_FF', x: 156.9493, y: 469.9952, building: 'Main', floor: 1, category: 'Academic', desc: 'Lecture Hall 7', color: 'bg-cyan-500/10 text-cyan-600', icon: Flame },
  { id: 'Jubilee_Gate', name: 'Jubilee Gate', map: 'Campus_Map', x: 749.9669, y: 127.5277, building: 'Campus', floor: 0, category: 'Gate', desc: 'Main Campus Entrance', color: 'bg-blue-500/10 text-blue-600', icon: Compass }
];

export const RoutePanel = memo(function RoutePanel({}: RoutePanelProps) {
  const {
    isMobile,
    isBottomSheetExpanded,
    setIsBottomSheetExpanded,
    destination,
    currentLocation,
    isNavigating,
    isComputingRoute,
    navigationDirections,
    navigationSteps,
    activeStepIndex,
    setActiveStepIndex,
    handleDestinationSelect,
    handleDestinationClear,
    handleCurrentLocationSelect,
    handleResetNavigation,
    handleStartNavigation,
    campusLocations,
    nodesMap,
    floors,
    routeDistance,
    routeDuration
  } = useCampusNavigation();

  const isRouteActive = destination && currentLocation;

  const renderDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'right':
        return <CornerUpRight className="w-4 h-4 text-blue-600" />;
      case 'left':
        return <CornerUpLeft className="w-4 h-4 text-blue-600" />;
      case 'up':
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-blue-600" />;
      case 'straight':
      default:
        return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStepLabel = (step: any, index: number) => {
    const startNode = nodesMap[step.start_node];
    const endNode = nodesMap[step.end_node];
    const startName = startNode ? (startNode.name || parseRoomName(startNode.id).name) : step.start_node;
    const endName = endNode ? (endNode.name || parseRoomName(endNode.id).name) : step.end_node;
    return {
      title: `Step ${String(index + 1).padStart(2, '0')}`,
      desc: `${startName} to ${endName}`
    };
  };

  const getMapDisplayName = (mapId: string | null) => {
    if (!mapId) return 'Campus';
    if (mapId === 'Campus_Map') return 'Campus Map';
    const floorMeta = floors.find(f => f.map === mapId);
    if (floorMeta) {
      return `${floorMeta.building.toUpperCase()} - ${floorMeta.floor === 0 ? 'G' : `F${floorMeta.floor}`}`;
    }
    return mapId.replace('_', ' ');
  };

  const handleSelectPopularSpot = (loc: typeof POPULAR_SPOTS[0]) => {
    handleDestinationSelect(loc);
    // Google maps style: when popular spot selected, let it trigger Destination Place Card.
    // Do not automatically set currentLocation to Jubilee Gate so the user sees the Place card first!
  };

  if (isMobile) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] border-t border-black/5 z-30 transition-transform duration-300 ease-out flex flex-col ${
          isBottomSheetExpanded ? 'translate-y-0 h-[80vh]' : 'translate-y-[calc(80vh-140px)] h-[80vh]'
        }`}
      >
        {/* Drag Handle */}
        <div
          onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
          className="w-full py-3 flex justify-center cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {isNavigating ? (
          // Navigation Mode (Active)
          !isBottomSheetExpanded ? (
            // Collapsed Active Navigation Dashboard
            <div className="flex items-center justify-between px-6 py-2.5 w-full shrink-0">
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-emerald-600">
                    {isComputingRoute ? 'Computing...' : formatTime(routeDuration)}
                  </span>
                  {!isComputingRoute && (
                    <span className="text-xs text-gray-400 font-bold">
                      ({formatDistance(routeDistance)})
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5 truncate">
                  Step {activeStepIndex + 1} of {navigationSteps.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((p) => Math.max(0, p - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  title="Previous Step"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>

                <button
                  onClick={() => {
                    if (activeStepIndex === navigationSteps.length - 1) {
                      handleResetNavigation();
                    } else {
                      setActiveStepIndex((p) => Math.min(navigationSteps.length - 1, p + 1));
                    }
                  }}
                  className="h-10 px-4 rounded-xl bg-[#ff602e] hover:bg-[#ff7b52] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  <span>{activeStepIndex === navigationSteps.length - 1 ? 'Finish' : 'Next'}</span>
                  {activeStepIndex !== navigationSteps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            // Expanded Active Navigation Dashboard
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Route Summary */}
              <div className="px-6 pb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-gray-900">
                      {isComputingRoute ? 'Computing...' : formatTime(routeDuration)}
                    </span>
                    {!isComputingRoute && (
                      <span className="text-sm font-bold text-gray-400">
                        ({formatDistance(routeDistance)})
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">
                    Active Step-by-Step Navigation
                  </p>
                </div>
              </div>

              {/* Step Selection timeline */}
              {navigationSteps.length > 0 && (
                <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar-hide shrink-0">
                  {navigationSteps.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    const { title, desc } = getStepLabel(step, idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`px-4 py-2 rounded-2xl border flex-shrink-0 flex flex-col transition-all cursor-pointer ${
                          isActive
                            ? 'bg-orange-50 border-orange-200 text-[#ff602e]'
                            : 'bg-[#fcfaf6] border-black/5 text-gray-700 hover:bg-gray-55'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[9px] font-black uppercase tracking-wider">{title}</span>
                          <span className="text-[8px] font-bold bg-white px-1 py-0.5 rounded text-gray-400 border border-black/5 uppercase">
                            {getMapDisplayName(step.map)}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 mt-1 max-w-[130px] truncate">
                          {desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Scrollable Step list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 border-t border-gray-100">
                {navigationDirections.length > 0 ? (
                  <div className="relative pl-8 space-y-6">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-[15px] top-4 bottom-8 w-[2px] bg-blue-100 pointer-events-none" />

                    {navigationDirections.map((step, idx) => {
                      const isLast = idx === navigationDirections.length - 1;
                      return (
                        <div key={idx} className="relative flex flex-col gap-1">
                          {/* Step Icon */}
                          <div className={`absolute -left-[32px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            isLast ? 'bg-red-50 border border-red-100 text-red-500' : 'bg-blue-50 border border-blue-100 text-blue-600'
                          }`}>
                            {isLast ? <MapPin className="w-4 h-4" /> : renderDirectionIcon(step.direction)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-snug">
                              {step.instruction}
                            </p>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">
                              {step.distance}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs font-semibold text-gray-400">
                    No steps generated.
                  </div>
                )}
              </div>

              {/* Footer step controls */}
              <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex(p => Math.max(0, p - 1))}
                  className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Prev Step
                </button>
                <button
                  onClick={() => {
                    if (activeStepIndex === navigationSteps.length - 1) {
                      handleResetNavigation();
                    } else {
                      setActiveStepIndex(p => Math.min(navigationSteps.length - 1, p + 1));
                    }
                  }}
                  className="flex-1 h-12 rounded-2xl bg-[#ff602e] hover:bg-[#ff7b52] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {activeStepIndex === navigationSteps.length - 1 ? 'Finish' : 'Next Step'}
                  {activeStepIndex !== navigationSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        ) : isRouteActive ? (
          // Route Planning / Preview Mode
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Route Summary */}
            <div className="px-6 pb-4 flex items-center justify-between shrink-0">
              <div className="flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-gray-900">
                    {isComputingRoute ? 'Computing...' : formatTime(routeDuration)}
                  </span>
                  {!isComputingRoute && (
                    <span className="text-sm font-bold text-gray-400">
                      ({formatDistance(routeDistance)})
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">
                  Fastest route via indoor paths
                </p>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 mt-auto shrink-0">
              <button
                onClick={handleStartNavigation}
                className="flex-1 h-12 rounded-2xl bg-[#2f55d4] hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white" />
                Start Navigation
              </button>
              <button
                onClick={handleResetNavigation}
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-red-500 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                title="Cancel Route"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : destination ? (
          // Place Details Card (Destination only, no start)
          <div className="flex-1 flex flex-col overflow-hidden px-6 pb-4">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#ff602e] bg-orange-50 px-2.5 py-1 rounded-md">
                  {destination.category}
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-2 truncate">{destination.name}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">
                  {destination.building} • Floor {destination.floor === 0 ? 'G' : `F${destination.floor}`}
                </p>
              </div>
              <button
                onClick={handleDestinationClear}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 cursor-pointer shrink-0"
                aria-label="Clear destination"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <div className="bg-[#fcfaf6] border border-black/[0.03] rounded-2xl p-4 flex items-start gap-3.5">
                <School className="w-5 h-5 text-[#ff602e] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Location Details</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    This {destination.category.toLowerCase()} is located in the {destination.building} on Floor {destination.floor === 0 ? 'Ground' : destination.floor}.
                  </p>
                </div>
              </div>

              <div className="bg-[#fcfaf6] border border-black/[0.03] rounded-2xl p-4 flex items-start gap-3.5">
                <Compass className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Entrance Route</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    Accessible via campus pathways and stairs/lift connections.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  const defaultStart = campusLocations.find(l => l.id === 'Jubilee_Gate') || {
                    id: 'room_J001',
                    name: 'Conclave',
                    searchName: 'conclave',
                    map: 'Main_GF',
                    building: 'Main',
                    floor: 0,
                    category: 'Academic',
                    x: 406.8033,
                    y: 487.5583,
                  };
                  handleCurrentLocationSelect(defaultStart);
                }}
                className="flex-1 h-12 rounded-2xl bg-[#ff602e] hover:bg-[#ff7b52] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white" />
                Directions
              </button>
            </div>
          </div>
        ) : (
          // Empty State (popular spots list)
          <div className="flex-1 flex flex-col overflow-hidden px-6">
            <div className="pb-3 select-none shrink-0">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-wider">Explore Campus</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">Select a destination to plan your route</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {POPULAR_SPOTS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectPopularSpot(loc)}
                    className="w-full bg-white border border-black/5 hover:border-orange-200 rounded-2xl p-3 shadow-sm flex items-center gap-3 transition-all text-left active:scale-[0.98] cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-xl ${loc.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{loc.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{loc.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      {loc.building} • F{loc.floor}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop side panel inner section below search bar
  return (
    <>
      {/* Navigation Panel */}
      {isNavigating && (
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-4.5 h-4.5 text-[#ff602e]" />
              Navigation
            </h3>
            <button
              onClick={handleResetNavigation}
              className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              End Route
            </button>
          </div>

          {/* Steps selector buttons list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Route Steps</span>
            <div className="relative pl-4 space-y-3">
              {/* Timeline Connector Line */}
              <div className="absolute left-[7px] top-3.5 bottom-3.5 w-[2px] bg-gray-100" />

              {navigationSteps.map((step, idx) => {
                const isActive = idx === activeStepIndex;
                const { title, desc } = getStepLabel(step, idx);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`w-full text-left relative flex items-start gap-3 p-2.5 rounded-xl transition-all border ${
                      isActive
                        ? 'bg-orange-50/75 border-orange-200/80 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-gray-55'
                    }`}
                  >
                    {/* Timeline circle marker */}
                    <div className={`absolute -left-[13px] top-3.5 w-2.5 h-2.5 rounded-full border-2 ${
                      isActive ? 'bg-[#ff602e] border-white ring-2 ring-orange-200' : 'bg-gray-300 border-white'
                    }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#ff602e]' : 'text-gray-400'}`}>
                          {title}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                          {getMapDisplayName(step.map)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step walking instructions */}
          {navigationSteps[activeStepIndex] && (
            <div className="bg-[#fcfaf6] border border-black/[0.03] rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#ff602e] uppercase tracking-wider">
                  Walking Instructions
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  {navigationDirections.length} directions
                </span>
              </div>

              <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {navigationDirections.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-7 h-7 bg-white border border-black/5 rounded-lg shrink-0 text-[#ff602e]">
                      {renderDirectionIcon(step.direction)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-snug">{step.instruction}</p>
                      {step.distance && (
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{step.distance}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-2 pt-1.5">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex(p => Math.max(0, p - 1))}
                  className="flex-1 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-xs disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  Previous Step
                </button>
                <button
                  disabled={activeStepIndex === navigationSteps.length - 1}
                  onClick={() => setActiveStepIndex(p => Math.min(navigationSteps.length - 1, p + 1))}
                  className="flex-1 h-9 rounded-xl bg-[#ff602e] text-white font-bold text-xs disabled:opacity-50 disabled:pointer-events-none hover:bg-[#ff7b52] active:scale-95 transition-all cursor-pointer"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Welcome Guide & Popular spots (only visible when not navigating) */}
      {!isNavigating && (
        <>
          {/* Campus Guide Card */}
          <div className="bg-gradient-to-br from-[#ff602e]/10 to-[#ff7b52]/5 border border-[#ff602e]/15 rounded-2xl p-4 flex items-start gap-3.5 select-none animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="w-9 h-9 rounded-xl bg-[#ff602e]/10 text-[#ff602e] flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Campus Explorer</h4>
              <p className="text-[10px] text-gray-500 leading-normal mt-1">
                Search rooms, pan the map freely, or select popular highlights below to quickly preview indoor routing and navigation.
              </p>
            </div>
          </div>

          {/* Popular Spots Grid */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Popular Destinations</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {POPULAR_SPOTS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleDestinationSelect(loc)}
                    className="bg-white/60 hover:bg-orange-50/25 border border-black/5 hover:border-orange-200/60 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 text-left active:scale-[0.98] group pointer-events-auto cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full ${loc.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#ff602e] transition-colors truncate">{loc.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{loc.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100/60 px-2 py-1 rounded-md">
                        {loc.building} • F{loc.floor}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
});
