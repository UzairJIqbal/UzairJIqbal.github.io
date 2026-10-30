"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { about, projects, proofs, site, skills } from "@/data/portfolio";
import "./f1.css";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const A = "/sites/espn-f1";

// Vertical step of each skills slide, in viewport heights (the source's
// first five slides: 0.5, 1, 1.5, 1, 0.5).
const HOR2_OFFSETS = [0.5, 1, 1.5, 1, 0.5];

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const usePrefersReducedMotion = () =>
  useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);

const SCROLL_PER_PX = 60000 / 40912;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Point = { x: number; y: number };

type Refs = {
  diag: HTMLElement;
  hor1: HTMLElement;
  finish: HTMLElement;
  hor2: HTMLElement;
  world: HTMLElement;
  cards: HTMLElement[];
};

// Camera path through the grid, following the source's point list.
function buildPoints(r: Refs, hor2Count: number): Point[] {
  const a = window.innerWidth;
  const c = window.innerHeight;
  const f = 300;
  const h = a < 768 ? 275 : 575;
  const hor1W = r.hor1.offsetWidth;
  const card = a < 768 ? { marginTop: 40, h: 550 } : { marginTop: 40, h: 400 };
  const start = card.marginTop + card.h / 2;
  const S = Math.min(a * 1.25, 1440);
  const C = r.finish.offsetWidth + 100;

  // Rows and columns are read from the laid-out grid (the source sums the
  // same section sizes, which only agree when every row is content-sized).
  const hor1Box = worldBox(r.hor1, r.world);
  const y1 = hor1Box.y + c * 0.5; // hor1 row centre
  const y2 = worldBox(r.diag, r.world).y; // bottom of vert2
  const xH1 = hor1Box.x;
  const xV2 = xH1 + hor1W + h;
  const xLast = xV2 + (r.cards[r.cards.length - 1]?.offsetLeft ?? 0) + 150;
  const hor2Box = worldBox(r.hor2, r.world);
  const x0 = hor2Box.x; // left edge of hor2
  const Y0 = hor2Box.y;

  const pts: Point[] = [
    { x: a * 0.5, y: c * 0.5 },
    { x: a * 2, y: c * 0.5 },
    { x: a * 2 + h, y: c * 0.5 },
    { x: a * 2 + h, y: c * 0.5 + f },
    { x: a * 2 + h, y: y1 - c * 0.25 },
    { x: a * 2 + h, y: y1 },
    { x: xH1, y: y1 },
    { x: xH1 + hor1W, y: y1 },
    { x: xV2, y: y1 },
    { x: xV2, y: y1 + f },
    { x: xV2, y: y2 },
    { x: xV2, y: y2 + start - 100 },
    { x: xV2, y: y2 + start },
  ];
  r.cards.slice(1).forEach((el, i) => {
    pts.push({ x: xV2 + el.offsetLeft, y: y2 + start + (card.marginTop + card.h) * (i + 1) });
  });
  const lastY = pts[pts.length - 1].y;
  pts.push({ x: xLast, y: lastY + f }, { x: xLast, y: Y0 }, { x: x0, y: Y0 + c * 0.5 });
  pts.push({ x: x0 + S * 0.5, y: Y0 + c * 0.5 }, { x: x0 + S * 0.75, y: Y0 + c * 0.5 });
  for (let k = 1; k < hor2Count; k++) {
    const y = Y0 + c * HOR2_OFFSETS[k];
    for (const q of [0, 0.25, 0.5, 0.75]) pts.push({ x: x0 + S * (k + q), y });
  }
  const endY = Y0 + c * HOR2_OFFSETS[hor2Count - 1];
  pts.push(
    { x: x0 + S * hor2Count, y: endY },
    { x: x0 + S * hor2Count + C, y: endY },
    { x: x0 + S * hor2Count + C + a * 0.5, y: endY },
  );
  return pts;
}

// Quadratic-midpoint smoothing, as in the source.
function toPath(pts: Point[]) {
  return pts.reduce((acc, n, j, list) => {
    if (j === 0) return `M${n.x},${n.y}`;
    const u = list[j - 1];
    const bx = (u.x + n.x) / 2;
    const by = (u.y + n.y) / 2;
    return (
      acc +
      (j === 1 ? ` L${bx},${by}` : ` Q${u.x},${u.y} ${bx},${by}`) +
      (j === list.length - 1 ? ` L${n.x},${n.y}` : "")
    );
  }, "");
}

// Top-left of an element inside the world, ignoring the camera transform.
function worldBox(el: HTMLElement, world: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== world) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function worldPos(el: HTMLElement, world: HTMLElement) {
  const b = worldBox(el, world);
  return { x: b.x + el.offsetWidth / 2, y: b.y + el.offsetHeight / 2 };
}

function Dash({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 82 8" aria-hidden="true" className={active ? "is-active" : undefined}>
      <path d="M0 8L8 0H82L74 8H0Z" />
    </svg>
  );
}

function ProgressBar({ labels, active }: { labels: string[]; active: number }) {
  return (
    <div className="f1-progress-bar">
      <div className="f1-progress-sections" style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)` }}>
        {labels.map((label, i) => (
          <div key={label} className={`f1-progress-section${i === active ? " is-active" : ""}`}>
            <span className="f1-progress-date">{label}</span>
            <Dash />
          </div>
        ))}
      </div>
    </div>
  );
}

// Intro loader: a short "build" in a terminal window. Every line is derived
// from portfolio data, and the progress bar reuses the toolbar's dash shape.
const LOADER_CMD = "npm run dev";

function Loader({ onDone }: { onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const chars = useRef<(HTMLSpanElement | null)[]>([]);
  const lines = useRef<(HTMLLIElement | null)[]>([]);
  const dashes = useRef<(SVGSVGElement | null)[]>([]);

  const log = [
    `loading ${projects.length} projects`,
    `loading ${skills.length} skill groups`,
    `loading ${proofs.length} proofs`,
  ];

  useIsoLayoutEffect(() => {
    if (!box.current) return;
    const tl = gsap.timeline({ onComplete: onDone });
    tl.fromTo(box.current, { scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power4.out" })
      .to(chars.current, { opacity: 1, duration: 0.01, stagger: 0.04, ease: "none" }, "-=0.2")
      .to(lines.current, { opacity: 1, duration: 0.01, stagger: 0.18, ease: "none" }, "+=0.1")
      .to(dashes.current, { color: "var(--color-accent)", duration: 0.01, stagger: 0.15, ease: "none" }, "<")
      .to({}, { duration: 0.35 })
      .to(box.current, { opacity: 0, y: -20, duration: 0.3, ease: "power3.in" });
    return () => {
      tl.kill();
    };
  }, [onDone]);

  return (
    <div className="f1-loader" aria-hidden="true">
      <div className="f1-loader-inner" ref={box}>
        <div className="f1-term-bar">
          <span /><span /><span />
          <p>~/{slug}</p>
        </div>
        <div className="f1-term-body">
          <p className="f1-term-cmd">
            <b>$</b>{" "}
            {LOADER_CMD.split("").map((c, i) => (
              <span key={i} ref={(el) => { chars.current[i] = el; }}>{c}</span>
            ))}
            <i className="f1-term-caret" />
          </p>
          <ul>
            {log.map((l, i) => (
              <li key={l} ref={(el) => { lines.current[i] = el; }}>
                <b>&#9656;</b> {l}
              </li>
            ))}
            <li ref={(el) => { lines.current[log.length] = el; }} className="f1-term-ready">
              <b>&#10003;</b> ready — {site.name}, {site.role}
            </li>
          </ul>
          <div className="f1-term-progress">
            {[0, 1, 2, 3].map((i) => (
              <svg key={i} viewBox="0 0 82 8" ref={(el) => { dashes.current[i] = el; }}>
                <path d="M0 8L8 0H82L74 8H0Z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Figure labels, written like a code reference: fig.01, fig.02 ...
const fig = (n: number) => `fig.${String(n).padStart(2, "0")}`;

const slug = site.name.toLowerCase().replace(/\s+/g, "-");

function Wordmark() {
  return (
    <>
      <span className="f1-wordmark-dim" aria-hidden="true">~/</span>
      <span aria-hidden="true">{slug}</span>
      <span className="f1-sr">{site.name}</span>
    </>
  );
}

function Toolbar() {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${site.name} — ${site.role}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* share sheet dismissed */
    }
  };
  return (
    <header className="f1-toolbar">
      <a
        href="#top"
        className="f1-wordmark"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0 });
        }}
      >
        <Wordmark />
      </a>
      <div className="f1-share">
        <span aria-live="polite">{copied ? "Link copied" : ""}</span>
        <button type="button" onClick={share} aria-label="Share this page">
          <svg viewBox="0 0 21 25" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.5 16V2M5 7l5.5-5.5L16 7M3 11v12h15V11" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}

function ProjectLinks({ p }: { p: (typeof projects)[number] }) {
  const links = [
    { label: "Live app", href: p.live },
    { label: "Store listing", href: p.store },
    { label: "Code", href: p.code },
    { label: "Demo", href: p.demo },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));
  return (
    <div className="f1-links">
      {links.map((l) => (
        <a key={l.label} className="f1-link" href={l.href} target="_blank" rel="noreferrer">
          {l.label}
        </a>
      ))}
    </div>
  );
}

const proofFor = (name: string) => proofs.find((p) => p.text.startsWith(name) || p.text.includes(`on ${name}`));

export function Story() {
  const [introDone, setIntroDone] = useState(false);
  const reduced = usePrefersReducedMotion();
  const loaded = introDone || reduced;
  const [hor1Active, setHor1Active] = useState(0);

  const worldRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const diagRef = useRef<HTMLDivElement>(null);
  const hor1Ref = useRef<HTMLDivElement>(null);
  const hor1ProgressRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<HTMLDivElement>(null);
  const hor2Ref = useRef<HTMLElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const finishLoading = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.body.classList.add("f1-active");
    return () => {
      document.body.classList.remove("f1-active");
      document.body.style.height = "";
    };
  }, [loaded]);

  // Camera: a focus point rides the path as the page scrolls; the world is
  // translated so the point stays centred, clamped to the world's edges.
  useEffect(() => {
    if (!loaded) return;
    const world = worldRef.current!;
    const focus = focusRef.current!;
    const path = pathRef.current!;
    let tween: gsap.core.Tween | null = null;
    let lastActive = -1;

    const build = (progress = 0) => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      const refs: Refs = {
        diag: diagRef.current!,
        hor1: hor1Ref.current!,
        finish: finishRef.current!,
        hor2: hor2Ref.current!,
        world,
        cards: cardRefs.current,
      };
      path.setAttribute("d", toPath(buildPoints(refs, skills.length)));
      // The source scrolls 60000px over a ~40900px path; keep that pace for
      // our shorter path so the camera moves at the same speed per wheel tick.
      document.body.style.height = `${Math.round(path.getTotalLength() * SCROLL_PER_PX + window.innerHeight)}px`;
      gsap.set(focus, { xPercent: -50, yPercent: -50 });
      const clampX = gsap.utils.clamp(0, world.offsetWidth - window.innerWidth);
      const clampY = gsap.utils.clamp(0, world.offsetHeight - window.innerHeight);
      const get = gsap.getProperty(focus) as (p: string) => number;
      const hor1 = hor1Ref.current!;
      const hor1Progress = hor1ProgressRef.current!;
      const hor1Left = worldPos(hor1, world).x - hor1.offsetWidth / 2;

      tween = gsap.to(focus, {
        scrollTrigger: {
          id: "f1-camera",
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 0.5,
        },
        motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
        ease: "none",
        onUpdate: () => {
          const x = get("x");
          const y = get("y");
          const left = Math.round(clampX(x - window.innerWidth / 2));
          const top = Math.round(clampY(y - window.innerHeight / 2));
          world.style.transformOrigin = `${Math.round(x)}px ${Math.round(y)}px`;
          world.style.transform = `translate3d(${-left}px, ${-top}px, 1px)`;

          // Timeline nav stays pinned at the top while the projects pan by.
          const a = window.innerWidth;
          const slide = a < 768 ? a * 1.25 : a;
          const offset = gsap.utils.clamp(0, hor1.offsetWidth - a, left - hor1Left);
          hor1Progress.style.transform = `translate3d(${offset}px, 0, 0)`;
          const active = gsap.utils.clamp(0, projects.length - 1, Math.round((left - hor1Left) / slide));
          if (active !== lastActive) {
            lastActive = active;
            setHor1Active(active);
          }
        },
      });
      tween.scrollTrigger?.scroll(progress * ScrollTrigger.maxScroll(window));
      tween.progress(progress);
      ScrollTrigger.refresh();
    };

    let timer = 0;
    const rebuild = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => build(tween?.scrollTrigger?.progress ?? 0), 120);
    };

    const first = window.setTimeout(() => build(0), 20);
    const ro = new ResizeObserver(rebuild);
    ro.observe(world);
    window.addEventListener("resize", rebuild);
    document.fonts?.ready.then(rebuild);

    // Keyboard: move the camera to whatever receives focus.
    const viewport = viewportRef.current!;
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      viewport.scrollTop = viewport.scrollLeft = world.scrollTop = world.scrollLeft = 0;
      if (!world.contains(el)) return;
      const target = worldPos(el, world);
      const total = path.getTotalLength();
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i <= 600; i++) {
        const pt = path.getPointAtLength((total * i) / 600);
        const dist = Math.hypot(pt.x - target.x, pt.y - target.y);
        if (dist < bestD) {
          bestD = dist;
          best = i / 600;
        }
      }
      window.scrollTo({ top: best * ScrollTrigger.maxScroll(window), behavior: reduced ? "auto" : "smooth" });
    };
    document.addEventListener("focusin", onFocus);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("resize", rebuild);
      document.removeEventListener("focusin", onFocus);
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [loaded, reduced]);

  const statProof = proofs.find((p) => p.number === "17");
  const appsProof = proofs.find((p) => p.number === "5");
  const liveApps = projects.filter((p) => p.live && p.image);
  const comparisons = ["Flowlens", "VerifAI", "NeuraMeet"]
    .map((name) => ({ project: projects.find((p) => p.name === name)!, proof: proofFor(name) }))
    .filter((c) => c.project && c.proof);
  const maxSkills = Math.max(...skills.map((s) => s.items.length));
  const hor2Labels = skills.map((s) => s.group);
  const contact = [
    { label: "Email", href: `mailto:${site.email}` },
    { label: "GitHub", href: site.github },
    { label: "LinkedIn", href: site.linkedin },
    { label: "Resume", href: site.resume },
  ].filter((l) => l.href);

  return (
    <main className="f1" id="top">
      {!loaded && !reduced && <Loader onDone={finishLoading} />}
      <Toolbar />
      <div className="f1-viewport-container">
        <div className="f1-viewport" ref={viewportRef}>
          <div className="f1-world" ref={worldRef}>
            <Img src={`${A}/dev/minimap-wide.svg`} alt="" className="f1-vert1-bg" />
            <div className="f1-grid">
              {/* Hero + intro */}
              <div className="f1-outer f1-intro">
                <div className="f1-inner">
                  <div className="f1-hero">
                    <div className="f1-hero-media">
                      <div className="f1-hero-portrait">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/portfolio/uzair.webp" alt="Uzair Javaid" />
                      </div>
                    </div>
                    <div className="f1-hero-wrapper">
                      <p className="f1-overline">{site.role}</p>
                      <h1 className="f1-h1 f1-display">{site.name}</h1>
                      <div className="f1-hero-accents">
                        <span className="f1-hero-fig">{fig(1)}</span>
                        <p className="f1-scroll-hint">Scroll to continue</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="f1-inner">
                  <div className="f1-intro-content">
                    <div className="f1-intro-container">
                      <p className="f1-intro-copy">{site.topLine}</p>
                      <hr className="f1-intro-hr" />
                      <p className="f1-intro-copy f1-bold">{site.openTo}</p>
                    </div>
                    <Img src={`${A}/dev/commits-row.svg`} alt="" className="f1-intro-rumble" />
                  </div>
                </div>
              </div>
              <div className="f1-outer f1-background">
                <div className="f1-inner" />
              </div>

              {/* About column */}
              <div className="f1-outer f1-vert1">
                <div className="f1-inner">
                  <div className="f1-vert-inner">
                    <div className="f1-tall">
                      <h2 className="f1-tall-title">About</h2>
                      <p className="f1-tall-copy">{about[0]}</p>
                      <p className="f1-tall-copy">{about[1]}</p>
                      <figure className="f1-inline-chart">
                        <h3>Skills by group</h3>
                        <ul>
                          {skills.map((s) => (
                            <li key={s.group}>
                              <div className="f1-bar" style={{ width: `${(s.items.length / maxSkills) * 100}%` }}>
                                {s.items.length}
                              </div>
                              <div className="f1-bar-label">{s.group}</div>
                            </li>
                          ))}
                        </ul>
                      </figure>
                      <p className="f1-tall-copy">{about[4]}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="f1-outer f1-blank1">
                <div className="f1-inner">
                  <Img src={`${A}/dev/branch-arrow.svg`} alt="" className="f1-big-arrow" />
                </div>
              </div>

              {/* Projects, panned horizontally */}
              <section className="f1-outer f1-hor1" ref={hor1Ref} aria-label="Projects">
                <div className="f1-hor1-wrapper">
                  <div className="f1-hor1-progress" ref={hor1ProgressRef}>
                    <ProgressBar labels={projects.map((p) => p.name)} active={hor1Active} />
                  </div>
                  <div className="f1-hor1-sections">
                    {projects.map((p, i) => (
                      <article key={p.name} className="f1-hor1-section">
                        {i % 2 === 1 && <Img src={`${A}/dev/commits-row.svg`} alt="" className="f1-rumble" />}
                        <div className="f1-card">
                          <div className="f1-card-wrapper">
                            <div className="f1-card-top">
                              <div className="f1-card-header">
                                <h2 className="f1-name f1-display">{p.name}</h2>
                                <span className="f1-underline f1-bold">{p.status}</span>
                              </div>
                              {p.image && (
                                <div className="f1-card-image">
                                  <a href={p.live || p.store || p.code} target="_blank" rel="noreferrer" tabIndex={-1}>
                                    <Img src={p.image} alt={`${p.name} screenshot`} className="f1-shot" />
                                  </a>
                                </div>
                              )}
                            </div>
                            <div className="f1-card-bottom">
                              <div>
                                <span className="f1-fig">{fig(i + 2)}</span>
                                <div className="f1-card-chart">
                                  <h3>Built with</h3>
                                  <ul className="f1-tags">
                                    {p.tools.map((t) => (
                                      <li key={t} className="f1-tag">
                                        {t}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="f1-card-copy">
                                <p>{p.line}</p>
                                <ProjectLinks p={p} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              {/* How I build column */}
              <div className="f1-outer f1-vert2">
                <div className="f1-inner">
                  <div className="f1-vert-inner">
                    <Img src={`${A}/dev/minimap-wide.svg`} alt="" className="f1-vert-bg" />
                    <div className="f1-tall">
                      <h2 className="f1-tall-title">How I build</h2>
                      <p className="f1-tall-copy">{about[2]}</p>
                      <p className="f1-tall-copy">{about[3]}</p>
                      {statProof && (
                        <p className="f1-tall-copy f1-stat">
                          <span className="f1-display">{statProof.number}</span>
                          {statProof.text}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="f1-corner" />
                </div>
              </div>

              <div className="f1-outer f1-blank2">
                <div className="f1-inner" />
              </div>

              {/* Diagonal cards: the numbers */}
              <div className="f1-outer f1-diag" ref={diagRef}>
                <div className="f1-inner">
                  <div className="f1-cards-section">
                    <div className="f1-cards-inner">
                      <div
                        className="f1-card-slot"
                        ref={(el) => {
                          if (el) cardRefs.current[0] = el;
                        }}
                      >
                        <div className="f1-dcard">
                          <div className="f1-dcard-wrapper">
                            <div className="f1-dcard-media">
                              <div className="f1-app-grid">
                                {liveApps.slice(0, 4).map((p) => (
                                  <a key={p.name} className="f1-app" href={p.live} target="_blank" rel="noreferrer">
                                    <div className="f1-app-top">
                                      <Img src={p.image!} alt="" />
                                    </div>
                                    <div className="f1-app-bottom">
                                      <svg className="f1-app-play" viewBox="0 0 22 22" aria-hidden="true">
                                        <circle cx="11" cy="11" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M9 7l6 4-6 4z" fill="currentColor" />
                                      </svg>
                                      <p className="f1-app-copy">
                                        <b>{p.name}</b>
                                        {p.tools.slice(0, 2).join(" · ")}
                                      </p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                            <div className="f1-dcard-content">
                              <div className="f1-dcard-progress">
                                {[0, 1, 2, 3].map((n) => (
                                  <span key={n} className={n === 0 ? "is-active" : undefined}>
                                    <Dash />
                                  </span>
                                ))}
                              </div>
                              {appsProof && (
                                <>
                                  <h3 className="f1-dcard-title">{appsProof.number} apps live</h3>
                                  <p className="f1-dcard-copy">{appsProof.text}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {comparisons.map(({ project, proof }, i) => (
                        <div
                          key={project.name}
                          className="f1-card-slot"
                          ref={(el) => {
                            if (el) cardRefs.current[i + 1] = el;
                          }}
                        >
                          <div className="f1-dcard">
                            <div className="f1-dcard-wrapper">
                              <div className="f1-dcard-media">
                                <div className="f1-compare">
                                  <div className="f1-compare-col">
                                    <div className="f1-compare-figure">
                                      <span className="f1-compare-number f1-display">{proof!.number}</span>
                                    </div>
                                    <span>Result</span>
                                  </div>
                                  <div className="f1-compare-col">
                                    <div className="f1-compare-figure">
                                      {project.image && <Img src={project.image} alt={`${project.name} screenshot`} />}
                                    </div>
                                    <span>{project.name}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="f1-dcard-content">
                                <div className="f1-dcard-progress">
                                  {[0, 1, 2, 3].map((n) => (
                                    <span key={n} className={n === i + 1 ? "is-active" : undefined}>
                                      <Dash />
                                    </span>
                                  ))}
                                </div>
                                <h3 className="f1-dcard-title">{project.name}</h3>
                                <p className="f1-dcard-copy">{proof!.text}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="f1-post-diag">
                <div className="f1-inner" />
              </div>

              {/* At a glance */}
              <div className="f1-outer f1-future">
                <div className="f1-inner">
                  <div className="f1-future-section">
                    <div className="f1-future-container">
                      <h2 className="f1-tall-title">At a glance</h2>
                      {site.proof.map((line) => (
                        <p key={line} className="f1-tall-copy">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="f1-outer f1-post-future">
                <div className="f1-inner">
                  <div className="f1-future-bg">
                    <Img src={`${A}/dev/wedge.svg`} alt="" />
                    <Img src={`${A}/dev/commits-col.svg`} alt="" />
                    <div className="f1-future-line" />
                    <div className="f1-corner" />
                  </div>
                </div>
              </div>

              <div className="f1-outer f1-blank3">
                <div className="f1-inner">
                  <Img src={`${A}/dev/branch-arrow.svg`} alt="" className="f1-big-arrow" />
                </div>
              </div>

              {/* Skills, stepping up and down */}
              <section className="f1-outer f1-hor2" ref={hor2Ref} aria-label="Skills">
                {skills.map((s, k) => {
                  const off = HOR2_OFFSETS[k] ?? 0.5;
                  const prev = HOR2_OFFSETS[k - 1];
                  const next = HOR2_OFFSETS[k + 1];
                  const corners: string[] = [];
                  if (k > 0) corners.push(off > prev ? "is-tl" : "is-bl");
                  if (k < skills.length - 1) corners.push(next > off ? (k === 0 ? "is-first" : "is-br") : "is-tr");
                  return (
                    <div
                      key={s.group}
                      className="f1-inner"
                      style={k > 0 ? { marginTop: `calc(${(off - 0.5) * 100}svh + 25px)` } : undefined}
                    >
                      {corners.map((c) => (
                        <div key={c} className={`f1-corner ${c}`} />
                      ))}
                      {k % 2 === 1 && <Img src={`${A}/dev/commits-row.svg`} alt="" className="f1-rumble" />}
                      <div className="f1-hor2-item">
                        <div className="f1-hor2-progress">
                          <ProgressBar labels={hor2Labels} active={k} />
                        </div>
                        <div className="f1-skill">
                          <div className="f1-skill-wrapper">
                            <h2 className="f1-skill-title f1-display">{s.group}</h2>
                            <figure className="f1-skill-figure">
                              <h3>Skills</h3>
                              <ul className="f1-skill-items">
                                {s.items.map((item) => (
                                  <li key={item} className="f1-bold">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </figure>
                            <span className="f1-fig">{fig(projects.length + k + 2)}</span>
                            <hr className="f1-skill-hr" />
                            {/* TODO(portfolio): a short line per skill group (how it's used) would fill the source's copy slot. */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div
                  className="f1-inner f1-finish"
                  ref={finishRef}
                  style={{ marginTop: `calc(${(HOR2_OFFSETS[skills.length - 1] - 0.5) * 100}svh + 25px)` }}
                />
                <div
                  className="f1-inner f1-last"
                  style={{ marginTop: `${(HOR2_OFFSETS[skills.length - 1] - 0.5) * 100}svh` }}
                >
                  <footer className="f1-last-frame">
                    <div className="f1-credits-recirc">
                      <div className="f1-credits">
                        <p>{site.openTo}</p>
                        <p>{site.location}</p>
                      </div>
                      <div className="f1-recirc">
                        <hr />
                        <h2 className="f1-recirc-title">Contact</h2>
                        <div className="f1-recirc-links">
                          {contact.map((l) => (
                            <a
                              key={l.label}
                              href={l.href}
                              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                            >
                              {l.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="f1-credits-footer">
                      <span className="f1-wordmark"><Wordmark /></span>
                      <div>
                        <div className="f1-footer-links">
                          {contact.map((l) => (
                            <a key={l.label} href={l.href} tabIndex={-1}>
                              {l.label}
                            </a>
                          ))}
                        </div>
                        <p>© 2026 {site.name}</p>
                      </div>
                    </div>
                  </footer>
                </div>
              </section>
            </div>
            <svg className="f1-svg" aria-hidden="true">
              <path ref={pathRef} className="f1-scroll-path" />
            </svg>
            <div className="f1-focus" ref={focusRef} />
          </div>
        </div>
      </div>
    </main>
  );
}
