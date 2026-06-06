// src/pages/Landing/About.tsx
import { Info, Github, Cpu, Database, LayoutTemplate, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <section className="w-full py-24 px-4 md:px-8 relative overflow-hidden bg-[#fcfaf6] dark:bg-[#050505] border-t border-neutral-200/20">
      {/* Decorative background glows */}
      <div className="radial-glow top-10 left-1/4" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 bg-[#ff602e]/10 border border-[#ff602e]/20 px-3 py-1 rounded-full mb-6">
          <Info size={12} className="text-[#ff602e]" />
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#ff602e]">Project Specs</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 text-center">
          About UniMap Project
        </h2>
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl text-center leading-relaxed mb-16">
          UniMap is an open-source high-precision indoor mapping project. It bridges the gap between campus architecture maps and client pathfinding calculations.
        </p>

        {/* Tech Stack Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          {/* Card 1: Frontend */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <LayoutTemplate size={18} className="text-[#ff602e]" />
              Modular Frontend Stack
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              React 18 structured with TypeScript compilation safety, customized Tailwind CSS variables supporting dark mode toggles, and Lucide vector icons.
            </p>
          </div>

          {/* Card 2: Pathfinding */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <Cpu size={18} className="text-cyan-500" />
              Client Pathfinding Engine
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Zustand 4 manages client navigation coordinates and route states. Algorithms run client-side to minimize network delays and compute instant routes.
            </p>
          </div>

          {/* Card 3: Backend */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <Database size={18} className="text-[#ff602e]" />
              MongoDB Database Layer
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Vercel Serverless Functions connect to MongoDB Atlas cluster datasets to load verified campus buildings, floors, nodes, and walkable edges.
            </p>
          </div>

          {/* Card 4: Assets */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200/50 dark:border-white/5 rounded-[24px] p-6 text-left shadow-sm">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2.5">
              <Sparkles size={18} className="text-cyan-500" />
              Cloudinary SVG Maps
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Campus floor layout plans are stored as vector SVGs. Tapping pins and paths scale perfectly across all screens, from mobile to desktop.
            </p>
          </div>
        </div>

        {/* GitHub CTA Button */}
        <a href="https://github.com/dotrwt" target="_blank" rel="noopener noreferrer" className="inline-block">
          <button className="flex items-center gap-2 bg-[#ff602e] hover:bg-[#ff7b52] text-white font-bold text-xs px-6 py-3.5 rounded-full transition-all duration-200 active:scale-95 shadow-md hover:shadow-[#ff602e]/20">
            <Github size={16} />
            GitHub Repository
          </button>
        </a>
      </div>
    </section>
  );
}
