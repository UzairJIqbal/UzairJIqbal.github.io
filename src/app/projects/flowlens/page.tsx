import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Nav } from "@/components/Nav";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Flowlens: how I built it | Uzair Javaid",
  description:
    "Flowlens turns a TypeScript codebase into a dependency map with an AI chat that answers only from the map. 70 of 72 test answers fully right, 0 made-up files.",
};

function H({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 data-reveal className="mb-3 mt-12 flex items-center gap-3 text-xl font-semibold">
      <span className="grid h-7 w-7 place-items-center rounded-full border border-accent font-mono text-xs text-accent">
        {n}
      </span>
      {children}
    </h2>
  );
}

function Box({ title, sub, accent }: { title: string; sub: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-center ${
        accent ? "border-accent bg-accent-soft" : "border-line bg-surface"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="font-mono text-[11px] text-muted">{sub}</p>
    </div>
  );
}

const Arrow = () => <div className="text-center font-mono text-muted">↓</div>;

export default function FlowlensPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6">
        <Link href="/#projects" className="text-sm text-muted hover:text-text">
          ← All projects
        </Link>
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <h1 data-hero-title className="text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
            Flowlens
          </h1>
          <span data-hero-item className="mb-2 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">Live · 2026</span>
        </div>
        <p data-hero-item className="mt-3 text-lg leading-relaxed text-muted">
          A map of how a codebase's files connect, with an AI chat that can only answer from that map.
        </p>
        <div data-hero-item className="mt-6 flex flex-wrap gap-3">
          <Button href="https://flowlens-rouge.vercel.app" primary external>
            ↗ Try it live
          </Button>
          <Button href="https://github.com/UzairJIqbal/flowlens" external>
            ⌘ Code
          </Button>
        </div>

        <H n={1}>The problem</H>
        <p className="leading-relaxed">
          New developers, and people who build with AI tools, often open a codebase and can't tell which file depends on
          which. AI chat tools make it worse when they confidently name files that don't exist.
        </p>

        <H n={2}>My part</H>
        <p className="leading-relaxed">
          I built it alone, end to end: the parser, the map, the database and security, the AI features, the tests and
          the deploy. I wrote a spec for each of 17 phases, built them with Claude Code, reviewed every pull request
          with CodeRabbit, and checked each phase by hand before starting the next.
        </p>

        <H n={3}>What I built</H>
        <p className="mb-5 leading-relaxed">
          You paste a public GitHub repo. Flowlens downloads it, reads every import with the TypeScript compiler, and
          stores the result as a graph. Everything else reads from that one graph.
        </p>
        <div
          data-reveal
          className="rounded-2xl border border-line bg-bg p-4 sm:p-6"
          role="img"
          aria-label="Flowlens architecture diagram"
        >
          <div data-stagger className="mx-auto max-w-md space-y-2">
            <Box title="Public GitHub repo" sub="pasted by the user" />
            <Arrow />
            <Box title="Parser" sub="ts-morph · aliases, re-exports, monorepos" />
            <Arrow />
            <Box title="Graph in Postgres" sub="Supabase · row-level security per org" accent />
            <Arrow />
          </div>
          <div data-stagger className="mx-auto mt-2 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
            <Box title="Map" sub="React Flow + dagre" />
            <Box title="Chat agent" sub="tool loop · lookups only" />
            <Box title="MCP server" sub="for coding agents" />
          </div>
          <p className="mt-4 text-center font-mono text-[11px] text-muted">
            Clerk orgs for sign-in · Realtime for live progress · LangSmith traces every AI call
          </p>
        </div>
        <ul className="mt-5 list-disc space-y-1.5 pl-5 leading-relaxed">
          <li>
            A line between two files exists only when an import resolves to a real file. Imports that don't resolve are
            counted, with the reason.
          </li>
          <li>It handles path aliases, index files, re-exports, dynamic imports, require() and monorepo packages.</li>
          <li>It can preview a pull request: which links it adds or removes, and what else could break.</li>
          <li>
            Coding agents like Claude Code can read the map through an MCP server, using keys that are hashed and can be
            revoked.
          </li>
        </ul>

        <H n={4}>The hard part</H>
        <p className="leading-relaxed">
          Making the chat answer about the whole codebase without making things up. My first version ran the agent as a
          separate service. I moved it into the Next.js app as a small tool-calling loop I wrote myself. The model can
          only answer through lookup tools over the parsed graph, so it can't invent a file. I added limits so one user
          can't burn the free AI quota: at most 8 rounds per question and a daily cap per organization, counted in
          Postgres.
        </p>

        <H n={5}>Results</H>
        <ul data-stagger className="divide-y divide-line">
          {[
            [
              "70 / 72",
              "test questions on the immer codebase answered fully right (mean F1 1.00), scored in LangSmith.",
            ],
            [
              "0",
              "made-up file names in those answers. An automatic check looks for invented paths on every AI reply.",
            ],
            [
              "17",
              "spec-driven phases, each with an acceptance check, shipped with GitHub Actions CI on Vercel's free tier.",
            ],
          ].map(([n, t]) => (
            <li key={n} className="flex gap-5 py-3">
              <span data-count className="w-20 shrink-0 font-mono font-semibold tabular-nums text-accent">
                {n}
              </span>
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Honest note: the test questions and their answer key come from the same parse, so this proves the chat repeats
          the map faithfully, not that the parser is perfect.
        </p>

        <H n={6}>What I would do next</H>
        <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
          <li>
            Make the chat use the blast-radius lookup for "what breaks if I change this?" instead of direct importers
            only.
          </li>
          <li>Test the parser itself against a hand-checked answer key, so the score covers more than the chat.</li>
          <li>Run the answer test on more repos, like bulletproof-react, and publish the numbers.</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
