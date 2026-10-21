"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Weighted, inertial scrolling (Lenis) driven by GSAP's clock, so ScrollTrigger
// animations stay in step with it. Off for reduced motion: the browser scrolls as normal.
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: -72 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Hold the page still while the intro loader is up.
    const start = () => lenis.start();
    if (!window.__introDone) {
      lenis.stop();
      window.addEventListener("intro:done", start, { once: true });
    }

    // Nav links are written as "/#section" so they work from every page; on the home page, glide there.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="/#"]') as HTMLAnchorElement | null;
      if (!a || location.pathname !== "/" || e.metaKey || e.ctrlKey) return;
      const target = document.getElementById(a.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      history.replaceState(null, "", a.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("intro:done", start);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
