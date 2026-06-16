import { Navigation, CornerUpRight, CornerUpLeft, ArrowUp, ArrowDown, MapPin, School, BookOpen, Flame, Compass } from 'lucide-react';
import NavigationPanel from '@/components/ui/NavigationPanel';
import { useCampusNavigation } from '@/hooks/useCampusNavigation';

export interface RoutePanelProps {}

const POPULAR_SPOTS = [
  { id: 'room_J101', name: 'Colloquium', map: 'Main_FF', x: 341.3025, y: 489.9517, building: 'Main', floor: 1, category: 'Academic', desc: 'Conference Hall', color: 'bg-yellow-500/10 text-yellow-600', icon: BookOpen },
  { id: 'room_J001', name: 'Conclave', map: 'Main_GF', x: 406.8033, y: 487.5583, building: 'Main', floor: 0, category: 'Academic', desc: 'Seminar Room', color: 'bg-orange-500/10 text-orange-600', icon: School },
  { id: 'room_J102', name: 'SH-7', map: 'Main_FF', x: 156.9493, y: 469.9952, building: 'Main', floor: 1, category: 'Academic', desc: 'Lecture Hall 7', color: 'bg-cyan-500/10 text-cyan-600', icon: Flame },
  { id: 'Jubilee_Gate', name: 'Jubilee Gate', map: 'Campus_Map', x: 749.9669, y: 127.5277, building: 'Campus', floor: 0, category: 'Gate', desc: 'Main Campus Entrance', color: 'bg-blue-500/10 text-blue-600', icon: Compass }
];

export function RoutePanel({}: RoutePanelProps) {
  const {
    isMobile,
    isBottomSheetExpanded,
    setIsBottomSheetExpanded,
    destination,
    currentLocation,
    isNavigating,
    isComputingRoute,
    navigationDirections,
    handleDestinationSelect,
    handleCurrentLocationSelect,
    handleResetNavigation,
    handleStartNavigation,
    campusLocations
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

  const handleSelectPopularSpot = (loc: typeof POPULAR_SPOTS[0]) => {
    handleDestinationSelect(loc);
    // default current location if empty
    if (!currentLocation) {
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
    }
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
          className="w-full py-3 flex justify-center cursor-pointer select-none"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {isRouteActive ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Route Summary */}
            <div className="px-6 pb-4 flex items-center justify-between">
              <div
                onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-gray-900">
                    {isComputingRoute ? 'Computing...' : '4 mins'}
                  </span>
                  <span className="text-sm font-bold text-gray-400">
                    (320m)
                  </span>
                </div>
                <p className="text-xs font-bold text-green-600 mt-0.5">
                  Fastest route via Main Atrium
                </p>
              </div>

              {/* Share Button */}
              <button className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l4.646-2.323m0 7.162l-4.646-2.323M21 12a3 3 0 11-6 0 3 3 0 016 0zm-11-7a3 3 0 11-6 0 3 3 0 016 0zm0 14a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

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
                  No steps generated. Tap Start Navigation to compute path.
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={() => {
                  if (!isNavigating) {
                    handleStartNavigation();
                  } else {
                    handleResetNavigation();
                  }
                }}
                className="flex-1 h-12 rounded-2xl bg-[#2f55d4] hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white" />
                {isNavigating ? 'End Navigation' : 'Start Navigation'}
              </button>
              <button
                onClick={handleResetNavigation}
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-blue-600 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden px-6">
            {/* Collapsed/Empty Route Mode: Popular spots preview */}
            <div className="pb-3 select-none">
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
        <div className="border-t border-gray-100 pt-4">
          <NavigationPanel
            isNavigating={isNavigating}
            navigationDirections={navigationDirections}
            onResetNavigation={handleResetNavigation}
          />
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
}
