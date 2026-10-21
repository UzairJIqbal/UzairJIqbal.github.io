"use client";

import dynamic from "next/dynamic";

// Three.js only loads in the browser, after the page itself is ready.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export function HeroCanvas() {
  return (
    <div
      aria-hidden
      className="hero-canvas pointer-events-none absolute -right-36 -top-4 h-[380px] w-[380px] sm:-right-64 sm:-top-16 sm:h-[620px] sm:w-[620px] lg:-right-80 xl:-right-96"
    >
      <HeroScene />
    </div>
  );
}
