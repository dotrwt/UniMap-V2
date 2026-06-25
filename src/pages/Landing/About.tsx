// src/pages/Landing/About.tsx
import { Info, Compass, HelpCircle, Users, RefreshCw } from 'lucide-react';

export default function About() {
  return (
    <section className="w-full py-24 px-4 md:px-8 relative overflow-hidden bg-[#fcfaf6] dark:bg-[#050505] border-t border-neutral-200/20">
      {/* Decorative background glows */}
      <div className="radial-glow top-10 left-1/4" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 bg-[#ff602e]/10 border border-[#ff602e]/20 px-3 py-1 rounded-full mb-6">
          <Info size={12} className="text-[#ff602e]" />
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#ff602e]">Our Mission</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 text-center">
          About UniMap Project
        </h2>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl text-center leading-relaxed mb-16">
          We believe campus navigation should be effortless. UniMap brings precision indoor mapping to academic spaces, making complex layouts simple to explore.
        </p>

        {/* Human-focused Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          {/* Card 1: Why UniMap Exists */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <Compass size={18} className="text-[#ff602e]" />
              Why UniMap Exists
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Universities are complex ecosystems of halls, labs, and classrooms. UniMap was created to bring clarity to campus layouts, helping you navigate large academic spaces with confidence and ease.
            </p>
          </div>

          {/* Card 2: The Problem We Solve */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <HelpCircle size={18} className="text-cyan-500" />
              The Problem We Solve
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Standard maps stop at the entrance. Finding a specific classroom, lab, or seminar hall inside a building is often frustrating. UniMap maps every indoor path to get you exactly where you need to be.
            </p>
          </div>

          {/* Card 3: Built for Everyone */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <Users size={18} className="text-[#ff602e]" />
              Students, Visitors & Faculty
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Whether you're a student rushing to your next lecture, a visitor attending a seminar, or a faculty member locating a department office, UniMap makes campus navigation seamless for everyone.
            </p>
          </div>

          {/* Card 4: Always Improving */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <RefreshCw size={18} className="text-cyan-500" />
              Continuously Improving
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              As campuses grow, so do we. UniMap is built as an open, community-driven map that continuously refines route accuracy, updates layout plans, and expands coverage to map every corner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
