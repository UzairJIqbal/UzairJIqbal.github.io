"use client";

import { useEffect, useRef } from "react";

// Tilts its contents toward the mouse in 3D, with a soft light that follows the cursor.
// Only on devices with a real mouse, and never for people who turned motion off.
export function Tilt({ children, className = "", max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;

    let rect = el.getBoundingClientRect();
    let frame = 0;
    const set = (rx: number, ry: number, mx: number, my: number) => {
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
    };
    const move = (e: PointerEvent) => {
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => set((0.5 - y) * max, (x - 0.5) * max, x * 100, y * 100));
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      set(0, 0, 50, 50);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt ${className}`}>
      {children}
      <span aria-hidden className="tilt-glare" />
    </div>
  );
}
