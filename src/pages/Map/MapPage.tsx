// src/pages/Map/MapPage.tsx
import { MapLayout } from '@/components/ui/MapLayout';
import { MapHeader } from '@/components/ui/MapHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { MapCanvas } from '@/components/map/MapCanvas';
import { RoutePanel } from '@/components/route/RoutePanel';
import { CampusNavigationProvider } from '@/hooks/useCampusNavigation';

export interface MapPageProps {}

export default function MapPage({}: MapPageProps) {
  return (
    <CampusNavigationProvider>
      <MapLayout>
        <MapHeader />
        <SearchBar />
        <MapCanvas />
        <RoutePanel />
      </MapLayout>
    </CampusNavigationProvider>
  );
}
