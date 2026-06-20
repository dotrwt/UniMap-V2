import React, { useState } from 'react';

/**
 * SupportForm component.
 * Renders Name, Email, and Use Case description inputs styled
 * as a premium dark-themed card container matching the design layout.
 */
export default function SupportForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [useCase, setUseCase] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !useCase) {
      alert('Please fill in all fields.');
      return;
    }

    // Simulate submission success
    setIsSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setUseCase('');
      setIsSubmitted(false);
      alert('Thank you! Your feedback has been received.');
    }, 800);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[640px] bg-[#121212]/90 backdrop-blur-xl border border-white/[0.06] rounded-[28px] p-6 md:p-8 flex flex-col gap-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name input */}
        <div className="flex flex-col text-left">
          <label htmlFor="name" className="text-xs font-semibold text-neutral-400 mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Rahul"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1b1b1b] border border-white/[0.04] rounded-[14px] px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ff602e]/30 focus:ring-1 focus:ring-[#ff602e]/30 transition-all duration-200"
            required
          />
        </div>

        {/* Email input */}
        <div className="flex flex-col text-left">
          <label htmlFor="email" className="text-xs font-semibold text-neutral-400 mb-2">
            Email
          </label>
          <input
            id="email"
            type="text"
            placeholder="rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1b1b1b] border border-white/[0.04] rounded-[14px] px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ff602e]/30 focus:ring-1 focus:ring-[#ff602e]/30 transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* Use case textarea */}
      <div className="flex flex-col text-left">
        <label htmlFor="useCase" className="text-xs font-semibold text-neutral-400 mb-2">
          Describe your use case
        </label>
        <textarea
          id="useCase"
          placeholder="Use case"
          rows={5}
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          className="w-full bg-[#1b1b1b] border border-white/[0.04] rounded-[14px] px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ff602e]/30 focus:ring-1 focus:ring-[#ff602e]/30 transition-all duration-200 resize-none min-h-[130px]"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitted}
        className="w-full bg-white hover:bg-neutral-100 disabled:bg-neutral-400 active:scale-[0.99] text-black font-semibold text-[13px] py-4 rounded-[14px] transition-all duration-200 cursor-pointer shadow-md mt-2"
      >
        {isSubmitted ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
