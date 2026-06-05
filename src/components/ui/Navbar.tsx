// src/components/ui/Navbar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

/** A sticky top navigation bar component providing page links and theme settings. */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => location.pathname === path;

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
