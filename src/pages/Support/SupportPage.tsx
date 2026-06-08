import { Navbar, Footer } from '@/components/ui';
import SupportForm from './SupportForm';
import './Support.css';

/**
 * SupportPage component.
 * Renders the Support Feedback page containing Navbar, SupportForm,
 * and Footer with a glowing dark background layout matching the design reference.
 */
export default function SupportPage() {
  return (
    <div className="support-bg flex flex-col w-full min-h-screen">
      {/* Capsule top navbar */}
      <Navbar />
      
      {/* Background glow in center top */}
      <div className="support-glow" />

      {/* Main page content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 md:pt-36 max-w-4xl mx-auto w-full">
        {/* Get Help Badge */}
        <div className="bg-white/5 border border-white/10 px-4.5 py-1.5 rounded-full mb-6 shadow-sm select-none">
          <span className="text-[10px] tracking-wide font-medium text-neutral-300">
            Get help
          </span>
        </div>

        {/* Support Header */}
        <h1 className="text-[36px] sm:text-[44px] md:text-[48px] font-bold tracking-tight text-white text-center leading-[1.1] mb-12 max-w-2xl select-none">
          Get support <br />
          or Share Your Feedback
        </h1>

        {/* Support Request Form */}
        <SupportForm />
      </main>

      {/* Standard page Footer */}
      <Footer />
    </div>
  );
}
