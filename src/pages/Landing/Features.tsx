// src/pages/Landing/Features.tsx
import { Link } from 'react-router-dom';
import { Bell, History } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="w-full bg-transparent px-[10px] py-4 relative select-none">
      <div className="w-full bg-[#050505] text-white border border-white/10 rounded-[32px] md:rounded-[40px] py-24 px-6 md:px-12 relative overflow-hidden">
        {/* Subtle background glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-[#ff602e]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-[42px] font-medium tracking-tight leading-[1.08] text-white">
              Your ultimate campus <br />
              companion, <br />
              packed with smart tools
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 text-left md:text-right shrink-0">
            <p className="text-neutral-400 text-sm font-medium">From turn-by-turn indoor directions</p>
            <p className="text-neutral-400 text-sm font-medium">UniMap elevates every campus experience.</p>
            <Link to="/map">
              <button className="mt-2 bg-[#121212] border border-white/10 hover:bg-neutral-900 hover:border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-md">
                Start Navigating
              </button>
            </Link>
          </div>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Card 1: Indoor Navigation with iPhone notification list mockup */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between h-[480px] relative overflow-hidden group">
            {/* Top Area: iPhone Mockup with Notifications */}
            <div className="h-[240px] w-full flex items-center justify-center relative overflow-hidden">
              <div className="w-[200px] h-[340px] bg-gradient-to-tr from-[#9bd8db] to-[#e6aeb7] rounded-[36px] border-[5px] border-neutral-900 shadow-2xl rotate-[-12deg] translate-y-16 relative overflow-hidden flex flex-col justify-between p-3">
                {/* Dynamic Island Notch */}
                <div className="w-16 h-3.5 bg-black rounded-full mx-auto shrink-0 mb-3" />
                
                {/* Status Bar */}
                <div className="absolute top-1 inset-x-0 px-5 flex justify-between text-[7px] text-neutral-800 font-bold select-none">
                  <span>9:41</span>
                  <div className="flex gap-0.5">
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Notifications Stack */}
                <div className="flex flex-col gap-2 relative z-10 mt-1">
                  {/* Notification 1 */}
                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-2.5 shadow-sm text-left border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#ff602e] flex items-center justify-center text-white shrink-0 text-[10px]">
                      🚀
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[9px] font-bold text-neutral-800 leading-tight">You received 0.02 BTC</h5>
                      <p className="text-[7px] text-neutral-500 leading-tight">Tap to view this transaction</p>
                    </div>
                  </div>

                  {/* Notification 2 */}
                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-2.5 shadow-sm text-left border border-white/10 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-neutral-950 flex items-center justify-center text-white shrink-0 text-[10px]">
                      🔄
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[9px] font-bold text-neutral-800 leading-tight">Swap completed</h5>
                      <p className="text-[7px] text-neutral-500 leading-tight">View details</p>
                    </div>
                  </div>
                </div>

                {/* Bottom lockscreen elements */}
                <div className="flex justify-between items-center px-2 pb-1 relative z-10 text-neutral-800">
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-[10px]">📷</div>
                  <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-[10px]">🔦</div>
                </div>
              </div>
            </div>

            {/* Bottom Text Area */}
            <div className="relative z-10">
              <Bell className="w-5 h-5 text-neutral-400 mb-3" />
              <h3 className="text-[17px] font-bold text-white mb-1.5">Indoor Navigation</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                Turn-by-turn directions inside every building. Never get lost in a lecture hall maze again
              </p>
            </div>
          </div>

          {/* Card 2: Room Finder with 3D Coin mockup */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between h-[480px] relative overflow-hidden group">
            {/* Top Area: Floating 3D Gold Bitcoin Coin */}
            <div className="h-[240px] w-full flex items-center justify-center relative overflow-hidden">
              {/* Radial Blur Glow */}
              <div className="absolute w-36 h-36 rounded-full bg-yellow-500/20 blur-3xl pointer-events-none" />
              
              {/* Gold Coin container */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-300 border-[3px] border-yellow-200 shadow-2xl flex items-center justify-center animate-bounce-slow relative z-10">
                <div className="w-19 h-19 rounded-full border border-yellow-500/50 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-yellow-900 tracking-tighter select-none font-serif">₿</span>
                </div>
              </div>
            </div>

            {/* Bottom Text Area */}
            <div className="relative z-10">
              <div className="w-5 h-5 text-neutral-400 mb-3 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">pan_tool_alt</span>
              </div>
              <h3 className="text-[17px] font-bold text-white mb-1.5">Room Finder</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                Search any room or facility and get instant directions
              </p>
            </div>
          </div>

          {/* Card 3: Astronaut Quote Card with generated background image */}
          <div 
            className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 flex flex-col justify-end h-[480px] relative overflow-hidden bg-cover bg-center group"
            style={{ backgroundImage: 'url(/astronaut_field_feature.png)' }}
          >
            {/* Bottom fading dark overlay for readability */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

            <div className="relative z-10 text-left">
              <p className="text-white text-[15px] font-medium leading-relaxed max-w-sm mb-4">
                "A university campus should be a place where every student feels empowered to find their way — to knowledge, to community, to belonging."
              </p>
              <span className="text-neutral-400 text-xs font-semibold">-- The UniMap Team</span>
            </div>
          </div>

          {/* Card 4: Portfolio Insights with SVG line chart card mockup */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[32px] p-8 flex flex-col justify-between h-[480px] relative overflow-hidden group">
            {/* Top Area: Tilted Wallet Card */}
            <div className="h-[240px] w-full flex items-center justify-center relative overflow-hidden">
              <div className="w-[85%] bg-[#faf8f5] dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-2xl p-4 shadow-lg rotate-[-6deg] translate-y-6 select-none relative z-10 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-900 dark:text-white font-mono">Portfolio</span>
                  <span className="text-[8px] text-neutral-400">24 Oct, 15:32</span>
                </div>
                
                {/* SVG line chart */}
                <div className="relative h-20 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                    <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                    
                    <path
                      d="M 0 40 L 0 20 Q 20 5 40 30 T 80 15 L 100 25 L 100 40 Z"
                      fill="url(#feature-chart-grad)"
                      opacity="0.1"
                    />
                    
                    <path
                      d="M 0 20 Q 20 5 40 30 T 80 15 L 100 25"
                      fill="none"
                      stroke="#ff602e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    
                    <circle cx="70" cy="18" r="3" fill="#ff602e" />
                    
                    <defs>
                      <linearGradient id="feature-chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff602e" />
                        <stop offset="100%" stopColor="#ff602e" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute left-[55%] top-[15%] bg-black text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-md">
                    52,342
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text Area */}
            <div className="relative z-10">
              <History className="w-5 h-5 text-neutral-400 mb-3" />
              <h3 className="text-[17px] font-bold text-white mb-1.5">Real-Time Portfolio Insights</h3>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                Track your Bitcoin balance and transaction history with live updates.
              </p>
            </div>
          </div>

        </div>

        {/* Second Sub-section Header */}
        <div className="text-center mt-28 mb-16">
          <h3 className="text-3xl md:text-[36px] font-medium tracking-tight text-white leading-tight">
            Explore, discover, and connect <br />
            seamlessly across campus
          </h3>
        </div>

        {/* 3-Column Small Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card A */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between min-h-[180px]">
            <div className="flex gap-2">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-sm">
                🐶
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center text-xl shadow-sm">
                🐱
              </div>
            </div>
            <p className="text-[14px] font-semibold text-neutral-200 leading-snug max-w-[200px]">
              Mint and Secure SRC-20 Tokens
            </p>
          </div>

          {/* Card B */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between min-h-[180px]">
            <div className="flex -space-x-2">
              <div className="w-11 h-11 rounded-xl bg-orange-200 flex items-center justify-center text-xl shadow-sm border border-[#0c0c0c] z-30">
                🐊
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-200 flex items-center justify-center text-xl shadow-sm border border-[#0c0c0c] z-20">
                🌵
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-200 flex items-center justify-center text-xl shadow-sm border border-[#0c0c0c] z-10">
                🐵
              </div>
            </div>
            <p className="text-[14px] font-semibold text-neutral-200 leading-snug max-w-[200px]">
              Trade, Collect, and Inscribe Ordinals
            </p>
          </div>

          {/* Card C */}
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between min-h-[180px]">
            <div className="w-11 h-11 rounded-xl bg-[#ff602e] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-lg">star_rate</span>
            </div>
            <p className="text-[14px] font-semibold text-neutral-200 leading-snug max-w-[200px]">
              Purchase STX tokens to power L2 apps on Stacks.
            </p>
          </div>

        </div>

      </div>
      </div>
    </section>
  );
}
