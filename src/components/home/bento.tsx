import { projects, proofs, sectionTitles, type Project } from "@/data/portfolio";
import { Live, ProjectLinks, SectionHead, Shared, metaLine } from "./parts";

function Tile({ p }: { p: Project }) {
  return (
    <article className={`hm-tile hm-tile--${p.tile}`} data-tilt data-reveal>
      <span className="hm-glow" aria-hidden="true" />
      <div className="hm-text">
        <header className="hm-tile-head">
          <h3>
            <Shared name={`name-${p.slug}`}>
              <span className="hm-vt">{p.name}</span>
            </Shared>
          </h3>
          <Live status={p.status} />
        </header>
        <p className="hm-meta">{metaLine(p)}</p>
        <p className="hm-problem">{p.problem}</p>
        <p className="hm-proof">
          <b>{p.proof.value}</b>
          <span>{p.proof.label}</span>
        </p>
      </div>
      {p.image && (
        <Shared name={`shot-${p.slug}`}>
          <div className="hm-shot" data-shot>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={`${p.name} screenshot`}
              width={960}
              height={600}
              decoding="async"
              loading="lazy"
            />
          </div>
        </Shared>
      )}
      <ProjectLinks p={p} />
    </article>
  );
}

export function Bento() {
  const apps = proofs.find((p) => p.number === "5");
  return (
    <section id="work" className="hm-section" aria-labelledby="work-title">
      <SectionHead id="work-title" idx="01" title={sectionTitles.work} />
      <div className="hm-grid">
        {projects.map((p) => (
          <Tile key={p.slug} p={p} />
        ))}
        {apps && (
          <aside className="hm-tile hm-tile--note" data-reveal>
            <p className="hm-proof">
              <b>{apps.number}</b>
              <span>{apps.text}</span>
            </p>
            <a href="#status" className="hm-link">
              Check them live <span aria-hidden="true">↓</span>
            </a>
          </aside>
        )}
      </div>
    </section>
  );
}
