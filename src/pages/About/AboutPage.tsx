// src/pages/AboutPage.tsx
import { Compass, Info, Github } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

/** AboutPage component explaining the purpose, stack, and features of UniMap. */
export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col items-center w-full px-4 md:px-6 py-12 md:py-20 max-w-4xl mx-auto">
      <Badge variant="accent" className="mb-6">
        <Info size={12} />
        Project Details
      </Badge>

      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] text-center mb-6">
        About UniMap
      </h1>

      <p className="text-base text-[var(--text-secondary)] text-center max-w-2xl mb-12 leading-relaxed">
        UniMap is a graph-based indoor campus navigation web application designed for students and teachers to easily find the shortest and most accessible routes across university buildings.
      </p>

      <div className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 mb-12 shadow-sm text-left">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Compass size={20} className="text-[var(--accent)]" />
          Technical Stack
        </h3>
        <ul className="space-y-3 text-sm text-[var(--text-muted)]">
          <li>
            <strong>Frontend Scaffold:</strong> React 18 with Vite and TypeScript.
          </li>
          <li>
            <strong>State Management:</strong> Zustand 4 global state store.
          </li>
          <li>
            <strong>Styling:</strong> Tailwind CSS v3 with CSS custom properties for dark mode toggle support.
          </li>
          <li>
            <strong>Pathfinding Logic:</strong> Dijkstra's shortest path algorithm running entirely inside the client browser.
          </li>
          <li>
            <strong>Data Layer:</strong> MongoDB Atlas backend serverless API endpoints.
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <a href="https://github.com/dotrwt" target="_blank" rel="noopener noreferrer">
          <Button variant="primary" className="flex items-center gap-2">
            <Github size={16} />
            GitHub Repository
          </Button>
        </a>
      </div>
    </div>
  );
}
