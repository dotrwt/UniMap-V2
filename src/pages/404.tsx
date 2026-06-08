// src/pages/404.jsx
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '@/components/ui';
import './Landing/landing.css';

/**
 * NotFoundPage (404) Component.
 * Displays a clean 404 message using the signature blueprint grid background,
 * custom navbar, and footer.
 */
export default function NotFoundPage() {
  return (
    <div className="w-full flex flex-col min-h-screen blueprint-grid text-[var(--text-primary)]">
      {/* Floating global navbar */}
      <Navbar />

      {/* Center 404 messaging */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-32 text-center select-none">
        <h1 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
          404 - Page not found
        </h1>
        
        <Link to="/" className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
          <button className="bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-xs px-6 py-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer">
            Back to homepage
          </button>
        </Link>
      </main>

      {/* Starry footer */}
      <Footer />
    </div>
  );
}
