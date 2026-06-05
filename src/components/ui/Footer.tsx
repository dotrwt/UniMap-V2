// src/components/ui/Footer.tsx
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';

/** A dark footer component containing site links, developer links, and copyright notices. */
export default function Footer() {
  return (
    <footer className="bg-[#1A3D63] text-[#B3CFE5] w-full flex flex-col">
      {/* Top Section */}
      <div className="px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#4A7FA7]" />
            <span className="text-[17px] font-medium text-[#F6FAFD]">UniMap</span>
          </Link>
          <p className="text-xs">Graph-based campus navigation</p>
          <div className="text-xs">
            Built by{' '}
            <a
              href="https://dotrwt.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4A7FA7] hover:text-[#B3CFE5] inline-flex items-center gap-1 transition-colors"
            >
              dotrwt
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3 md:items-end">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#4A7FA7]">
            Quick links
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:justify-end">
            <Link to="/" className="hover:text-[#F6FAFD] transition-colors">
              Home
            </Link>
            <Link to="/map" className="hover:text-[#F6FAFD] transition-colors">
              Map
            </Link>
            <Link to="/about" className="hover:text-[#F6FAFD] transition-colors">
              About
            </Link>
            <a
              href="https://github.com/dotrwt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F6FAFD] inline-flex items-center gap-1 transition-colors"
            >
              <Github size={12} />
              GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="px-6 py-4 border-t border-[#B3CFE5]/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#4A7FA7]">
        <span>© 2025 UniMap. MIT License.</span>
        <span>Made for campus navigation</span>
      </div>
    </footer>
  );
}
