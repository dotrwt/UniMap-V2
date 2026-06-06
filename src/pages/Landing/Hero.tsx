// src/pages/Landing/Hero.tsx
import { Link } from 'react-router-dom';
import { Compass, School, BookOpen, Coffee, Flame, Heart, Search, Navigation } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-36 pb-24 px-4 md:px-8 overflow-hidden blueprint-grid text-neutral-900 dark:text-white">
      {/* Decorative top header blurred gradients */}
      <div className="absolute top-0 inset-x-0 h-[350px] bg-gradient-to-b from-[#ff602e]/5 to-transparent pointer-events-none" />

      {/* Floating Header Capsule Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[92%] max-w-2xl px-5 py-2.5 rounded-full glass-capsule shadow-xl shadow-black/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ff602e] flex items-center justify-center text-white">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">UniMap</span>
        </div>
        
        <div className="flex items-center gap-6 text-xs font-semibold text-neutral-400">
          <Link to="/" className="hover:text-white transition-colors text-white">Home</Link>
          <Link to="/map" className="hover:text-white transition-colors">Map</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link to="/map">
            <button className="bg-[#ff602e] hover:bg-[#ff7b52] text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-md">
              Start Navigating
            </button>
          </Link>
        </div>
      </nav>

      {/* Title Header */}
      <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-center leading-[1.05] max-w-4xl mb-12 select-none">
        Reimagine How <br />
        You Navigate <br />
        Your Campus
      </h1>

      {/* Device & Floating Cards Container */}
      <div className="relative w-full max-w-5xl flex items-center justify-center mb-14 min-h-[460px] sm:min-h-[580px]">
        {/* Soft Red Radial Glow behind the phone */}
        <div className="absolute w-[360px] h-[360px] rounded-full bg-[#ff602e]/25 blur-[60px] pointer-events-none z-0" />

        {/* LEFT FLOATING CARDS (Angled and absolute on desktop, hidden on tiny screens) */}
        <div className="hidden lg:flex flex-col gap-6 absolute left-12 z-10 w-[240px] select-none">
          {/* Card 1 */}
          <div className="bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/50 dark:border-white/5 rounded-2xl p-3 shadow-md flex items-center gap-3 -rotate-[6deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <School size={18} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[11px] font-bold truncate">Main Hall</h4>
              <p className="text-[9px] text-neutral-500 truncate">Lobby • Ground Floor</p>
            </div>
            <span className="text-[9px] font-bold text-[#ff602e] shrink-0">120m</span>
          </div>

          {/* Card 2 */}
          <div className="bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/50 dark:border-white/5 rounded-2xl p-3 shadow-md flex items-center gap-3 rotate-[3deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Flame size={18} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[11px] font-bold truncate">AI Lab</h4>
              <p className="text-[9px] text-neutral-500 truncate">Block B • Floor 3</p>
            </div>
            <span className="text-[9px] font-bold text-[#ff602e] shrink-0">340m</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/50 dark:border-white/5 rounded-2xl p-3 shadow-md flex items-center gap-3 -rotate-[2deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[11px] font-bold truncate">Central Library</h4>
              <p className="text-[9px] text-neutral-500 truncate">Reading Area</p>
            </div>
            <span className="text-[9px] font-bold text-[#ff602e] shrink-0">80m</span>
          </div>
        </div>

        {/* MOBILE SMARTPHONE DEVICE MOCKUP */}
        <div className="relative z-20 w-[270px] sm:w-[310px] aspect-[9/18.5] bg-neutral-950 border-[10px] border-neutral-950 dark:border-neutral-900 rounded-[44px] shadow-2xl overflow-hidden flex flex-col">
          {/* Smartphone Status Bar / Notch */}
          <div className="h-6 bg-neutral-950 shrink-0 w-full px-5 flex items-center justify-between text-[10px] font-semibold text-neutral-400 select-none">
            <span>9:41</span>
            {/* Dynamic Island Notch */}
            <div className="w-[85px] h-4 rounded-full bg-black mx-auto" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[10px]">wifi</span>
              <span className="material-symbols-outlined text-[10px]">battery_5_bar</span>
            </div>
          </div>

          {/* Mobile Screen Placeholder View (UniMap Mobile UI Mockup) */}
          <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-col justify-between overflow-hidden relative">
            {/* Top Search bar */}
            <div className="flex flex-col gap-2 relative z-10">
              <div className="w-full h-9 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 flex items-center px-3 gap-2 shadow-sm">
                <Search size={14} className="text-neutral-400" />
                <span className="text-[10px] text-neutral-400 font-semibold">Search rooms, lectures...</span>
              </div>
            </div>

            {/* Stylized vector map overlay */}
            <div className="absolute inset-0 z-0 opacity-25 dark:opacity-20" style={{
              backgroundImage: 'radial-gradient(circle, #ff602e 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Path illustration */}
            <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 200 350" fill="none">
              <path d="M 40 250 L 100 160 L 150 200 L 90 80" stroke="#ff602e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
              <circle cx="40" cy="250" r="5" fill="#ffffff" stroke="#ff602e" strokeWidth="2" />
              <circle cx="90" cy="80" r="5" fill="#ff602e" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Bottom floating route status card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-3 shadow-md text-left z-10">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-black text-neutral-900 dark:text-white">To: AI Lab</span>
                <span className="text-[9px] font-bold text-cyan-500 uppercase">Fastest</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                <Navigation size={10} className="text-[#ff602e]" />
                <span>2 min • 140m • Floor 3</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FLOATING CARDS (Angled and absolute on desktop, hidden on tiny screens) */}
        <div className="hidden lg:flex flex-col gap-6 absolute right-12 z-10 w-[240px] select-none">
          {/* Card 4 */}
          <div className="bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/50 dark:border-white/5 rounded-2xl p-3 shadow-md flex items-center gap-3 rotate-[5deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
              <Coffee size={18} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[11px] font-bold truncate">Student Cafe</h4>
              <p className="text-[9px] text-neutral-500 truncate">Amenities • Floor 1</p>
            </div>
            <span className="text-[9px] font-bold text-[#ff602e] shrink-0">210m</span>
          </div>

          {/* Card 5 */}
          <div className="bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/50 dark:border-white/5 rounded-2xl p-3 shadow-md flex items-center gap-3 -rotate-[3deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Heart size={18} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[11px] font-bold truncate">Health Center</h4>
              <p className="text-[9px] text-neutral-500 truncate">Medical Wing</p>
            </div>
            <span className="text-[9px] font-bold text-[#ff602e] shrink-0">450m</span>
          </div>

          {/* Card 6 */}
          <div className="bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/50 dark:border-white/5 rounded-2xl p-3 shadow-md flex items-center gap-3 rotate-[2deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Compass size={18} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-[11px] font-bold truncate">Main Gate</h4>
              <p className="text-[9px] text-neutral-500 truncate">South Entrance</p>
            </div>
            <span className="text-[9px] font-bold text-[#ff602e] shrink-0">0m</span>
          </div>
        </div>
      </div>

      {/* Sub-text description */}
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm text-center leading-relaxed mb-6 select-none">
        From lecture halls to labs — explore every corner of your university with indoor navigation.
      </p>

      {/* Action Button */}
      <Link to="/map" className="mb-10">
        <button className="bg-[#ff602e] hover:bg-[#ff7b52] text-white font-extrabold text-xs px-8 py-3.5 rounded-full transition-all duration-200 active:scale-95 shadow-lg shadow-[#ff602e]/25">
          Start Navigating
        </button>
      </Link>

      {/* Browser Availability Badges */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-4">
          <img src="https://www.google.com/chrome/static/images/chrome-logo-m100.svg" alt="Chrome" className="w-6 h-6 grayscale hover:grayscale-0 transition-all duration-200" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg" alt="Firefox" className="w-5 h-5 grayscale hover:grayscale-0 transition-all duration-200" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg" alt="Safari" className="w-5 h-5 grayscale hover:grayscale-0 transition-all duration-200" />
        </div>
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider select-none">Also available in browsers</span>
      </div>
    </section>
  );
}
