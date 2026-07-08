"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollAnimations = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1 }
    );

    const initAnimations = () => {
      const elements = document.querySelectorAll(".animate-on-scroll");
      elements.forEach((el) => observer.observe(el));
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initAnimations, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
};

export default ScrollAnimations;