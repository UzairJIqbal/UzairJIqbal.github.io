import { heroPortrait } from "@/data/portfolio";

// The hero portrait, built as layers in one 3D space: a ring far back, the
// accent card, the cut-out photo with the head breaking above the card, and
// fact chips floating in front. CSS gives it the entrance and the idle sway,
// so it moves before any script loads; engine.ts adds the pointer tilt.
export function Portrait() {
  return (
    <div className="hm-portrait" data-portrait>
      <div className="hm-pt-tilt">
        <div className="hm-pt-float">
          <span className="hm-pt-ring" aria-hidden="true" />
          <span className="hm-pt-card" aria-hidden="true">
            <span className="hm-pt-glare" />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hm-pt-img"
            src="/portfolio/uzair-hero-560.webp"
            srcSet="/portfolio/uzair-hero-560.webp 560w, /portfolio/uzair-hero-900.webp 900w"
            sizes="(min-width: 900px) 440px, min(74vw, 330px)"
            width={900}
            height={900}
            alt={heroPortrait.alt}
            fetchPriority="high"
          />
          <ul className="hm-pt-chips" aria-hidden="true">
            {heroPortrait.chips.map((c, i) => (
              <li key={c} className="hm-pt-chip" style={{ "--c": i } as React.CSSProperties}>
                <i />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span className="hm-pt-floor" aria-hidden="true" />
    </div>
  );
}
