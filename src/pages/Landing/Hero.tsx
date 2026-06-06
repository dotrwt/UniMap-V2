// src/pages/Landing/Hero.tsx
import { Link } from 'react-router-dom';
import { Compass, School, BookOpen, Coffee, Flame, Heart, ArrowUpDown } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-32 pb-24 px-4 md:px-8 overflow-hidden blueprint-grid text-neutral-900 dark:text-white">
      {/* Decorative top background gradient mist */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#ff602e]/5 to-transparent pointer-events-none" />

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

      {/* Hero Headline - Large high-contrast typography matching reference */}
      <h1 className="text-5xl sm:text-7xl md:text-[80px] lg:text-[92px] font-extrabold tracking-tight text-center leading-[1.03] max-w-5xl mt-10 mb-14 select-none">
        Reimagine How <br />
        You Navigate <br />
        Your Campus
      </h1>

      {/* Device & Floating Cards Area */}
      <div className="relative w-full max-w-6xl flex items-center justify-center mb-16 min-h-[520px] sm:min-h-[660px]">
        
        {/* Soft Red/Coral Background Glow */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-[#ff602e]/20 blur-[75px] pointer-events-none z-0" />

        {/* LEFT FLOATING CARDS - Angled fan-out layout matching reference */}
        <div className="hidden lg:flex flex-col gap-10 absolute left-8 xl:left-16 z-10 w-[260px] select-none">
          {/* Card 1 - Left Top */}
          <div className="bg-[#faf7f2]/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-4 -translate-y-4 translate-x-4 -rotate-[6deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <School size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">Main Hall</h4>
              <p className="text-[10px] text-neutral-400 truncate">Lobby • Floor 0</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">120m</span>
              <p className="text-[9px] text-neutral-400">Distance</p>
            </div>
          </div>

          {/* Card 2 - Left Middle */}
          <div className="bg-[#faf7f2]/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-4 translate-x-0 rotate-[3deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Flame size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">AI Research Lab</h4>
              <p className="text-[10px] text-neutral-400 truncate">Block B • Floor 3</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">340m</span>
              <p className="text-[9px] text-neutral-400">Distance</p>
            </div>
          </div>

          {/* Card 3 - Left Bottom */}
          <div className="bg-[#faf7f2]/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-4 translate-y-4 translate-x-3 -rotate-[4deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">Central Library</h4>
              <p className="text-[10px] text-neutral-400 truncate">Reading Area</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">80m</span>
              <p className="text-[9px] text-neutral-400">Distance</p>
            </div>
          </div>
        </div>

        {/* IPHONE DEVICE MOCKUP - Silver/Metallic Bezels & Button Accents */}
        <div className="relative z-20 w-[280px] sm:w-[320px] aspect-[9/18.6] bg-neutral-950 rounded-[48px] shadow-2xl p-[6px] border border-neutral-800 dark:border-neutral-700 flex flex-col justify-between">
          
          {/* Metallic Side Buttons */}
          <div className="absolute -left-[2px] top-24 w-[3px] h-10 bg-neutral-500 dark:bg-neutral-600 rounded-l" />
          <div className="absolute -left-[2px] top-38 w-[3px] h-12 bg-neutral-500 dark:bg-neutral-600 rounded-l" />
          <div className="absolute -left-[2px] top-54 w-[3px] h-12 bg-neutral-500 dark:bg-neutral-600 rounded-l" />
          <div className="absolute -right-[2px] top-44 w-[3px] h-20 bg-neutral-500 dark:bg-neutral-600 rounded-r" />

          {/* Inner Glossy Screen Boundary Bezel */}
          <div className="flex-1 bg-neutral-900 rounded-[42px] overflow-hidden flex flex-col justify-between border-[5px] border-neutral-950">
            
            {/* Status Bar Section */}
            <div className="h-9 bg-transparent shrink-0 w-full px-6 flex items-center justify-between text-[11px] font-bold text-neutral-950 dark:text-neutral-400 select-none z-20">
              <span>9:41</span>
              {/* Dynamic Island Notch */}
              <div className="w-[90px] h-[22px] rounded-full bg-black mx-auto shrink-0" />
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px] font-bold">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[11px] font-bold">wifi</span>
                <span className="material-symbols-outlined text-[11px] font-bold">battery_5_bar</span>
              </div>
            </div>

            {/* Mobile View Placeholder Screen */}
            <div className="flex-1 bg-[#fbf9f4] dark:bg-neutral-950 px-4 pt-1 pb-4 flex flex-col justify-between overflow-hidden relative">
              
              {/* Screen Top Header Bar */}
              <div className="flex items-center justify-between text-neutral-900 dark:text-white mb-2 relative z-10">
                <span className="material-symbols-outlined text-lg cursor-pointer">arrow_back</span>
                <span className="text-[13px] font-extrabold tracking-tight">Route</span>
                <div className="w-5" />
              </div>

              {/* Input Cards Area */}
              <div className="flex flex-col gap-1.5 relative z-10">
                
                {/* From Input Card (with exact blue border outline matching 'Swap') */}
                <div className="bg-[#faf7f2]/90 dark:bg-neutral-900/90 border-2 border-blue-500 rounded-xl p-3 shadow-sm flex items-center justify-between text-left">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">From</span>
                    <h5 className="text-[12px] font-extrabold text-neutral-900 dark:text-white mt-0.5">Main Gate</h5>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400">0m</span>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-2.5 relative z-20">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 flex items-center justify-center text-neutral-900 dark:text-white shadow">
                    <ArrowUpDown size={11} />
                  </div>
                </div>

                {/* To Input Card */}
                <div className="bg-[#faf7f2]/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-white/5 rounded-xl p-3 shadow-sm flex items-center justify-between text-left">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">To</span>
                    <h5 className="text-[12px] font-extrabold text-neutral-900 dark:text-white mt-0.5">AI Research Lab</h5>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400">340m</span>
                </div>
              </div>

              {/* Keypad Layout Area (matches Swap numeric interface layout) */}
              <div className="grid grid-cols-3 gap-y-2.5 gap-x-4 px-1.5 my-3 relative z-10 select-none">
                {[
                  { label: '1' }, { label: '2' }, { label: '3' },
                  { label: '4' }, { label: '5' }, { label: '6' },
                  { label: '7' }, { label: '8' }, { label: '9' },
                  { label: '.' }, { label: '0' }, { label: '←', action: true }
                ].map((keyItem, index) => (
                  <div 
                    key={index}
                    className="h-10 rounded-lg flex items-center justify-center text-[15px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {keyItem.label}
                  </div>
                ))}
              </div>

              {/* Main Action Button */}
              <div className="relative z-10 w-full">
                <button className="w-full bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-[12px] font-black py-3 rounded-xl transition-all duration-200 shadow">
                  Start Navigation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FLOATING CARDS - Angled fan-out layout matching reference */}
        <div className="hidden lg:flex flex-col gap-10 absolute right-8 xl:right-16 z-10 w-[260px] select-none">
          {/* Card 4 - Right Top */}
          <div className="bg-[#faf7f2]/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-4 -translate-y-4 -translate-x-4 rotate-[5deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
              <Coffee size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">Student Cafe</h4>
              <p className="text-[10px] text-neutral-400 truncate">Amenities • Floor 1</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">210m</span>
              <p className="text-[9px] text-neutral-400">Distance</p>
            </div>
          </div>

          {/* Card 5 - Right Middle */}
          <div className="bg-[#faf7f2]/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-4 translate-x-0 -rotate-[3deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Heart size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">Health Center</h4>
              <p className="text-[10px] text-neutral-400 truncate">Medical Wing</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">450m</span>
              <p className="text-[9px] text-neutral-400">Distance</p>
            </div>
          </div>

          {/* Card 6 - Right Bottom */}
          <div className="bg-[#faf7f2]/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-sm flex items-center gap-4 translate-y-4 -translate-x-3 rotate-[2deg] transform hover:rotate-0 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Compass size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">Main Gate</h4>
              <p className="text-[10px] text-neutral-400 truncate">South Entrance</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">0m</span>
              <p className="text-[9px] text-neutral-400">Distance</p>
            </div>
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
