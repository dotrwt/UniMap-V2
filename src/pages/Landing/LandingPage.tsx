// src/pages/LandingPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Compass, Shield } from 'lucide-react';
import { Button, Badge, Chip } from '@/components/ui';

/** The landing home page component for UniMap presenting features and call-to-actions. */
export default function LandingPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="flex-1 flex flex-col items-center w-full px-4 md:px-6 py-12 md:py-24 max-w-6xl mx-auto">
      {/* Hero Badge */}
      <Badge variant="accent" className="mb-6">
        <Navigation size={12} className="animate-pulse" />
        UniMap V2 Navigation Live
      </Badge>

      {/* Hero Title */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] text-center max-w-3xl mb-6">
        Indoor Campus Navigation <br />
        <span className="text-[var(--accent)]">Simplified & Precise</span>
      </h1>

      {/* Hero Subtitle */}
      <p className="text-lg text-[var(--text-secondary)] text-center max-w-2xl mb-10 leading-relaxed">
        Find the shortest routes between buildings, floors, and rooms in real-time. Built specifically for students, staff, and visitors.
      </p>

      {/* Hero Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        <Link to="/map">
          <Button variant="primary" size="lg">
            Start Navigating
          </Button>
        </Link>
        <Link to="/about">
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </Link>
      </div>

      {/* Interactive Filter Demo (Showcasing Chips) */}
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-20 shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 text-center">
          Explore Campus Destinations
        </h3>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Chip
            label="All Locations"
            active={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
          />
          <Chip
            label="Lecture Halls"
            active={selectedFilter === 'halls'}
            onClick={() => setSelectedFilter('halls')}
          />
          <Chip
            label="Laboratories"
            active={selectedFilter === 'labs'}
            onClick={() => setSelectedFilter('labs')}
          />
          <Chip
            label="Amenities"
            active={selectedFilter === 'amenities'}
            onClick={() => setSelectedFilter('amenities')}
          />
        </div>

        <div className="text-xs text-center text-[var(--text-muted)]">
          {selectedFilter === 'all' && 'Showing all rooms and connection nodes across floors.'}
          {selectedFilter === 'halls' && 'Filtered by lecture halls with accessible path highlights.'}
          {selectedFilter === 'labs' && 'Filtered by laboratory sections and research facilities.'}
          {selectedFilter === 'amenities' && 'Filtered by cafes, restrooms, exits, and elevators.'}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* Feature 1 */}
        <div className="flex flex-col p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] transition-all hover:-translate-y-1 hover:shadow-md duration-200">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4">
            <Compass size={20} />
          </div>
          <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Multi-floor Routing
          </h4>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Transition seamlessly between floors using staircases and lifts with exact floor change guidance.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] transition-all hover:-translate-y-1 hover:shadow-md duration-200">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4">
            <MapPin size={20} />
          </div>
          <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Cloudinary-backed Maps
          </h4>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            High-fidelity SVG vector maps load dynamically to display paths, markers, and boundaries clearly.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] transition-all hover:-translate-y-1 hover:shadow-md duration-200">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4">
            <Shield size={20} />
          </div>
          <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Accessible Routes First
          </h4>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Toggle preference options to automatically exclude staircases and direct routes via elevator paths.
          </p>
        </div>
      </div>
    </div>
  );
}
