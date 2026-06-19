// src/hooks/smoothscroll.ts
import { useEffect } from 'react';

/**
 * Custom hook to intercept anchor clicks and scroll smoothly to target elements
 * with a custom offset to prevent the floating capsule navbar from covering headers.
 */
export default function useSmoothScroll(offset = 90, duration = 800) {
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find the closest anchor tag
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#') return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      e.preventDefault();

      // Get target top position relative to document
      const rect = targetElement.getBoundingClientRect();
      const startPosition = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + startPosition - offset;
      const distance = targetPosition - startPosition;
      
      let startTime: number | null = null;

      // Easing function: easeInOutQuad (acceleration until halfway, then deceleration)
      const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          window.scrollTo(0, targetPosition);
        }
      };

      requestAnimationFrame(animation);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [offset, duration]);
}

/**
 * Programmatic utility to smooth scroll to a target element selector with offset.
 */
export function smoothScrollTo(targetSelector: string, offset = 90, duration = 800) {
  const targetElement = document.querySelector(targetSelector);
  if (!targetElement) return;

  const rect = targetElement.getBoundingClientRect();
  const startPosition = window.pageYOffset || document.documentElement.scrollTop;
  const targetPosition = rect.top + startPosition - offset;
  const distance = targetPosition - startPosition;
  
  let startTime: number | null = null;

  const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
    }
  };

  requestAnimationFrame(animation);
}
