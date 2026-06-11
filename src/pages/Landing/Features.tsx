// src/pages/Landing/Features.tsx
import { Link } from 'react-router-dom';
import { Bell, MousePointerClick, TrendingUp } from 'lucide-react';
import './features.css';

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
                <button className="mt-2 bg-[#121212] border border-white/10 hover:bg-neutral-900 hover:border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-md cursor-pointer">
                  Start Navigating
                </button>
              </Link>
            </div>
          </div>

          {/* Outer container box wrapping the 2x2 Feature Cards Grid */}
          <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-[40px] p-3">
            {/* 2x2 Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

              {/* Card 1: Indoor Navigation with iPhone notification list mockup */}
              <div className="feature-grid-card feature-glass-card rounded-[32px] p-8 flex flex-col justify-between h-[480px] relative overflow-hidden group">
                {/* Top Area: iPhone Mockup with Notifications */}
                <div className="h-[240px] w-full flex items-center justify-center relative overflow-hidden">
                  <div className="w-[200px] h-[340px] bg-gradient-to-tr from-[#a2e3c4] via-[#fbc4ab] to-[#bde0fe] rounded-[36px] border-[5px] border-neutral-900 shadow-2xl rotate-[-12deg] translate-y-16 relative overflow-hidden flex flex-col justify-between p-3 select-none">
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
                      <div className="notification-glass rounded-xl p-2.5 shadow-sm text-left flex items-center gap-2">
                        {/* Orange STX-like icon */}
                        <div className="w-6 h-6 rounded-lg bg-[#FF602E] flex items-center justify-center text-white shrink-0">
                          <svg viewBox="0 0 100 100" className="w-4.5 h-4.5">
                            <g fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" transform="translate(10, 10) scale(0.8)">
                              <path d="M25 35 L75 35 M25 35 L25 45 M75 35 L75 45" />
                              <path d="M25 50 L75 50" />
                              <path d="M25 65 L75 65 M25 65 L25 55 M75 65 L75 55" />
                              <path d="M50 35 L50 65" />
                            </g>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[9px] font-bold text-neutral-900 leading-tight">You received 0.02 BTC</h5>
                          <p className="text-[7px] text-neutral-500 font-medium leading-tight">Tap to view this transaction</p>
                        </div>
                      </div>

                      {/* Notification 2 */}
                      <div className="notification-glass rounded-xl p-2.5 shadow-sm text-left flex items-center gap-2">
                        {/* Blue double-arrow/swap icon */}
                        <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[9px] font-bold text-neutral-900 leading-tight">Swap completed</h5>
                          <p className="text-[7px] text-neutral-500 font-medium leading-tight">View details</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom lockscreen elements */}
                    <div className="flex justify-between items-center px-2 pb-1 relative z-10 text-neutral-800 opacity-60">
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
                    Turn-by-turn directions inside academic blocks, departments, and campus buildings.
                  </p>
                </div>
              </div>

              {/* Card 2: Room Finder with 3D Coin mockup */}
              <div className="feature-grid-card feature-glass-card rounded-[32px] p-8 flex flex-col justify-between h-[480px] relative overflow-hidden group">
                {/* Top Area: Floating 3D Gold Bitcoin Coin */}
                <div className="h-[240px] w-full flex items-center justify-center relative overflow-hidden coin-perspective">
                  {/* Radial Blur Glow */}
                  <div className="absolute w-44 h-44 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
                  {/* Blurry gold background bar */}
                  <div className="absolute w-48 h-16 bg-[#D4AF37]/25 blur-xl rounded-full translate-y-2 pointer-events-none" />

                  {/* Gold Coin container */}
                  <div className="coin-3d w-28 h-28 relative z-10 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(212,175,55,0.4)]">
                      <defs>
                        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFE082" />
                          <stop offset="30%" stopColor="#FFD54F" />
                          <stop offset="70%" stopColor="#FFB300" />
                          <stop offset="100%" stopColor="#FFA000" />
                        </linearGradient>
                        <linearGradient id="gold-rim-grad" x1="100%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#FFF59D" />
                          <stop offset="50%" stopColor="#FFD54F" />
                          <stop offset="100%" stopColor="#FF8F00" />
                        </linearGradient>
                      </defs>
                      {/* Outermost rim */}
                      <circle cx="50" cy="50" r="46" fill="url(#gold-rim-grad)" />
                      {/* Inner circle */}
                      <circle cx="50" cy="50" r="38" fill="url(#gold-grad)" stroke="#FFF59D" strokeWidth="1.5" />
                      {/* Bitcoin B symbol */}
                      <text x="50" y="66" textAnchor="middle" fontSize="46" fontWeight="bold" fill="#7F4200" fontFamily="serif">₿</text>
                      <text x="48.5" y="64.5" textAnchor="middle" fontSize="46" fontWeight="bold" fill="#FFFFFF" fontFamily="serif">₿</text>
                    </svg>
                  </div>
                </div>

                {/* Bottom Text Area */}
                <div className="relative z-10">
                  <MousePointerClick className="w-5 h-5 text-neutral-400 mb-3" />
                  <h3 className="text-[17px] font-bold text-white mb-1.5">Room Finder</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                    Search classrooms, labs, offices, and facilities instantly and get directions in seconds.
                  </p>
                </div>
              </div>

              {/* Card 3: Astronaut Quote Card with generated background image */}
              <div
                className="feature-grid-card border border-white/10 rounded-[32px] p-8 flex flex-col justify-end h-[480px] relative overflow-hidden bg-cover bg-center group"
                style={{ backgroundImage: 'url(/astronaut_field_feature.png)' }}
              >
                {/* Bottom fading dark overlay for readability */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                <div className="relative z-10 text-left">
                  <p className="text-white text-[15px] font-medium leading-relaxed max-w-sm mb-4">
                    "A university campus should empower students to focus on learning—not on figuring out where to go."
                  </p>
                  <span className="text-neutral-400 text-xs font-semibold"> — Team UniMap </span>
                </div>
              </div>

              {/* Card 4: Portfolio Insights with SVG line chart card mockup */}
              <div className="feature-grid-card feature-glass-card rounded-[32px] p-8 flex flex-col justify-between h-[480px] relative overflow-hidden group">
                {/* Top Area: Tilted Wallet Card */}
                <div className="h-[240px] w-full flex items-center justify-center relative overflow-hidden">
                  <div className="w-[85%] bg-[#ffffff] border border-neutral-200/50 rounded-2xl p-4 shadow-xl rotate-[-6deg] translate-y-6 select-none relative z-10 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-neutral-800">
                      <span className="text-[10px] font-bold font-mono text-neutral-900">Portfolio</span>
                      <span className="text-[8px] text-neutral-400 font-semibold">14 Oct, 13:12</span>
                    </div>

                    {/* SVG line chart */}
                    <div className="relative h-20 w-full flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                        {/* Gridlines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                        <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                        {/* Filled area under curve */}
                        <path
                          d="M 0 40 L 0 24 Q 25 8 45 32 T 85 16 L 100 28 L 100 40 Z"
                          fill="url(#feature-chart-grad-red)"
                          opacity="0.12"
                        />

                        {/* Curve */}
                        <path
                          d="M 0 24 Q 25 8 45 32 T 85 16 L 100 28"
                          fill="none"
                          stroke="#FF4D00"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        {/* Bubble Point */}
                        <circle cx="62" cy="22" r="3.5" fill="#FF4D00" stroke="#ffffff" strokeWidth="1" />

                        <defs>
                          <linearGradient id="feature-chart-grad-red" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF4D00" />
                            <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Floating Black Value Tag */}
                      <div className="absolute left-[54%] top-[18%] bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md z-20">
                        $1.50
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Text Area */}
                <div className="relative z-10">
                  <TrendingUp className="w-5 h-5 text-neutral-400 mb-3" />
                  <h3 className="text-[17px] font-bold text-white mb-1.5">Campus Directory</h3>
                  <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                    Quickly locate departments, faculty offices, libraries, hostels, and student services.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Second Sub-section Header */}
          <div className="text-center mt-28 mb-16">
            <h3 className="text-3xl md:text-[36px] font-medium tracking-tight text-white leading-tight">
              Explore Every Corner of Campus
            </h3>
          </div>

          {/* 3-Column Small Cards Grid */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-0 max-w-5xl mx-auto">

            {/* Card A */}
            <div className="feature-grid-card card-overlap-a feature-glass-card w-full md:w-1/3 rounded-[24px] p-6 flex flex-col justify-between min-h-[180px]">
              <div className="flex gap-2.5">
                {/* Dog Hoodie Avatar */}
                <svg viewBox="0 0 100 100" className="w-11 h-11 rounded-xl shadow-md select-none shrink-0">
                  <rect width="100" height="100" fill="#E6C594" />
                  <path d="M10 90 C 10 45, 90 45, 90 90 Z" fill="#5D4037" />
                  <circle cx="50" cy="55" r="28" fill="#3E2723" />
                  <circle cx="50" cy="58" r="22" fill="#FFA726" />
                  <path d="M35 55 C 35 48, 42 45, 50 50 C 58 45, 65 48, 65 55 C 65 65, 35 65, 35 55 Z" fill="#FFFFFF" />
                  <circle cx="43" cy="52" r="3" fill="#1C1C1C" />
                  <circle cx="57" cy="52" r="3" fill="#1C1C1C" />
                  <polygon points="48,58 52,58 50,61" fill="#1C1C1C" />
                  <path d="M47 63 Q50 65 53 63" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <circle cx="50" cy="55" r="28" stroke="#5D4037" strokeWidth="3" fill="none" />
                </svg>

                {/* Blue Cat Avatar */}
                <svg viewBox="0 0 100 100" className="w-11 h-11 rounded-xl shadow-md select-none shrink-0">
                  <rect width="100" height="100" fill="#29B6F6" />
                  <polygon points="20,35 40,55 15,65" fill="#0288D1" />
                  <polygon points="80,35 60,55 85,65" fill="#0288D1" />
                  <circle cx="50" cy="62" r="28" fill="#03A9F4" />
                  <rect x="26" y="52" width="22" height="16" rx="5" stroke="#FF3D00" strokeWidth="4.5" fill="none" />
                  <rect x="52" y="52" width="22" height="16" rx="5" stroke="#FF3D00" strokeWidth="4.5" fill="none" />
                  <line x1="48" y1="60" x2="52" y2="60" stroke="#FF3D00" strokeWidth="4.5" />
                  <polygon points="48,72 52,72 50,75" fill="#1A1A1A" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-neutral-200 leading-snug max-w-[200px]">
                Locate classrooms, lecture theatres, and labs.
              </p>
            </div>

            {/* Card B */}
            <div className="feature-grid-card card-overlap-b feature-glass-card w-full md:w-1/3 rounded-[24px] p-6 flex flex-col justify-between min-h-[180px]">
              <div className="flex -space-x-2.5">
                {/* Frog Avatar */}
                <svg viewBox="0 0 100 100" className="w-11 h-11 rounded-xl shadow-md border-2 border-[#0c0c0c] z-30 select-none shrink-0">
                  <rect width="100" height="100" fill="#FFCC80" />
                  <path d="M10 90 C 10 48, 90 48, 90 90 Z" fill="#4E342E" />
                  <circle cx="50" cy="56" r="26" fill="#2D1C18" />
                  <circle cx="50" cy="58" r="20" fill="#66BB6A" />
                  <circle cx="38" cy="44" r="8" fill="#66BB6A" />
                  <circle cx="62" cy="44" r="8" fill="#66BB6A" />
                  <rect x="28" y="46" width="20" height="11" rx="3" fill="#212121" />
                  <rect x="52" y="46" width="20" height="11" rx="3" fill="#212121" />
                  <line x1="48" y1="51" x2="52" y2="51" stroke="#212121" strokeWidth="3" />
                </svg>

                {/* Cowboy Cactus Avatar */}
                <svg viewBox="0 0 100 100" className="w-11 h-11 rounded-xl shadow-md border-2 border-[#0c0c0c] z-20 select-none shrink-0">
                  <rect width="100" height="100" fill="#C8E6C9" />
                  <rect x="36" y="42" width="28" height="58" rx="14" fill="#388E3C" />
                  <rect x="22" y="52" width="16" height="16" rx="8" fill="#388E3C" />
                  <rect x="62" y="58" width="16" height="16" rx="8" fill="#388E3C" />
                  <ellipse cx="50" cy="40" rx="34" ry="6" fill="#8D6E63" />
                  <path d="M30 39 C 30 22, 70 22, 70 39 Z" fill="#5D4037" />
                  <circle cx="44" cy="58" r="2.5" fill="#FFFFFF" />
                  <circle cx="56" cy="58" r="2.5" fill="#FFFFFF" />
                  <path d="M48 65 Q50 67 52 65" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>

                {/* Monkey Avatar */}
                <svg viewBox="0 0 100 100" className="w-11 h-11 rounded-xl shadow-md border-2 border-[#0c0c0c] z-10 select-none shrink-0">
                  <rect width="100" height="100" fill="#D1C4E9" />
                  <path d="M10 90 C 10 46, 90 46, 90 90 Z" fill="#1565C0" />
                  <circle cx="50" cy="54" r="26" fill="#0D47A1" />
                  <circle cx="50" cy="56" r="20" fill="#A1887F" />
                  <path d="M36 56 C 36 48, 50 48, 50 56 C 50 48, 64 48, 64 56 C 64 68, 36 68, 36 56 Z" fill="#D7CCC8" />
                  <rect x="31" y="49" width="17" height="12" rx="3" fill="#F57C00" />
                  <rect x="52" y="49" width="17" height="12" rx="3" fill="#F57C00" />
                  <line x1="48" y1="55" x2="52" y2="55" stroke="#F57C00" strokeWidth="3" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-neutral-200 leading-snug max-w-[200px]">
                Find administration offices, help desks, and support centers.
              </p>
            </div>

            {/* Card C */}
            <div className="feature-grid-card card-overlap-c feature-glass-card w-full md:w-1/3 rounded-[24px] p-6 flex flex-col justify-between min-h-[180px]">
              <div className="w-11 h-11 rounded-xl bg-[#ff602e] flex items-center justify-center text-white shadow-sm overflow-hidden p-2 select-none shrink-0">
                {/* Stacks SVG Logo */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <g fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" transform="translate(10, 10) scale(0.8)">
                    <path d="M25 35 L75 35 M25 35 L25 45 M75 35 L75 45" />
                    <path d="M25 50 L75 50" />
                    <path d="M25 65 L75 65 M25 65 L25 55 M75 65 L75 55" />
                    <path d="M50 35 L50 65" />
                  </g>
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-neutral-200 leading-snug max-w-[200px]">
                Discover cafeterias, libraries, auditoriums, and common areas.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
