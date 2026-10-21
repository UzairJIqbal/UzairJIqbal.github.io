"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

const FINE = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

// A dot and a trailing ring that replace the mouse pointer. The ring swells over links and
// shows a word over anything with data-cursor="Word". Elements with data-magnetic lean toward it.
// Mouse only: touch screens and reduced-motion users keep the normal pointer.
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!matchMedia(FINE).matches || !dot.current || !ring.current) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });

    const move = (e: PointerEvent) => {
      html.classList.add("cursor-on");
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element;
      const labelled = t.closest?.("[data-cursor]");
      const r = ring.current!;
      if (labelled) {
        r.dataset.state = "label";
        label.current!.textContent = labelled.getAttribute("data-cursor");
      } else if (t.closest?.("a, button, [role=button], label")) {
        r.dataset.state = "link";
      } else {
        delete r.dataset.state;
      }
    };
    const out = () => html.classList.remove("cursor-on");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", out);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", out);
      html.classList.remove("has-cursor", "cursor-on");
    };
  }, []);

  // Magnetic buttons, re-bound on every page.
  useEffect(() => {
    if (!matchMedia(FINE).matches) return;
    const cleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")).map((el) => {
      const strength = parseFloat(el.dataset.magnetic || "") || 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)", overwrite: true });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        gsap.set(el, { clearProps: "transform" });
      };
    });
    return () => cleanups.forEach((c) => c());
  }, [pathname]);

  return (
    <div aria-hidden className="cursor">
      <div ref={ring} className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
