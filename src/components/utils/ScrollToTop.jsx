"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Ensure scroll is at top on initial page load
    window.scrollTo(0, 0);
  }, []);

  return null;
};

export default ScrollToTop;
