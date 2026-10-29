"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";

// The GitHub contribution chart. On phones it's wider than the screen and scrolls sideways,
// so it starts scrolled to the right end: the newest months show first.
export function GithubChart() {
  const box = useRef<HTMLAnchorElement>(null);

  const toNewest = () => {
    const el = box.current;
    if (el && matchMedia("(max-width: 639px)").matches) el.scrollLeft = el.scrollWidth;
  };

  useEffect(toNewest, []);

  return (
    <a
      ref={box}
      href={site.github}
      target="_blank"
      rel="noreferrer"
      data-wipe
      className="mt-10 block overflow-x-auto rounded-2xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_var(--accent)]"
    >
      <p className="sticky left-0 mb-2 font-mono text-xs text-neutral-500">GitHub activity, last 12 months</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://ghchart.rshah.org/0f7a5c/${site.githubUser}`}
        alt={`${site.githubUser} GitHub contribution chart`}
        loading="lazy"
        onLoad={toNewest}
        className="w-full min-w-[640px] sm:min-w-0"
      />
    </a>
  );
}
