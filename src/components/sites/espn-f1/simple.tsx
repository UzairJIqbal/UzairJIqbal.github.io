import { about, projects, proofs, site, skills } from "@/data/portfolio";
import "./f1.css";

// The whole portfolio as one plain, scrollable page: no scripts, no camera.
// On the home page it sits on top of the story and stays hidden unless the
// story can't start (scripts off, an old browser, an error); /simple/ shows
// it on its own.
export function Simple({ overlay = false }: { overlay?: boolean }) {
  const contact = [
    { label: "Email", href: `mailto:${site.email}` },
    { label: "GitHub", href: site.github },
    { label: "LinkedIn", href: site.linkedin },
    { label: "Resume", href: site.resume },
  ].filter((l) => l.href);

  return (
    <div className={overlay ? "f1-simple f1-simple-overlay" : "f1-simple"}>
      <div className="f1-simple-inner">
        <p className="f1-simple-label">{site.role}</p>
        <h1>{site.name}</h1>
        <p className="f1-simple-lead">{site.topLine}</p>
        <p>
          <b>{site.openTo}</b>
        </p>
        <p className="f1-simple-links">
          {contact.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </p>

        <h2>Projects</h2>
        {projects.map((p) => {
          const links = [
            { label: "Live app", href: p.live },
            { label: "Store listing", href: p.store },
            { label: "Code", href: p.code },
            { label: "Demo", href: p.demo },
          ].filter((l) => l.href);
          return (
            <section key={p.name} className="f1-simple-project">
              <h3>
                {p.name}{" "}
                <small>
                  {p.status} · {p.year}
                </small>
              </h3>
              <p>{p.line}</p>
              <p className="f1-simple-label">{p.tools.join(" · ")}</p>
              {links.length > 0 && (
                <p className="f1-simple-links">
                  {links.map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </section>
          );
        })}

        <h2>About</h2>
        {about.map((line) => (
          <p key={line}>{line}</p>
        ))}

        <h2>At a glance</h2>
        <ul className="f1-simple-proofs">
          {proofs.map((p) => (
            <li key={p.number}>
              <b>{p.number}</b> {p.text}
            </li>
          ))}
        </ul>

        <h2>Skills</h2>
        {skills.map((s) => (
          <p key={s.group}>
            <b>{s.group}:</b> {s.items.join(", ")}
          </p>
        ))}

        <h2>Contact</h2>
        <p className="f1-simple-links">
          {contact.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </p>
      </div>
    </div>
  );
}
