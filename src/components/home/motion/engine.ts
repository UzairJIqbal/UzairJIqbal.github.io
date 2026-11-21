// The motion layer: Lenis smooth scrolling on the GSAP ticker, ScrollTrigger
// reveals, scroll-lit text, card tilt, magnetic buttons and a cursor ring.
// Loaded after first paint by motion-layer.tsx, so none of it is on the
// critical path. Everything reads data attributes set in the server HTML:
//   [data-split]    heading whose .hm-wi words rise out of a mask
//   [data-reveal]   fades up; batched so neighbours stagger
//   [data-shot]     screenshot frame; the image settles and drifts on scroll
//   [data-scrub]    paragraph whose .hm-sw words light up with scroll
//   [data-count]    number that counts up once
//   [data-grow]     card that scales into place as it enters
//   [data-tilt]     card that leans toward the pointer (fine pointers only)
//   [data-magnetic] button pulled toward the pointer (fine pointers only)
//   [data-portrait] hero portrait that turns toward the pointer and sinks on scroll
// Elements already on screen when this starts are left alone, so nothing the
// visitor is reading ever blinks out to be animated back in.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const EASE_OUT = "power3.out";
const EASE_TEXT = "power4.out";

export function startMotion(root: HTMLElement): () => void {
  gsap.registerPlugin(ScrollTrigger);
  const html = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const off: (() => void)[] = [];
  const listen = <K extends keyof DocumentEventMap>(
    target: Document | Window | HTMLElement,
    type: K | string,
    fn: (e: never) => void,
    opts?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn as EventListener, opts);
    off.push(() => target.removeEventListener(type, fn as EventListener, opts));
  };

  // smooth scroll: desktop pointers only. Phones keep native momentum.
  let lenis: Lenis | null = null;
  if (!reduced && fine) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    const l = lenis;
    l.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    off.push(() => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      l.destroy();
    });
  }

  // in-page links glide to their section and keep the URL in step
  listen(
    document,
    "click",
    (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      const here = location.pathname.replace(/\/$/, "") === url.pathname.replace(/\/$/, "");
      const el = url.hash.length > 1 ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      if (!here || !el) return;
      e.preventDefault();
      e.stopPropagation();
      const offset = -(parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
      if (lenis) lenis.scrollTo(el, { offset, duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      history.pushState(null, "", url.hash);
      if (!el.hasAttribute("tabindex") && !el.matches("a,button,input,textarea,select")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    },
    { capture: true },
  );

  // nav: mark the section in view
  const navLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>(".hm-nav nav a"));
  const sectionTriggers = navLinks
    .map((a) => {
      const id = a.getAttribute("href")?.split("#")[1];
      const sec = id ? document.getElementById(id) : null;
      if (!sec) return null;
      return ScrollTrigger.create({
        trigger: sec,
        start: "top 35%",
        end: "bottom 35%",
        onToggle: (self) => a.classList.toggle("is-active", self.isActive),
      });
    })
    .filter(Boolean) as ScrollTrigger[];
  off.push(() => {
    sectionTriggers.forEach((t) => t.kill());
    navLinks.forEach((a) => a.classList.remove("is-active"));
  });

  if (reduced) {
    return () => off.forEach((fn) => fn());
  }

  html.classList.add("hm-fx");
  if (fine) html.classList.add("hm-fine");
  off.push(() => html.classList.remove("hm-fx", "hm-fine"));

  const vh = window.innerHeight;
  const below = (el: Element) => el.getBoundingClientRect().top > vh * 0.94;
  const all = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root);

  const ctx = gsap.context(() => {
    // headings: words rise out of their masks
    all("[data-split]")
      .filter(below)
      .forEach((el) => {
        const words = el.querySelectorAll(".hm-wi");
        gsap.set(words, { yPercent: 118 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.05, ease: EASE_TEXT, stagger: 0.06 }),
        });
      });

    // section rules draw across
    all(".hm-rule")
      .filter(below)
      .forEach((el) => {
        gsap.set(el, { scaleX: 0, transformOrigin: "0% 50%" });
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => gsap.to(el, { scaleX: 1, duration: 1.3, ease: "expo.out" }),
        });
      });

    // blocks fade up, neighbours staggered
    const items = all("[data-reveal]").filter(below);
    gsap.set(items, { y: 44, opacity: 0 });
    ScrollTrigger.batch(items, {
      start: "top 92%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: EASE_OUT,
          stagger: 0.09,
          overwrite: "auto",
          onComplete() {
            // hand the transform back to CSS unless the card is driven by tilt
            this.targets().forEach((t: HTMLElement) => {
              if (!t.hasAttribute("data-tilt") || !fine) gsap.set(t, { clearProps: "transform,opacity" });
            });
          },
        }),
    });

    // screenshots settle into frame, then drift a touch with scroll
    all("[data-shot]").forEach((frame) => {
      const img = frame.querySelector("img");
      if (!img) return;
      gsap.set(img, { scale: 1.08, transformOrigin: "50% 0%" });
      if (below(frame)) {
        gsap.from(img, {
          scale: 1.3,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: { trigger: frame, start: "top 92%", once: true },
        });
      }
      gsap.fromTo(
        img,
        { yPercent: 0 },
        {
          yPercent: -5,
          ease: "none",
          scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 1 },
        },
      );
    });

    // scroll-lit paragraphs
    all("[data-scrub]")
      .filter(below)
      .forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".hm-sw"),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 62%", scrub: 1 },
          },
        );
      });

    // numbers count up once
    all("[data-count]")
      .filter(below)
      .forEach((el) => {
        const target = parseInt(el.textContent || "", 10);
        if (!Number.isFinite(target)) return;
        const n = { v: 0 };
        el.textContent = "0";
        gsap.to(n, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => (el.textContent = String(Math.round(n.v))),
        });
      });

    // cards that scale into place
    all("[data-grow]")
      .filter(below)
      .forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.9, borderRadius: 40 },
          {
            scale: 1,
            borderRadius: 20,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 55%", scrub: 1 },
          },
        );
      });

    // hero: copy lifts away and the portrait sinks slower, for depth
    const hero = root.querySelector(".hm-hero");
    if (hero) {
      const copy = hero.querySelector(".hm-hero-copy");
      const portrait = hero.querySelector("[data-portrait]");
      const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      if (copy && fine) gsap.to(copy, { y: -90, opacity: 0.15, ease: "none", scrollTrigger: st });
      if (portrait) gsap.to(portrait, { y: fine ? 120 : 60, scale: 0.94, ease: "none", scrollTrigger: { ...st } });
    }

    // case study flow arrows draw in order
    all(".hm-flow")
      .filter(below)
      .forEach((list) => {
        const steps = list.querySelectorAll("li");
        gsap.set(steps, { opacity: 0, y: 24 });
        ScrollTrigger.create({
          trigger: list,
          start: "top 88%",
          once: true,
          onEnter: () => gsap.to(steps, { opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT, stagger: 0.12 }),
        });
      });
  }, root);
  off.push(() => ctx.revert());

  if (fine) {
    // cards lean toward the pointer; a soft light follows it
    all("[data-tilt]").forEach((card) => {
      const max = card.classList.contains("hm-tile--feature") ? 2 : 3.5;
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: EASE_OUT });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: EASE_OUT });
      const lift = gsap.quickTo(card, "y", { duration: 0.5, ease: EASE_OUT });
      gsap.set(card, { transformPerspective: 1100 });
      listen(card, "pointerenter", () => {
        card.classList.add("is-lit");
        lift(-4);
      });
      listen(card, "pointermove", (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 2 * max);
        rx(-(py - 0.5) * 2 * max);
        card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      });
      listen(card, "pointerleave", () => {
        card.classList.remove("is-lit");
        rx(0);
        ry(0);
        lift(0);
      });
    });

    // hero portrait turns to follow the pointer anywhere in the hero; its
    // layers sit at different depths, so they slide past each other
    const portrait = root.querySelector<HTMLElement>("[data-portrait]");
    const heroEl = portrait?.closest<HTMLElement>(".hm-hero");
    const tilt = portrait?.querySelector(".hm-pt-tilt");
    const card = portrait?.querySelector<HTMLElement>(".hm-pt-card");
    if (portrait && heroEl && tilt && card) {
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 1, ease: EASE_OUT });
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 1, ease: EASE_OUT });
      listen(heroEl, "pointermove", (e: PointerEvent) => {
        const r = portrait.getBoundingClientRect();
        const px = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / r.width);
        const py = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / r.height);
        ry(px * 18);
        rx(-py * 12);
        card.style.setProperty("--mx", `${(50 + px * 50).toFixed(1)}%`);
        card.style.setProperty("--my", `${(50 + py * 50).toFixed(1)}%`);
      });
      listen(heroEl, "pointerleave", () => {
        rx(0);
        ry(0);
      });
      off.push(() => gsap.set(tilt, { clearProps: "transform" }));
    }

    // buttons drift toward the pointer, never more than a few pixels
    all("[data-magnetic]").forEach((btn) => {
      const x = gsap.quickTo(btn, "x", { duration: 0.5, ease: EASE_OUT });
      const y = gsap.quickTo(btn, "y", { duration: 0.5, ease: EASE_OUT });
      listen(btn, "pointermove", (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        x(gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.28));
        y(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.36));
      });
      listen(btn, "pointerleave", () => {
        x(0);
        y(0);
      });
    });
    off.push(() => gsap.set(all("[data-tilt], [data-magnetic]"), { clearProps: "transform" }));

    // cursor ring: trails the pointer and opens up over things you can click
    const ring = document.createElement("div");
    ring.className = "hm-cursor";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);
    gsap.set(ring, { xPercent: -50, yPercent: -50, opacity: 0 });
    const cx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const cy = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
    let shown = false;
    listen(window, "pointermove", (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set(ring, { x: e.clientX, y: e.clientY });
        gsap.to(ring, { opacity: 1, duration: 0.3 });
      }
      cx(e.clientX);
      cy(e.clientY);
    });
    listen(document, "pointerover", (e: PointerEvent) => {
      const t = e.target as Element | null;
      ring.classList.toggle("is-link", !!t?.closest?.("a, button"));
      ring.classList.toggle("is-card", !t?.closest?.("a, button") && !!t?.closest?.("[data-tilt]"));
    });
    listen(document, "pointerleave", () => {
      shown = false;
      gsap.to(ring, { opacity: 0, duration: 0.2 });
    });
    listen(window, "pointerdown", () => ring.classList.add("is-down"));
    listen(window, "pointerup", () => ring.classList.remove("is-down"));
    off.push(() => ring.remove());
  }

  // late layout changes (fonts, lazy images) move trigger points
  let refreshTimer = 0;
  const refresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  document.fonts?.ready.then(refresh);
  root.querySelectorAll("img").forEach((img) => {
    if (!img.complete) listen(img, "load", refresh, { once: true });
  });
  off.push(() => window.clearTimeout(refreshTimer));

  return () => off.reverse().forEach((fn) => fn());
}
