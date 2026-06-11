// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';

// Lazy loaded page components
const LandingPage = React.lazy(() => import('@/pages/Landing/LandingPage'));
const CampusMapPage = React.lazy(() => import('@/pages/Map/CampusMapPage'));
const SupportPage = React.lazy(() => import('@/pages/Support/SupportPage'));
const NotFoundPage = React.lazy(() => import('@/pages/404'));

// Spinner loading fallback component matching MapCanvas design
const LoadingFallback = () => (
  <div className="w-screen h-screen flex items-center justify-center bg-[var(--bg)]">
    <div className="animate-spin border-2 border-navy-500 rounded-full w-8 h-8 border-t-transparent" />
  </div>
);

function CampusMapWrapper() {
  return <CampusMapPage />;
}

/** Root App component setting up global routing, theme, and code-split pages. */
export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<CampusMapWrapper />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

