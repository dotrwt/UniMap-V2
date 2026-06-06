// src/pages/Landing/LandingPage.tsx
import './landing.css';
import Hero from './Hero';
import Features from './Features';
import About from './About';
import { Navbar, Footer } from '@/components/ui';

/** 
 * Redesigned Landing Page component for UniMap.
 * Renders Hero sections, feature grids, and project details matching reference visual styles.
 */
export default function LandingPage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[#fcfaf6] dark:bg-[#050505]">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Header & Interactive Mockup */}
      <Hero />

      {/* Feature Capabilities grid */}
      <Features />

      {/* Project Specs stack details */}
      <About />

      {/* Footer */}
      <Footer />
    </div>
  );
}
