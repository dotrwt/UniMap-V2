// src/pages/Map/MapPage.tsx
import React, { Suspense } from 'react';
import { MapLayout } from '@/components/ui/MapLayout';
import { MapHeader } from '@/components/ui/MapHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { MapCanvas } from '@/components/map/MapCanvas';
import { CampusNavigationProvider, useCampusNavigation } from '@/hooks/useCampusNavigation';

const RoutePanelLazy = React.lazy(() =>
  import('@/components/route/RoutePanel').then((m) => ({ default: m.RoutePanel }))
);

export function RoutePanel(props: any) {
  const { isMobile, isNavigating } = useCampusNavigation();
  // On mobile, only render when route is active (navigating).
  // On desktop, always render to show welcome guide / popular spots.
  const shouldRender = !isMobile || isNavigating;

  if (!shouldRender) return null;

  return (
    <Suspense fallback={null}>
      <RoutePanelLazy {...props} />
    </Suspense>
  );
}

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

