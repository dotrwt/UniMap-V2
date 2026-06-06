// src/components/ui/Footer.tsx
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import './footer.css';

/** A dark themed, starry-sky styled card footer component matching the design spec. */
export default function Footer() {
  return (
    <footer className="w-full bg-transparent px-[10px] pb-6 pt-4 relative select-none">
      <div className="footer-card w-full text-white rounded-[32px] md:rounded-[40px] py-16 px-6 md:px-12 relative flex flex-col items-center">
        {/* Glow Effects */}
        <div className="footer-glow" />
        <div className="footer-star-glow" />
        <div className="footer-star-glow-2" />

        {/* Content Area - Relative & Z-indexed to be above the glow/stars */}
        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center">
          
          {/* Header Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.15] max-w-2xl mt-4 mb-8">
            Experience your campus like <br className="hidden sm:inline" />
            never before with UniMap
          </h2>

          {/* Action Button */}
          <Link to="/map" className="mb-8 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
            <button className="bg-[#FF4D00] hover:bg-[#FF6A00] text-white font-semibold text-xs px-8 py-3.5 rounded-full shadow-[0_8px_30px_rgba(255,77,0,0.4)] transition-all duration-200 cursor-pointer">
              Start Navigating
            </button>
          </Link>

          {/* Browser Icons Badges */}
          <div className="flex items-center gap-3 mb-2">
            {/* App Store (iOS) Badge */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md overflow-hidden select-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="appstore-grad-unique" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#35A7FF" />
                    <stop offset="100%" stopColor="#0066FF" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#appstore-grad-unique)" />
                <g stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="32" y1="74" x2="68" y2="26" />
                  <line x1="68" y1="74" x2="52" y2="48" />
                  <line x1="44" y1="38" x2="32" y2="26" />
                  <line x1="26" y1="58" x2="74" y2="58" />
                </g>
              </svg>
            </div>

            {/* Google Chrome Badge */}
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1.5 select-none">
              <img 
                src="https://www.google.com/chrome/static/images/chrome-logo-m100.svg" 
                alt="Chrome" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Mozilla Firefox Badge */}
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1.5 select-none">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg" 
                alt="Firefox" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Subtext availability */}
          <span className="text-[11px] text-neutral-400 font-medium tracking-wide uppercase select-none mb-16">
            Also available in browsers
          </span>

          {/* Dotted separator line */}
          <div className="w-full border-t border-dashed border-white/10 mb-10" />

          {/* Bottom links and details */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Left Column: Vertically stacked site links */}
            <div className="flex flex-col gap-3 text-sm font-normal text-neutral-300">
              <Link to="/" className="hover:text-white transition-colors w-fit">Home</Link>
              <Link to="/map" className="hover:text-white transition-colors w-fit">Map</Link>
              <Link to="/about" className="hover:text-white transition-colors w-fit">About</Link>
              <Link to="/404" className="hover:text-white transition-colors w-fit">404</Link>
            </div>

            {/* Right Column: stay in touch, socials, dev info */}
            <div className="flex flex-col justify-between h-full md:border-l md:border-dashed md:border-white/10 md:pl-12 py-1">
              <div className="flex justify-between items-center w-full">
                <span className="text-sm font-normal text-neutral-300">Stay in touch</span>
                <div className="flex gap-4 items-center">
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <Twitter size={16} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <Linkedin size={16} />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <Instagram size={16} />
                  </a>
                </div>
              </div>
              <div className="mt-6 md:mt-auto">
                <a 
                  href="https://dotrwt.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-white transition-colors text-xs font-normal"
                >
                  developed by dotrwt
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

