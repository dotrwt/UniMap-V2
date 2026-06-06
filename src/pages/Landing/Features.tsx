// src/pages/Landing/Features.tsx
import { Compass, Shield, MapPin, Search, Route } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="w-full bg-[#050505] text-white py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="radial-glow dark:radial-glow-cyan top-40 right-10" />
      <div className="radial-glow bottom-20 left-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header Block */}
        <div className="mb-20 text-center md:text-left">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#ff602e] bg-[#ff602e]/10 border border-[#ff602e]/20 px-3 py-1 rounded-full">
            Smart Capabilities
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-6 max-w-xl leading-tight">
            Navigation companion, packed with smart tools.
          </h2>
          <p className="text-neutral-400 text-sm mt-4 max-w-md">
            Everything you need to traverse complex multi-floor structures without friction. Built for modern university campuses.
          </p>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Multi-Floor Routing */}
          <div className="premium-card bg-[#0e0e0e] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between min-h-[350px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff602e]/5 rounded-bl-[100px] border-l border-b border-white/5 transition-all duration-300 group-hover:bg-[#ff602e]/10" />
            
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff602e] mb-8">
              <Compass size={24} />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff602e]">Algorithm</span>
              <h3 className="text-xl font-bold mt-2 mb-3">Multi-Floor Dijkstra Engine</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                Compute the mathematically shortest walkable path in milliseconds. Seamlessly transition between stairs, lifts, and corridors across multiple buildings.
              </p>
            </div>
          </div>

          {/* Card 2: Accessible Paths */}
          <div className="premium-card bg-[#0e0e0e] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between min-h-[350px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-[100px] border-l border-b border-white/5 transition-all duration-300 group-hover:bg-cyan-500/10" />

            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-8">
              <Shield size={24} />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Inclusivity</span>
              <h3 className="text-xl font-bold mt-2 mb-3">Accessible Routes First</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                Toggle preference filters to instantly exclude stairs, narrow corridors, or lift connections. UniMap customizes paths specifically to meet your physical needs.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 3: Interactive Maps */}
          <div className="premium-card bg-[#0e0e0e] border border-white/5 rounded-[32px] p-6 flex flex-col justify-between min-h-[280px]">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Cloudinary SVG Maps</h4>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Vector map floor plans render dynamically inside your client browser. Enjoy high-resolution scaling, responsive dimensions, and interactive node tapping overlays.
              </p>
            </div>
          </div>

          {/* Card 4: Room Finder Search */}
          <div className="premium-card bg-[#0e0e0e] border border-white/5 rounded-[32px] p-6 flex flex-col justify-between min-h-[280px]">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
              <Search size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Smart Room Finder</h4>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Autocomplete keyword searching helps you find any room, classroom, laboratory, exit, or amenities instantly without manual scrolling.
              </p>
            </div>
          </div>

          {/* Card 5: Pathfinding Preview */}
          <div className="premium-card bg-[#0e0e0e] border border-white/5 rounded-[32px] p-6 flex flex-col justify-between min-h-[280px]">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
              <Route size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Turn-By-Turn Steps</h4>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Read explicit navigation directions. Learn the exact stair transitions, lift actions, and distance changes to guarantee you never get lost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
