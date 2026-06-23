"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Update ScrollTrigger on Lenis scroll events
    lenis.on("scroll", ScrollTrigger.update);

    // Sync GSAP's ticker with Lenis requestAnimationFrame
    const gsapTicker = (time: number) => {
      lenis.raf(time * 1000); // GSAP ticker works in seconds, Lenis raf works in milliseconds
    };
    
    gsap.ticker.add(gsapTicker);
    gsap.ticker.lagSmoothing(0); // Prevents GSAP from skipping frames on CPU lag spikes

    (window as any).lenis = lenis;

    return () => {
      gsap.ticker.remove(gsapTicker);
      lenis.destroy();
    };
  }, []);

  return null;
}
