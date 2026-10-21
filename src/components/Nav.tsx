import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/#projects", label: "Projects" },
  { href: "/#proof", label: "Proof" },
  { href: "/#skills", label: "Skills" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image src="/uzair-small.webp" alt="" width={28} height={28} className="rounded-full" priority />
          {site.name}
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
          <ul className="hidden items-center gap-4 text-sm text-muted md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="nav-link hover:text-text">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${site.email}`}
            className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-text sm:hidden"
          >
            Email
          </a>
          <ThemeToggle />
        </div>
      </nav>
      <span data-progress aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-accent" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 pb-10 pt-6 text-xs text-muted sm:px-6">
      <p>
        © {new Date().getFullYear()} {site.name} · Built with Next.js, Three.js and GSAP, hosted on GitHub Pages.
      </p>
    </footer>
  );
}
