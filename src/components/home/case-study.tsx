import { sectionTitles, type Project } from "@/data/portfolio";
import { BackLink, Footer, Live, Nav, Page, ProjectLinks, Shared, metaLine } from "./parts";
import { MotionLayer } from "./motion/motion-layer";
import "./home.css";

export function CaseStudy({ p }: { p: Project }) {
  const s = p.study;
  return (
    <Page>
      <Nav away />
      <main className="hm-case">
        <BackLink label={sectionTitles.back} />
        <h1>
          <Shared name={`name-${p.slug}`}>
            <span className="hm-vt">{p.name}</span>
          </Shared>
          <Live status={p.status} />
        </h1>
        <p className="hm-meta">{metaLine(p)}</p>
        <ProjectLinks p={p} study={false} />
        {p.image && (
          <Shared name={`shot-${p.slug}`}>
            <div className="hm-shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={`${p.name} screenshot`} width={960} height={600} decoding="async" />
            </div>
          </Shared>
        )}

        <section aria-labelledby="cs-problem" data-reveal>
          <h2 id="cs-problem">Problem</h2>
          <p className="hm-lead">{p.problem}</p>
        </section>

        <section aria-labelledby="cs-built" data-reveal>
          <h2 id="cs-built">What I built</h2>
          <p>{s.built}</p>
        </section>

        <section aria-labelledby="cs-how">
          <h2 id="cs-how">How it works</h2>
          <ol className="hm-flow">
            {s.how.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="hm-cap">{s.how.caption}</p>
        </section>

        <section aria-labelledby="cs-result">
          <h2 id="cs-result">Result</h2>
          <ul className="hm-results">
            {s.result.map((r) => (
              <li key={r} data-reveal>
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="cs-next" data-reveal>
          <h2 id="cs-next">What I&apos;d do next</h2>
          <p>{s.next}</p>
        </section>

        <div className="hm-case-foot">
          <ProjectLinks p={p} study={false} />
        </div>
      </main>
      <Footer />
      <MotionLayer />
    </Page>
  );
}
