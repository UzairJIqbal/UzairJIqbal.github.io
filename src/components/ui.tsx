import type { Project } from "@/data/site";

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-line py-14">
      <h2 className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">{title}</h2>
      {children}
    </section>
  );
}

type ButtonProps = { href: string; children: React.ReactNode; primary?: boolean; external?: boolean };

export function Button({ href, children, primary, external }: ButtonProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
        primary
          ? "bg-accent text-accent-text hover:opacity-90"
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

export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
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
      <div className="mt-auto flex flex-wrap gap-2">
        {p.live && <SmallLink href={p.live}>↗ Live</SmallLink>}
        {p.code && <SmallLink href={p.code}>⌘ Code</SmallLink>}
        {p.demo && <SmallLink href={p.demo}>▶ 60s demo</SmallLink>}
        {p.page && <SmallLink href={p.page}>Read how I built it →</SmallLink>}
      </div>
    </article>
  );
}
