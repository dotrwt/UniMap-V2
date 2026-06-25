// src/pages/Map/MapPage.tsx
import React, { Suspense } from 'react';
import { MapLayout } from '@/components/ui/MapLayout';
import { MapHeader } from '@/components/ui/MapHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { MapCanvas } from '@/components/map/MapCanvas';
import { CampusNavigationProvider } from '@/hooks/useCampusNavigation';
import { usePageMeta } from '@/hooks/usePageMeta';

const RoutePanelLazy = React.lazy(() =>
  import('@/components/route/RoutePanel').then((m) => ({ default: m.RoutePanel }))
);

export function RoutePanel(props: any) {
  return (
    <Suspense fallback={null}>
      <RoutePanelLazy {...props} />
    </Suspense>
  );
}

export interface MapPageProps {}

export default function MapPage({}: MapPageProps) {
  usePageMeta('Map', 'Navigate MITS Gwalior campus');

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

