import Image from "next/image";
import { about, projects, proofs, site, skills } from "@/data/site";
import { Footer, Nav } from "@/components/Nav";
import { StatusBox } from "@/components/StatusBox";
import { Button, ProjectCard, Section } from "@/components/ui";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Tilt } from "@/components/Tilt";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* 1. Top: name, role, one line, proof line, Resume / Email / GitHub */}
        <section className="relative pb-12 pt-12 sm:pt-16">
          <HeroCanvas />
          <div className="relative">
            <p
              data-hero-item
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted"
            >
              <span className="ping h-2 w-2 rounded-full bg-accent" />
              {site.openTo}
            </p>
            <h1 data-hero-item className="text-4xl font-bold tracking-tight sm:text-6xl">
              {site.name}
            </h1>
            <p data-hero-item className="mt-4 max-w-xl text-lg leading-relaxed sm:text-xl">
              {site.topLine}
            </p>
            <p data-hero-item className="mt-4 max-w-xl font-mono text-sm text-muted">
              {site.proof.join("  ·  ")}
            </p>
            <div data-hero-item className="mt-7 flex flex-wrap gap-3">
              <Button href={site.resume} external>
                Resume
              </Button>
              <Button href={`mailto:${site.email}`} primary>
                Email me
              </Button>
              <Button href={site.github} external>
                GitHub
              </Button>
              {site.linkedin && (
                <Button href={site.linkedin} external>
                  LinkedIn
                </Button>
              )}
            </div>

            {/* GitHub activity right under the top, like Rinkit's site */}
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              data-wipe
              className="mt-10 block overflow-x-auto rounded-2xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_var(--accent)]"
            >
              <p className="mb-2 font-mono text-xs text-neutral-500">GitHub activity, last 12 months</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://ghchart.rshah.org/0f7a5c/${site.githubUser}`}
                alt={`${site.githubUser} GitHub contribution chart`}
                loading="lazy"
                className="w-full min-w-[640px] sm:min-w-0"
              />
            </a>
          </div>
        </section>

        {/* 2. Best projects */}
        <Section id="projects" title="Projects">
          <div data-stagger className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.name} p={p} />
            ))}
          </div>
        </Section>

        {/* 3. Proof */}
        <Section id="proof" title="Proof">
          <ul data-stagger className="divide-y divide-line">
            {proofs.map((x) => (
              <li key={x.number} className="flex gap-5 py-4 first:pt-0">
                <span data-count className="w-20 shrink-0 font-mono text-lg font-semibold tabular-nums text-accent">
                  {x.number}
                </span>
                <span className="leading-relaxed">{x.text}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 4. Skills: groups, names only */}
        <Section id="skills" title="Skills">
          <dl data-stagger className="space-y-4">
            {skills.map((s) => (
              <div key={s.group} className="sm:flex sm:gap-6">
                <dt className="mb-2 w-28 shrink-0 pt-0.5 font-medium sm:mb-0">{s.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {s.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-line bg-surface px-2 py-0.5 text-sm text-muted transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                    >
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* 5. Writing: skipped for now. Add a section here once you have 2 posts. */}

        {/* 6. About */}
        <Section id="about" title="About">
          <div data-reveal className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Tilt className="w-fit shrink-0 rounded-2xl" max={12}>
              <Image
                src="/uzair.webp"
                alt={`Photo of ${site.name}`}
                width={140}
                height={140}
                className="h-32 w-32 rounded-2xl object-cover sm:h-36 sm:w-36"
              />
            </Tilt>
            <div className="space-y-2 leading-relaxed">
              {about.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </Section>

        {/* 7. Contact */}
        <Section id="contact" title="Contact">
          <div data-reveal className="glow-card rounded-2xl bg-text p-6 text-bg sm:p-8">
            <p className="text-2xl font-semibold">Hiring? Let's talk.</p>
            <p className="mt-2 opacity-80">
              I'm looking for remote full stack or AI engineer roles (junior or mid level). I'm based in Pakistan (PKT,
              UTC+5) and can start now.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-5 inline-block break-all font-mono text-lg underline decoration-accent decoration-2 underline-offset-4"
            >
              {site.email}
            </a>
            <div className="mt-5 flex flex-wrap gap-4 text-sm opacity-80">
              <a href={site.github} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub
              </a>
              {site.linkedin && (
                <a href={site.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                  LinkedIn
                </a>
              )}
              <a href={site.resume} target="_blank" rel="noreferrer" className="hover:underline">
                Resume (PDF)
              </a>
            </div>
          </div>
        </Section>

        {/* One fun detail, at the very bottom so it never gets in the way */}
        <section data-reveal className="pb-6">
          <StatusBox />
        </section>
      </main>
      <Footer />
    </>
  );
}
