"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// All scroll and entrance animation for the site, driven by data attributes in the page code:
//   data-hero-item  fades up on load, one after another
//   data-reveal     fades up when scrolled into view
//   data-stagger    its children fade up one after another
//   data-line       a line that draws itself from the left
//   data-wipe       revealed left to right
//   data-count      the first number in its text counts up
//   data-progress   the reading progress bar under the nav
export function PageMotion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      gsap.to("[data-progress]", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });

      // Highlight the nav link of the section on screen.
      gsap.utils.toArray<HTMLElement>("section[id]").forEach((section) => {
        const links = document.querySelectorAll(`a[href="/#${section.id}"]`);
        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => links.forEach((l) => l.toggleAttribute("data-active", self.isActive)),
        });
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const onView = (trigger: Element, start = "top 88%") => ({ trigger, start, once: true });

        gsap.fromTo(
          "[data-hero-item]",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, delay: 0.1, clearProps: "all" },
        );

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, { autoAlpha: 0, y: 32, duration: 0.8, ease: "power3.out", clearProps: "all", scrollTrigger: onView(el) });
        });

        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
          gsap.from(el.children, {
            autoAlpha: 0,
            y: 26,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "all",
            scrollTrigger: onView(el, "top 85%"),
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
          gsap.from(el, { scaleX: 0, duration: 1.2, ease: "power3.inOut", scrollTrigger: onView(el, "top 92%") });
        });

        gsap.utils.toArray<HTMLElement>("[data-wipe]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(0% 100% 0% 0% round 16px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 16px)",
              duration: 1.4,
              ease: "power2.inOut",
              clearProps: "clipPath",
              scrollTrigger: onView(el, "top 92%"),
            },
          );
        });

        const counters = gsap.utils.toArray<HTMLElement>("[data-count]").map((el) => {
          const final = el.textContent ?? "";
          const match = final.match(/\d+(\.\d+)?/);
          if (!match) return { el, final };
          const target = parseFloat(match[0]);
          const decimals = match[1] ? match[1].length - 1 : 0;
          const value = { n: 0 };
          gsap.to(value, {
            n: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: onView(el, "top 90%"),
            onStart: () => el.setAttribute("aria-label", final),
            onUpdate: () => {
              el.textContent = final.replace(match[0], value.n.toFixed(decimals));
            },
            onComplete: () => {
              el.textContent = final;
            },
          });
          return { el, final };
        });

        return () => counters.forEach(({ el, final }) => (el.textContent = final));
      });

      // The hero starts hidden by CSS so it doesn't flash before the animation; GSAP owns it now.
      document.documentElement.classList.remove("motion");
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
