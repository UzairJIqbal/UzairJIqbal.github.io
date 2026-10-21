"use client";

import { useEffect, useState } from "react";
import { statusApps } from "@/data/site";

type Result = { state: "checking" } | { state: "up"; ms: number } | { state: "down" };

// The one fun detail: a small live status box for my deployed apps.
// It pings each app from your browser and shows how fast it answered.
export function StatusBox() {
  const [results, setResults] = useState<Result[]>(statusApps.map(() => ({ state: "checking" })));
  const [checkedAt, setCheckedAt] = useState<string>("");

  async function check() {
    setResults(statusApps.map(() => ({ state: "checking" })));
    const next = await Promise.all(
      statusApps.map(async (app): Promise<Result> => {
        const start = performance.now();
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 8000);
          // no-cors: we can't read the page, but a finished request means the server answered.
          await fetch(app.url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
          clearTimeout(timer);
          return { state: "up", ms: Math.round(performance.now() - start) };
        } catch {
          return { state: "down" };
        }
      }),
    );
    setResults(next);
    setCheckedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }

  useEffect(() => {
    check();
  }, []);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 font-mono text-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-widest text-muted">$ status --my-apps</p>
        <button
          type="button"
          onClick={check}
          className="rounded-md border border-line px-2 py-1 text-xs text-muted transition hover:text-text"
        >
          check again
        </button>
      </div>
      <ul className="space-y-2">
        {statusApps.map((app, i) => {
          const r = results[i];
          return (
            <li key={app.name} className="flex items-center justify-between gap-3">
              <a href={app.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                <span
                  className={`h-2 w-2 rounded-full ${
                    r.state === "up" ? "bg-accent" : r.state === "down" ? "bg-red-500" : "animate-pulse bg-muted"
                  }`}
                />
                {app.name}
              </a>
              <span className="text-muted">
                {r.state === "checking" ? "checking…" : r.state === "up" ? `up · ${r.ms} ms` : "no answer"}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Checked live from your browser{checkedAt ? ` at ${checkedAt}` : ""}. Free-tier apps can be slow on the first hit.
      </p>
    </div>
  );
}
