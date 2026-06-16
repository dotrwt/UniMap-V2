// src/components/map/MapCanvas.tsx
import MapBox from '@/components/ui/MapBox';
import { useCampusNavigation } from '@/hooks/useCampusNavigation';

export interface MapCanvasProps {
  className?: string;
}

export function MapCanvas({ className = '' }: MapCanvasProps) {
  const {
    activeMapId,
    destination,
    currentLocation,
    isNavigating,
    pathPoints,
    autoFitNonce,
    floors,
    buildings,
    setSelectedMapId,
  } = useCampusNavigation();

  return (
    <div className={`w-full h-full relative ${className}`}>
      <MapBox
        mapId={activeMapId}
        destination={destination}
        currentLocation={currentLocation}
        isNavigating={isNavigating}
        pathPoints={pathPoints}
        autoFitNonce={autoFitNonce}
        floors={floors}
        buildings={buildings}
        onMapChange={setSelectedMapId}
      />
    </div>
  );
}
