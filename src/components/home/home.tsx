import { about, howIBuild, proofs, sectionTitles, site, skills } from "@/data/portfolio";
import { Bento } from "./bento";
import { Services } from "./services";
import { Buttons, Footer, Nav, Page, SectionHead } from "./parts";
import { StatusBox } from "./status-box";
import { Words } from "./words";
import { Portrait } from "./portrait";
import { MotionLayer } from "./motion/motion-layer";
import "./home.css";

// CSS-only entrance for the hero, so the first view never waits on JS.
const enter = (d: number) => ({ "data-in": "", style: { "--d": d } as React.CSSProperties });

export function Home() {
  const phases = proofs.find((p) => p.number === "17");
  return (
    <Page>
      <Nav />
      <main>
        <section className="hm-hero" aria-labelledby="hero-title">
          <div className="hm-hero-inner">
            <div className="hm-hero-copy">
              {/* One H1 carries name and role, so crawlers read both together. */}
              <h1 id="hero-title" className="hm-h1">
                <span className="hm-role" {...enter(0)}>
                  {site.role}
                </span>{" "}
                <span className="hm-name">
                  <Words text={site.name} />
                </span>
              </h1>
              <p className="hm-philosophy" {...enter(3)}>
                {site.philosophy}
              </p>
              <p className="hm-open" {...enter(4)}>
                <i aria-hidden="true" />
                {site.openTo}
              </p>
              <div {...enter(5)}>
                <Buttons />
              </div>
            </div>
            <Portrait />
          </div>
          <a href="#work" className="hm-cue" aria-label={sectionTitles.work} {...enter(7)}>
            <span aria-hidden="true">↓</span>
          </a>
        </section>

        <div className="hm-wrap">
          <Bento />

          <Services />

          <section id="build" className="hm-section" aria-labelledby="build-title">
            <SectionHead id="build-title" idx="03" title={sectionTitles.build} />
            <div className="hm-build">
              <div className="hm-build-lines">
                {howIBuild.map((l) => (
                  <p key={l} data-scrub>
                    <Words text={l} mode="plain" />
                  </p>
                ))}
              </div>
              {phases && (
                <p className="hm-stat" data-reveal>
                  <b data-count>{phases.number}</b>
                  <span>{phases.text}</span>
                </p>
              )}
            </div>
          </section>

          <section id="skills" className="hm-section" aria-labelledby="skills-title">
            <SectionHead id="skills-title" idx="04" title={sectionTitles.skills} />
            <ul className="hm-skills">
              {skills.map((s) => (
                <li key={s.group} data-reveal>
                  <b>{s.group}</b>
                  <span>{s.items.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="about" className="hm-section" aria-labelledby="about-title">
            <SectionHead id="about-title" idx="05" title={sectionTitles.about} />
            <div className="hm-about">
              {about.map((l) => (
                <p key={l} data-reveal>
                  {l}
                </p>
              ))}
            </div>
          </section>

          <section id="contact" className="hm-section" aria-labelledby="contact-title">
            <div className="hm-contact" data-grow>
              <span className="hm-contact-glow" aria-hidden="true" />
              <h2 id="contact-title" data-split>
                <Words text={sectionTitles.contact} />
              </h2>
              <p data-reveal>{site.openTo}</p>
              <div data-reveal>
                <Buttons />
              </div>
            </div>
          </section>

          <section className="hm-section" aria-label={sectionTitles.status} data-reveal>
            <StatusBox />
          </section>
        </div>
      </main>
      <Footer />
      <MotionLayer />
    </Page>
  );
}
