"use client";

import { useEffect } from 'react';

const ScrollToTop = () => {
  useEffect(() => {
    // Scroll to top when component mounts (useful for mobile navigation)
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default ScrollToTop;
