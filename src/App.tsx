// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from '@/components/ui';
import LandingPage from '@/pages/Landing/LandingPage';
import MapPage from '@/pages/Map/MapPage';
import AboutPage from '@/pages/About/AboutPage';

/** Root App component setting up layout, theme providers, and site routing. */
export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/about" element={<Navbar />} />
          <Route path="*" element={null} />
        </Routes>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>

        {/* Footer: renders only on home (/) and about (/about) routes */}
        <Routes>
          <Route path="/" element={<Footer />} />
          <Route path="/about" element={<Footer />} />
          <Route path="*" element={null} />
        </Routes>
      </div>
    </Router>
  );
}
