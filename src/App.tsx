// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';

// Lazy loaded page components
const LandingPage = React.lazy(() => import('@/pages/Landing/LandingPage'));
const MapPage = React.lazy(() => import('@/pages/MapPage'));

// Inline NotFound component
const NotFound = () => (
  <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--text-primary)]">
    <h1 className="text-xl font-semibold mb-1">404</h1>
    <p className="text-xs text-[var(--text-secondary)]">Page not found</p>
  </div>
);

// Spinner loading fallback component matching MapCanvas design
const LoadingFallback = () => (
  <div className="w-screen h-screen flex items-center justify-center bg-[var(--bg)]">
    <div className="animate-spin border-2 border-navy-500 rounded-full w-8 h-8 border-t-transparent" />
  </div>
);

/** Root App component setting up global routing, theme, and code-split pages. */
export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
