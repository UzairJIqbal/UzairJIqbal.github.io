"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { site } from "@/data/site";

// The intro loader and the curtain between pages.
//  - First visit in a session: the name flips in letter by letter, a counter runs to 100 while
//    fonts and images load, then two panels lift away like a curtain.
//  - Later page loads: just the curtain lift.
//  - Clicking a link to another page drops the curtain first, then navigates.
// The inline script in layout.tsx picks the mode before paint (html.loading or html.curtain),
// so the overlay is already covering the page on the very first frame.
// Nothing here runs for people who prefer reduced motion.

const SEEN = "intro-seen";

declare global {
  interface Window {
    __introDone?: boolean;
  }
}

function finishIntro() {
  document.documentElement.classList.remove("loading", "curtain");
  window.__introDone = true;
  window.dispatchEvent(new Event("intro:done"));
}

const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const html = document.documentElement;
    const mode = html.classList.contains("loading") ? "loading" : html.classList.contains("curtain") ? "curtain" : null;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const q = gsap.utils.selector(el);
    const main = q("[data-panel=main]")[0];
    const accent = q("[data-panel=accent]")[0];
    const chars = q(".preloader-char");
    const count = q("[data-count-out]")[0] as HTMLElement;
    const bar = q("[data-bar]")[0];
    const fade = q("[data-fade]");

    let cancelled = false;
    const ctx = gsap.context(() => {});

    const lift = (tl: gsap.core.Timeline, at: number | string) => {
      tl.to(main, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, at)
        .to(accent, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, "<0.14")
        // Let the hero start rising while the curtain is still moving.
        .call(finishIntro, [], "<0.25")
        .set(el, { display: "none" });
    };

    if (!mode) {
      finishIntro();
    } else if (mode === "curtain") {
      ctx.add(() => {
        const tl = gsap.timeline({ delay: 0.05 });
        lift(tl, 0);
      });
    } else {
      ctx.add(() => {
        const progress = { v: 0 };
        const render = () => {
          const v = Math.round(progress.v);
          count.textContent = String(v).padStart(3, "0");
          gsap.set(bar, { scaleX: progress.v / 100 });
        };

        gsap.set(chars, { rotateX: -100, yPercent: 40, autoAlpha: 0 });
        gsap.set(fade, { autoAlpha: 0, y: 12 });
        const intro = gsap.timeline();
        intro
          .to(chars, { rotateX: 0, yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.045 })
          .to(fade, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.15);

        // Run quickly to ~80 while the page loads, then finish once it really has.
        const crawl = gsap.to(progress, { v: 82, duration: 1.5, ease: "power2.out", onUpdate: render });

        Promise.race([Promise.all([document.fonts.ready, pageLoaded(), wait(1400)]), wait(4500)]).then(() => {
          if (cancelled) return;
          crawl.kill();
          try {
            sessionStorage.setItem(SEEN, "1");
          } catch {}
          ctx.add(() => {
            const out = gsap.timeline();
            out
              .to(progress, { v: 100, duration: 0.55, ease: "power2.inOut", onUpdate: render })
              .to(
                chars,
                { rotateX: 100, yPercent: -40, autoAlpha: 0, duration: 0.6, ease: "power3.in", stagger: 0.03 },
                "+=0.1",
              )
              .to([count, ...fade], { yPercent: -60, autoAlpha: 0, duration: 0.5, ease: "power3.in" }, "<0.1");
            lift(out, "-=0.15");
          });
        });
      });
    }

    // Drop the curtain before leaving for another page of this site.
    const onClick = (e: MouseEvent) => {
      if (reduced || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return; // files such as resume.pdf

      e.preventDefault();
      e.stopPropagation();
      try {
        sessionStorage.setItem(SEEN, "1");
      } catch {}
      gsap.set(el, { display: "block" });
      gsap.set(q(".preloader-intro"), { display: "none" });
      gsap
        .timeline({ onComplete: () => location.assign(url.href) })
        .fromTo(
          accent,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" },
        )
        .fromTo(
          main,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" },
          "<0.12",
        );
    };
    window.addEventListener("click", onClick, true);

    // Coming back with the browser's back button can restore the covered page from cache.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) gsap.set(el, { display: "none" });
    };
    window.addEventListener("pageshow", onShow);

    return () => {
      cancelled = true;
      ctx.revert();
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  const words = site.name.toUpperCase().split(" ");

  return (
    <div ref={root} aria-hidden className="preloader">
      <div data-panel="accent" className="preloader-panel bg-accent" />
      <div data-panel="main" className="preloader-panel preloader-main">
        <div className="preloader-intro absolute inset-0">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
            <p className="preloader-name text-[clamp(2.5rem,9vw,6.5rem)] font-extrabold leading-none tracking-[-0.04em]">
              {words.map((w, wi) => (
                <span key={w} className="inline-block whitespace-nowrap">
                  {[...w].map((c, ci) => (
                    <span key={ci} className="preloader-char">
                      {c}
                    </span>
                  ))}
                  {wi < words.length - 1 && <span className="inline-block w-[0.3em]" />}
                </span>
              ))}
            </p>
            <div data-fade className="mx-auto mt-8 h-[3px] w-48 overflow-hidden rounded-full bg-white/10 sm:w-64">
              <div data-bar className="h-full origin-left scale-x-0 bg-[var(--pl-accent)]" />
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-6 sm:inset-x-8 sm:bottom-6">
            <span data-count-out className="preloader-count font-extrabold tabular-nums">
              000
            </span>
            <div className="pb-2 text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-white/55">
              <p data-fade>{site.role}</p>
              <p data-fade>Portfolio · {new Date().getFullYear()}</p>
              <p data-fade className="text-[var(--pl-accent)]">
                Loading
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
