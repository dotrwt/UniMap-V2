// src/components/ui/Navbar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

/** A sticky top navigation bar component providing page links and theme settings. */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => location.pathname === path;

  // On the landing page, render the custom floating glass-capsule navbar
  if (location.pathname === '/') {
    return (
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
    );
  }

  // Standard sticky navbar for other pages
  return (
    <nav className="sticky top-0 z-50 h-[56px] w-full bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--border)] px-4 md:px-6 flex flex-col justify-center">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-[17px] font-medium text-[var(--text-primary)]">UniMap</span>
        </Link>

        {/* Center: Nav links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm transition-colors ${
              isActive('/')
                ? 'text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/map"
            className={`text-sm transition-colors ${
              isActive('/map')
                ? 'text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
            }`}
          >
            Map
          </Link>
          <Link
            to="/about"
            className={`text-sm transition-colors ${
              isActive('/about')
                ? 'text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
            }`}
          >
            About
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/map"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Open Map
          </Link>
          <button
            onClick={toggleMenu}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent-light)] transition-colors"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-[55px] left-0 w-full bg-[var(--bg-card)] border-b border-[var(--border)] flex flex-col p-4 gap-4 md:hidden">
          <Link
            to="/"
            onClick={toggleMenu}
            className={`text-sm py-1 transition-colors ${
              isActive('/') ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/map"
            onClick={toggleMenu}
            className={`text-sm py-1 transition-colors ${
              isActive('/map') ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'
            }`}
          >
            Map
          </Link>
          <Link
            to="/about"
            onClick={toggleMenu}
            className={`text-sm py-1 transition-colors ${
              isActive('/about') ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'
            }`}
          >
            About
          </Link>
          <Link
            to="/map"
            onClick={toggleMenu}
            className="flex items-center justify-center w-full py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Open Map
          </Link>
        </div>
      )}
    </nav>
  );
}
