"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// All scroll and entrance animation for the site, driven by data attributes in the page code:
//   data-hero-title  the big name: letters flip up in 3D once the intro loader lifts
//   data-hero-item   fades up after the title, one after another
//   data-reveal      fades up when scrolled into view
//   data-stagger     its children fade up one after another
//   data-split       its text rises line by line, out of a mask
//   data-chars       its letters rise one by one
//   data-card3d      swings up out of 3D space as it scrolls in (scrubbed)
//   data-parallax    drifts against the scroll (value = strength, e.g. "0.15")
//   data-zoom        opens from a smaller, rounded frame as it scrolls in (scrubbed)
//   data-marquee     the endless type band; scroll speed pushes it, skews it and flips it
//   data-line        a line that draws itself from the left
//   data-wipe        revealed left to right
//   data-count       the first number in its text counts up
//   data-progress    the reading progress bar under the nav
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
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 640px)" }, (context) => {
        const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const onView = (trigger: Element, start = "top 88%") => ({ trigger, start, once: true });

        // ---- Hero: built now (so it stays hidden), played when the intro curtain lifts.
        const hero = gsap.timeline({ paused: true });
        const title = document.querySelector<HTMLElement>("[data-hero-title]");
        if (title) {
          const split = SplitText.create(title, { type: "words,chars", mask: "words" });
          hero.fromTo(
            split.chars,
            { yPercent: 115, rotateX: -85, autoAlpha: 1, transformPerspective: 600, transformOrigin: "50% 100%" },
            { yPercent: 0, rotateX: 0, duration: 1.15, ease: "expo.out", stagger: 0.035 },
          );
          hero.set(title, { visibility: "visible" }, 0);
        }
        hero.fromTo(
          "[data-hero-item]",
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.09,
            clearProps: "all",
            immediateRender: true,
          },
          title ? 0.35 : 0.1,
        );
        const playHero = () => hero.play();
        if (window.__introDone) playHero();
        else window.addEventListener("intro:done", playHero, { once: true });

        // ---- Text
        gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1,
                ease: "expo.out",
                stagger: 0.09,
                scrollTrigger: onView(el, "top 90%"),
              }),
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-chars]").forEach((el) => {
          const split = SplitText.create(el, { type: "chars", mask: "chars" });
          gsap.from(split.chars, {
            yPercent: 110,
            duration: 0.7,
            ease: "power4.out",
            stagger: 0.025,
            scrollTrigger: onView(el, "top 92%"),
          });
        });

        // ---- Reveals
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 32,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: onView(el),
          });
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

        // ---- 3D and scrubbed scenes
        gsap.utils.toArray<HTMLElement>("[data-card3d]").forEach((el, i) => {
          const side = desktop ? (i % 2 ? 1 : -1) : 0;
          gsap.fromTo(
            el,
            {
              transformPerspective: 1100,
              rotateX: 38,
              rotateY: side * 14,
              y: desktop ? 160 : 90,
              z: -220,
              autoAlpha: 0,
              transformOrigin: "50% 100%",
            },
            {
              rotateX: 0,
              rotateY: 0,
              y: 0,
              z: 0,
              autoAlpha: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top bottom-=40", end: "top 62%", scrub: 0.8 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const k = parseFloat(el.dataset.parallax || "") || 0.15;
          gsap.fromTo(
            el,
            { yPercent: -k * 100 },
            {
              yPercent: k * 100,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-zoom]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(10% 9% 10% 9% round 40px)", scale: 0.94 },
            {
              clipPath: "inset(0% 0% 0% 0% round 16px)",
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "top 45%", scrub: 0.6 },
            },
          );
        });

        // ---- Marquee: a steady drift that scrolling speeds up, skews and turns around.
        const bands = gsap.utils.toArray<HTMLElement>("[data-marquee]").map((el) => {
          const track = el.querySelector<HTMLElement>(".marquee-track")!;
          const reverse = el.dataset.marquee === "reverse";
          const loop = gsap.fromTo(
            track,
            { xPercent: reverse ? -50 : 0 },
            { xPercent: reverse ? 0 : -50, duration: 40, ease: "none", repeat: -1 },
          );
          // Start deep into the loop so it can also run backwards.
          loop.totalTime(loop.duration() * 100);
          return { loop, track, sign: reverse ? -1 : 1 };
        });
        if (bands.length) {
          const drive = { speed: 1 };
          let heading = 1;
          const apply = () =>
            bands.forEach((b) => {
              b.loop.timeScale(drive.speed * heading);
              gsap.set(b.track, { skewX: -(drive.speed - 1) * 1.6 * heading * b.sign });
            });
          ScrollTrigger.create({
            trigger: bands[0].track.parentElement,
            start: "top bottom",
            end: "bottom top",
            endTrigger: bands[bands.length - 1].track.parentElement,
            onUpdate: (self) => {
              heading = self.direction;
              const target = 1 + Math.min(Math.abs(self.getVelocity()) / 260, 5);
              if (target > drive.speed) drive.speed = target;
              gsap.to(drive, { speed: 1, duration: 1.2, ease: "power3.out", overwrite: true, onUpdate: apply });
              apply();
            },
          });
        }

        // ---- Lines, wipes, numbers
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

        return () => {
          window.removeEventListener("intro:done", playHero);
          counters.forEach(({ el, final }) => (el.textContent = final));
        };
      });

      // The hero starts hidden by CSS so it doesn't flash before the animation; GSAP owns it now.
      document.documentElement.classList.remove("motion");
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
