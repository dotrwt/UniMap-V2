// src/hooks/usePageMeta.ts
import { useEffect } from 'react';

/**
 * Reusable hook that updates document title and meta description per page dynamically.
 */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} — UniMap`;

    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription ? metaDescription.getAttribute('content') : null;

    if (description && metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    return () => {
      // Clean up on unmount: restore to default title
      document.title = previousTitle;
      
      if (description && metaDescription && previousDescription !== null) {
        metaDescription.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
