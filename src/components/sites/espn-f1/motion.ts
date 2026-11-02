import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(SplitText);

// Smooth wheel scrolling, driven by the GSAP ticker so the camera and the
// scroll value advance on the same frame. Touch keeps native scrolling.
let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (lenis || window.matchMedia("(pointer: coarse)").matches) return lenis;
  const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, autoRaf: false });
  const raf = (time: number) => instance.raf(time * 1000);
  instance.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  lenis = instance;
  const stop = () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    instance.destroy();
    lenis = null;
  };
  return Object.assign(instance, { stop });
}

export const smoothScrollActive = () => lenis !== null;

export function scrollToY(top: number, smooth: boolean) {
  if (lenis) lenis.scrollTo(top, { immediate: !smooth, duration: smooth ? 1.4 : undefined });
  else window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
}

// Elements that ease in the first time the camera brings them on screen.
// The world is moved with transforms, which IntersectionObserver accounts for.
const REVEAL = [
  ".f1-intro-hr",
  ".f1-tall-title",
  ".f1-display:not(.f1-h1)",
  ".f1-inline-chart li",
  ".f1-card-image",
  ".f1-card-bottom",
  ".f1-dcard-media",
  ".f1-dcard-content",
  ".f1-skill-figure",
  ".f1-recirc-title",
  ".f1-recirc-links",
].join(",");

// Paragraphs rise line by line out of a mask instead of fading as a block.
const LINES = [".f1-intro-copy", ".f1-tall-copy:not(.f1-stat)", ".f1-card-copy > p", ".f1-dcard-copy"].join(",");

// Proof figures count up to their value ("89.7%", "200+", "70 / 72").
const COUNT = ".f1-compare-number, .f1-stat .f1-display";

function countUp(el: HTMLElement) {
  const text = el.textContent ?? "";
  const parts = text.split(/(\d+(?:\.\d+)?)/);
  if (parts.length < 2) return;
  const o = { p: 0 };
  gsap.to(o, {
    p: 1,
    duration: 1.4,
    ease: "expo.out",
    onUpdate: () => {
      el.textContent = parts
        .map((part, i) => {
          if (i % 2 === 0) return part;
          const dp = part.split(".")[1]?.length ?? 0;
          return (Number(part) * o.p).toFixed(dp);
        })
        .join("");
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
}

export function startReveals(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>(REVEAL));
  const paras = Array.from(root.querySelectorAll<HTMLElement>(LINES));
  els.forEach((el) => el.classList.add("f1-rv"));
  const shown = new WeakSet<Element>();

  // autoSplit re-splits when fonts load or the width changes; lines already
  // revealed stay put, the rest are parked below their masks.
  const splits = paras.map((el) =>
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "f1-line",
      autoSplit: true,
      onSplit: (self) => {
        if (!shown.has(el)) gsap.set(self.lines, { yPercent: 105 });
      },
    }),
  );

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        shown.add(el);
        if (paras.includes(el)) {
          gsap.to(el.querySelectorAll(".f1-line"), { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" });
          continue;
        }
        el.classList.add("is-in");
        if (el.matches(COUNT)) countUp(el);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
  paras.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    splits.forEach((s) => s.revert());
    els.forEach((el) => el.classList.remove("f1-rv", "is-in"));
  };
}

// Screenshots lean into the camera's motion: a slight skew in the direction
// of travel that settles when the camera stops.
export function startDrag(world: HTMLElement) {
  const imgs = Array.from(world.querySelectorAll<HTMLElement>(".f1-card-image img, .f1-dcard-media img"));
  let lx = NaN;
  let ly = NaN;
  let vx = 0;
  let vy = 0;
  let resting = true;
  const tick = () => {
    const m = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(world.style.transform);
    if (!m) return;
    const x = Number(m[1]);
    const y = Number(m[2]);
    const dx = Number.isNaN(lx) ? 0 : x - lx;
    const dy = Number.isNaN(ly) ? 0 : y - ly;
    lx = x;
    ly = y;
    vx += (gsap.utils.clamp(-60, 60, dx) - vx) * 0.12;
    vy += (gsap.utils.clamp(-60, 60, dy) - vy) * 0.12;
    if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
      if (!resting) imgs.forEach((img) => (img.style.transform = ""));
      resting = true;
      return;
    }
    resting = false;
    const t = `skew(${(vx * 0.09).toFixed(2)}deg, ${(vy * -0.05).toFixed(2)}deg)`;
    imgs.forEach((img) => (img.style.transform = t));
  };
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    imgs.forEach((img) => (img.style.transform = ""));
  };
}

// Hero: the name rises out of a mask, then the portrait tilts in 3D toward
// the pointer with a light sheen following it.
export function startHero(hero: HTMLElement) {
  const media = hero.querySelector<HTMLElement>(".f1-hero-media");
  const portrait = hero.querySelector<HTMLElement>(".f1-hero-portrait");
  const lines = hero.querySelectorAll<HTMLElement>(".f1-overline, .f1-h1, .f1-hero-accents");
  const tl = gsap.timeline();
  tl.fromTo(lines, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: "expo.out" });
  if (portrait) {
    tl.fromTo(
      portrait,
      { rotationY: -38, rotationX: 12, scale: 0.86, opacity: 0 },
      { rotationY: 0, rotationX: 0, scale: 1, opacity: 1, duration: 1.4, ease: "expo.out" },
      0.1,
    );
  }
  if (!media || !portrait || window.matchMedia("(hover: none)").matches) return () => tl.kill();

  gsap.set(media, { "--mx": 50, "--my": 50 });
  const rx = gsap.quickTo(portrait, "rotationX", { duration: 0.9, ease: "power3.out" });
  const ry = gsap.quickTo(portrait, "rotationY", { duration: 0.9, ease: "power3.out" });
  const mx = gsap.quickTo(media, "--mx", { duration: 0.9, ease: "power3.out" });
  const my = gsap.quickTo(media, "--my", { duration: 0.9, ease: "power3.out" });
  const onMove = (e: PointerEvent) => {
    if (tl.isActive()) return;
    const r = media.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const dx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
    const dy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
    ry(dx * 18);
    rx(-dy * 14);
    mx(50 + dx * 35);
    my(50 + dy * 35);
  };
  const onLeave = () => {
    rx(0);
    ry(0);
    mx(50);
    my(50);
  };
  window.addEventListener("pointermove", onMove);
  document.addEventListener("pointerleave", onLeave);
  return () => {
    tl.kill();
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
  };
}

// Freeze scrolling while an overlay is open; returns the undo.
export function lockScroll() {
  lenis?.stop();
  const html = document.documentElement;
  const prev = html.style.overflow;
  html.style.overflow = "hidden";
  return () => {
    html.style.overflow = prev;
    lenis?.start();
  };
}

// A two-part cursor for fine pointers: a dot that tracks exactly and a ring
// that trails it, swelling over links and labelling project screenshots.
export function startCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "f1-cursor-dot";
  ring.className = "f1-cursor-ring";
  ring.innerHTML = "<span></span>";
  const label = ring.firstElementChild as HTMLElement;
  document.body.append(ring, dot);
  document.documentElement.classList.add("f1-has-cursor");
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
  const dx = gsap.quickSetter(dot, "x", "px");
  const dy = gsap.quickSetter(dot, "y", "px");
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

  let state = "";
  const onMove = (e: PointerEvent) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
    const t = e.target as Element;
    const media = t.closest?.(".f1-card-image, .f1-dcard-media");
    const next = media ? "view" : t.closest?.("a, button, [role=option], input") ? "link" : "";
    if (next !== state) {
      state = next;
      ring.dataset.state = next;
      label.textContent = next === "view" ? "view" : "";
    }
  };
  const hide = () => ring.classList.add("is-out");
  const showC = () => ring.classList.remove("is-out");
  const down = () => ring.classList.add("is-down");
  const up = () => ring.classList.remove("is-down");
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", hide);
  document.addEventListener("pointerenter", showC);
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", hide);
    document.removeEventListener("pointerenter", showC);
    window.removeEventListener("pointerdown", down);
    window.removeEventListener("pointerup", up);
    document.documentElement.classList.remove("f1-has-cursor");
    dot.remove();
    ring.remove();
  };
}
