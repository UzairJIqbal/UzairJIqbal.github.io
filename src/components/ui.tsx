import type { Project } from "@/data/site";
import { Tilt } from "./Tilt";

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line py-14">
      <div className="mb-6 flex items-center gap-4">
        <h2 data-chars className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {title}
        </h2>
        <span data-line aria-hidden className="h-px flex-1 origin-left bg-line" />
      </div>
      {children}
    </section>
  );
}

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  external?: boolean;
};

export function Button({ href, children, primary, external }: ButtonProps) {
  return (
    <a
      href={href}
      data-magnetic
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-[opacity,border-color,box-shadow] duration-300 ${
        primary
          ? "bg-accent text-accent-text shadow-[0_10px_30px_-12px_var(--accent)] hover:opacity-90"
          : "border border-line bg-surface text-text hover:border-muted"
      }`}
    >
      {children}
    </a>
  );
}

function SmallLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="rounded-md bg-text px-2.5 py-1 text-xs font-medium text-bg transition hover:opacity-80"
    >
      {children}
    </a>
  );
}

export function ProjectCard({ p, i }: { p: Project; i: number }) {
  return (
    <div data-card3d className="h-full">
      <Tilt className="h-full rounded-2xl" max={9}>
        <article
          data-cursor="View"
          className="flex h-full flex-col rounded-2xl border border-line bg-surface p-3 transition-[border-color,box-shadow] duration-300 [transform-style:preserve-3d]"
        >
          {/* A moving, cursor-lit panel with the project name in outline type, floating above the card. */}
          <div
            aria-hidden
            className="card-media mb-4 flex h-36 items-end rounded-xl px-4 pb-3 [transform-style:preserve-3d]"
            style={{ "--delay": `${i * -3.5}s` } as React.CSSProperties}
          >
            <span data-depth="2" className="card-media-word">
              {p.name}
            </span>
            <span data-depth className="absolute right-4 top-3 font-mono text-xs text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-1 flex-col px-2 pb-2">
            <div data-depth className="mb-2 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  p.status === "Live" ? "bg-accent-soft text-accent" : "border border-line text-muted"
                }`}
              >
                {p.status} · {p.year}
              </span>
            </div>
            <p className="mb-4 text-[15px] leading-relaxed text-muted">{p.line}</p>
            <ul className="mb-4 flex flex-wrap gap-1.5">
              {p.tools.map((t) => (
                <li key={t} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">
                  {t}
                </li>
              ))}
            </ul>
            <div data-depth className="mt-auto flex flex-wrap gap-2">
              {p.live && <SmallLink href={p.live}>↗ Live</SmallLink>}
              {p.code && <SmallLink href={p.code}>⌘ Code</SmallLink>}
              {p.demo && <SmallLink href={p.demo}>▶ 60s demo</SmallLink>}
              {p.page && <SmallLink href={p.page}>Read how I built it →</SmallLink>}
            </div>
          </div>
        </article>
      </Tilt>
    </div>
  );
}
