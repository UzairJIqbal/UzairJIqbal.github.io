import Link from "next/link";
import { ViewTransition } from "react";
import { site, type Project } from "@/data/portfolio";
import { Words } from "./words";

export const slug = site.name.toLowerCase().replace(/\s+/g, "-");

export const contactLinks = [
  { label: "Email", href: `mailto:${site.email}` },
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "Resume", href: site.resume },
].filter((l) => l.href);

const external = (href: string) => (href.startsWith("http") || href.endsWith(".pdf") ? { target: "_blank", rel: "noreferrer" } : {});

// Going deeper (home → case study) slides left; coming back slides right.
// Untyped navigations (browser back, refresh) swap with no slide.
const FORWARD = ["nav-forward"];
const BACK = ["nav-back"];
const slide = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={slide} exit={slide} default="none">
      <div className="hm">{children}</div>
    </ViewTransition>
  );
}

// The same element on both pages morphs between them: a project's name and
// its screenshot travel from the bento tile into the case study.
export function Shared({ name, children }: { name: string; children: React.ReactElement }) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

export function Nav({ away = false }: { away?: boolean }) {
  const types = away ? BACK : undefined;
  return (
    <header className="hm-nav" style={{ viewTransitionName: "hm-nav" }}>
      <div className="hm-nav-inner">
        <Link href="/" className="hm-wordmark" transitionTypes={types}>
          <span aria-hidden="true">~/</span>
          {slug}
          <span className="hm-sr"> — home</span>
        </Link>
        <nav aria-label="Sections">
          <Link href="/#work" transitionTypes={types}>
            Work
          </Link>
          <Link href="/#services" transitionTypes={types}>
            Services
          </Link>
          <Link href="/#build" transitionTypes={types}>
            How I build
          </Link>
          <Link href="/#about" transitionTypes={types}>
            About
          </Link>
          <Link href="/#contact" transitionTypes={types}>
            Contact
          </Link>
        </nav>
      </div>
      <span className="hm-progress" aria-hidden="true" />
    </header>
  );
}

export function BackLink({ label }: { label: string }) {
  return (
    <Link href="/#work" className="hm-back" transitionTypes={BACK}>
      <span aria-hidden="true">←</span> {label}
    </Link>
  );
}

// Numbered section heading: index, large serif title, a rule that draws in.
export function SectionHead({ id, idx, title }: { id: string; idx: string; title: string }) {
  return (
    <div className="hm-head">
      <span className="hm-idx" aria-hidden="true">
        {idx}
      </span>
      <h2 id={id} className="hm-title" data-split>
        <Words text={title} />
      </h2>
      <span className="hm-rule" aria-hidden="true" />
    </div>
  );
}

export function Buttons() {
  return (
    <div className="hm-buttons">
      {contactLinks.map((l, i) => (
        <a
          key={l.label}
          href={l.href}
          className={i === 0 ? "hm-btn hm-btn--primary" : "hm-btn"}
          data-magnetic
          {...external(l.href)}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

export function Live({ status }: { status: Project["status"] }) {
  return (
    <span className={status === "Live" ? "hm-live" : "hm-live hm-live--wip"}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}

export const metaLine = (p: Project) => `${p.role} · ${p.year} · ${p.stack}`;

export function ProjectLinks({ p, study = true }: { p: Project; study?: boolean }) {
  const tryIt = p.live || p.store;
  return (
    <div className="hm-links">
      {tryIt && (
        <a href={tryIt} className="hm-link hm-link--main" target="_blank" rel="noreferrer">
          Try it<span className="hm-sr"> — {p.name}</span> <span aria-hidden="true">↗</span>
        </a>
      )}
      {p.code && (
        <a href={p.code} className="hm-link" target="_blank" rel="noreferrer">
          Code<span className="hm-sr"> — {p.name}</span>
        </a>
      )}
      {study && (
        <Link href={`/projects/${p.slug}`} className="hm-link" transitionTypes={FORWARD}>
          Case study<span className="hm-sr"> — {p.name}</span> <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export { FORWARD };

export function Footer() {
  return (
    <footer className="hm-footer">
      <span className="hm-wordmark">
        <span aria-hidden="true">~/</span>
        {slug}
      </span>
      <p>© 2026 {site.name}</p>
    </footer>
  );
}
