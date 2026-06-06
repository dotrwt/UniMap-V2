// src/pages/Landing/Hero.tsx
import { Link } from 'react-router-dom';
import { Compass, Navigation, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-32 pb-20 px-4 md:px-8 overflow-hidden blueprint-grid">
      {/* Decorative background glows */}
      <div className="radial-glow top-20 left-1/2 -translate-x-1/2" />

      {/* Floating Capsule Header Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 w-[92%] max-w-2xl px-4 py-2 rounded-full glass-capsule shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <div className="w-8 h-8 rounded-full bg-[#ff602e] flex items-center justify-center text-white">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <span className="text-sm font-bold text-white tracking-wider select-none">UniMap</span>
        </div>
        
        <div className="flex-1 flex justify-center items-center gap-6 text-xs font-semibold text-neutral-400">
          <Link to="/" className="hover:text-white transition-colors text-white">Home</Link>
          <Link to="/map" className="hover:text-white transition-colors">Map</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/map">
            <button className="bg-[#ff602e] hover:bg-[#ff7b52] text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-[#ff602e]/20 active:scale-95">
              Start Navigating
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 bg-[#ff602e]/10 border border-[#ff602e]/20 px-3 py-1 rounded-full mb-6 animate-fade-in">
        <Navigation size={12} className="text-[#ff602e] animate-pulse" />
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#ff602e]">UniMap Campus Live</span>
      </div>

      {/* Hero Main Copy */}
      <div className="max-w-4xl text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.08] mb-6">
          Indoor Campus Navigation, <br />
          <span className="bg-gradient-to-r from-[#ff602e] to-[#ff8c66] bg-clip-text text-transparent">
            packed with smart tools.
          </span>
        </h1>
        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed mb-10">
          Compute optimal walkable routes across multi-floor lecture halls, buildings, and exits using smart accessibility modes, live SVG map transitions, and real-time step calculations.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link to="/map">
            <button className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-sm font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg active:scale-95 group">
              Start Navigating
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <a href="#features">
            <button className="bg-neutral-200/50 hover:bg-neutral-200 dark:bg-neutral-800/40 dark:hover:bg-neutral-800 text-neutral-800 dark:text-white border border-neutral-300/30 text-sm font-bold px-8 py-4 rounded-full transition-all duration-200 active:scale-95">
              Explore Features
            </button>
          </a>
        </div>
      </div>

      {/* Interactive Campus SVG Mockup (mimics application canvas) */}
      <div className="relative w-full max-w-4xl aspect-[16/10] bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-float p-6 flex flex-col">
        {/* Mockup Header bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-[10px] text-neutral-500 ml-4 font-mono select-none">unimap.live/navigation_engine</span>
          </div>
          <div className="w-24 h-5 rounded-full bg-white/5 border border-white/5" />
        </div>

        {/* Mockup Main Canvas Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden relative">
          {/* Mockup Sidebar */}
          <div className="hidden md:flex flex-col gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 text-left select-none">
            <div className="w-16 h-3 rounded bg-[#ff602e] opacity-80" />
            <div className="w-full h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div className="w-20 h-2.5 rounded bg-white/10" />
            </div>
            <div className="w-full h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-28 h-2.5 rounded bg-white/10" />
            </div>

            <div className="mt-4 border-t border-white/5 pt-4 flex flex-col gap-2">
              <div className="w-24 h-2.5 rounded bg-white/20" />
              <div className="w-full h-4 rounded bg-white/10" />
              <div className="w-5/6 h-4 rounded bg-white/10" />
            </div>
          </div>

          {/* Mockup Map Canvas Area */}
          <div className="col-span-3 bg-neutral-950/80 rounded-2xl border border-white/5 relative flex items-center justify-center overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(circle, #ff602e 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
            
            {/* SVG Path Route Simulation */}
            <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 500 300" fill="none">
              {/* Connection Grid Nodes */}
              <circle cx="100" cy="180" r="4" fill="rgba(255,255,255,0.2)" />
              <circle cx="200" cy="100" r="4" fill="rgba(255,255,255,0.2)" />
              <circle cx="300" cy="220" r="4" fill="rgba(255,255,255,0.2)" />
              <circle cx="400" cy="120" r="4" fill="rgba(255,255,255,0.2)" />

              {/* Edge Connections */}
              <path d="M100 180 L200 100 L300 220 L400 120" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 4" />

              {/* Shortest Path highlight */}
              <path d="M100 180 L200 100 L300 220" stroke="#ff602e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />

              {/* Start node pin */}
              <circle cx="100" cy="180" r="7" fill="#ffffff" stroke="#ff602e" strokeWidth="2" />

              {/* Destination node pin */}
              <circle cx="300" cy="220" r="7" fill="#ff602e" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Floating zoom keys */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white cursor-pointer select-none text-sm font-bold">+</div>
              <div className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white cursor-pointer select-none text-sm font-bold">-</div>
            </div>

            {/* Active Floor Badge */}
            <div className="absolute left-4 bottom-4 bg-[#ff602e] text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded">
              Floor 0 (Ground)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
