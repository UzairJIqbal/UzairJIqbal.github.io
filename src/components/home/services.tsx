import Link from "next/link";
import { services, servicesSection, site, type ServiceProof } from "@/data/portfolio";
import { FORWARD, SectionHead } from "./parts";

// One line drawing per service, keyed by its deep-link id.
const ICONS: Record<string, React.ReactNode> = {
  "3d-websites": (
    <>
      <path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z" />
      <path d="M4 7.4 12 12l8-4.6M12 12v9.2" />
    </>
  ),
  "chrome-extensions": (
    <path d="M19.4 7.9c0 .3.1.6.3.9l1.6 1.5a2.4 2.4 0 0 1 0 3.4l-1.6 1.6a1 1 0 0 1-.8.3c-.5-.1-.8-.5-1-.9a2.5 2.5 0 1 0-3.2 3.2c.4.2.9.5.9 1a1 1 0 0 1-.3.8l-1.6 1.6a2.4 2.4 0 0 1-3.4 0l-1.5-1.6a1 1 0 0 0-.9-.3c-.5.1-.8.5-1 1a2.5 2.5 0 1 1-3.2-3.2c.5-.2.9-.5.9-1a1 1 0 0 0-.3-.9l-1.5-1.5a2.4 2.4 0 0 1 0-3.4l1.5-1.5c.2-.3.6-.4.9-.3.5.1.9.5 1.1 1a2.5 2.5 0 1 0 3.2-3.2c-.5-.2-.9-.6-1-1.1 0-.3 0-.7.3-.9l1.5-1.5a2.4 2.4 0 0 1 3.4 0l1.6 1.5c.2.3.5.4.8.3.5 0 .9-.5 1-1a2.5 2.5 0 1 1 3.3 3.3c-.5.2-.9.5-1 1z" />
  ),
  "system-design": (
    <>
      <rect x="9" y="2.8" width="6" height="5" rx="1.4" />
      <rect x="3" y="16.2" width="6" height="5" rx="1.4" />
      <rect x="15" y="16.2" width="6" height="5" rx="1.4" />
      <path d="M12 7.8v4.2M6 16.2V12h12v4.2" />
    </>
  ),
  "fix-ai-built-apps": (
    <>
      <path d="M12 2.8 19.5 5.6v5.6c0 4.6-3.2 8.3-7.5 10-4.3-1.7-7.5-5.4-7.5-10V5.6z" />
      <path d="m8.6 12 2.4 2.4 4.6-4.8" />
    </>
  ),
  "ai-agents": (
    <>
      <rect x="4.5" y="7.5" width="15" height="11" rx="3.5" />
      <path d="M12 7.5V4.2M9.4 12.4v1.6M14.6 12.4v1.6M2.5 12v2.5M21.5 12v2.5" />
      <circle cx="12" cy="3.6" r="0.9" />
    </>
  ),
  "website-fixes": (
    <>
      <path d="M3.5 17a8.5 8.5 0 1 1 17 0" />
      <path d="m12 17 4.2-5.2M6.6 12.6l1 .8M12 8.5v1.3M17.4 12.6l-1 .8" />
    </>
  ),
};

function ProofLink({ p }: { p: ServiceProof }) {
  const inner = (
    <>
      <span className="hm-svc-proof-text">
        <b>{p.name}</b>
        {p.note && <span className="hm-svc-note">{p.note}</span>}
      </span>
      <span className="hm-svc-arrow" aria-hidden="true">
        {p.href.startsWith("/") ? "→" : "↗"}
      </span>
    </>
  );
  return p.href.startsWith("/") ? (
    <Link href={p.href} transitionTypes={FORWARD}>
      {inner}
    </Link>
  ) : (
    <a href={p.href} target="_blank" rel="noreferrer">
      {inner}
    </a>
  );
}

export function Services() {
  return (
    <section id="services" className="hm-section" aria-labelledby="services-title">
      <SectionHead id="services-title" idx="02" title={servicesSection.title} />
      <div className="hm-grid hm-svc-grid">
        {services.map((s, i) => (
          <article key={s.id} id={s.id} className="hm-tile hm-svc" data-tilt data-reveal>
            <span className="hm-glow" aria-hidden="true" />
            <span className="hm-svc-beam" aria-hidden="true" />
            <div className="hm-svc-top" aria-hidden="true">
              <span className="hm-svc-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  {ICONS[s.id]}
                </svg>
              </span>
              <span className="hm-svc-n">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3>{s.title}</h3>
            <p className="hm-problem">{s.problem}</p>
            {s.detail && <p className="hm-meta">{s.detail}</p>}
            <ul className="hm-svc-proof">
              {s.proof.map((p) => (
                <li key={p.name}>
                  <ProofLink p={p} />
                </li>
              ))}
            </ul>
            <div className="hm-links">
              <a
                className="hm-btn hm-btn--primary hm-svc-cta"
                href={`mailto:${site.email}?subject=${encodeURIComponent(servicesSection.subjectPrefix + s.title)}`}
              >
                {servicesSection.cta}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
