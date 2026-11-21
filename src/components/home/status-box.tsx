"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { statusApps } from "@/data/portfolio";

type Result = { state: "idle" | "checking" | "up" | "down"; ms?: number };

const TIMEOUT = 8000;

// A no-cors request never exposes the status code, but it only resolves when
// the server answered, so "reachable" is the honest word.
async function ping(url: string): Promise<Result> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  const t0 = performance.now();
  try {
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
    return { state: "up", ms: Math.round(performance.now() - t0) };
  } catch {
    return { state: "down" };
  } finally {
    clearTimeout(timer);
  }
}

export function StatusBox() {
  const [results, setResults] = useState<Result[]>(() => statusApps.map(() => ({ state: "idle" })));
  const box = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const run = useCallback(() => {
    setResults(statusApps.map(() => ({ state: "checking" })));
    statusApps.forEach((app, i) => {
      ping(app.url).then((r) => setResults((prev) => prev.map((x, j) => (j === i ? r : x))));
    });
  }, []);

  // Check once, the first time the box scrolls into view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [run]);

  const checking = results.some((r) => r.state === "checking");
  const up = results.filter((r) => r.state === "up").length;

  return (
    <div className="hm-term" id="status" ref={box}>
      <div className="hm-term-bar">
        <span />
        <span />
        <span />
        <p>~/{statusApps.length}-apps</p>
      </div>
      <div className="hm-term-body">
        <p className="hm-term-cmd">
          <b>$</b> status --my-apps
        </p>
        <ul>
          {statusApps.map((app, i) => {
            const r = results[i];
            return (
              <li key={app.name} data-state={r.state}>
                <i aria-hidden="true" />
                <a href={app.url} target="_blank" rel="noreferrer">
                  {app.name}
                </a>
                <span className="hm-term-host">{new URL(app.url).host}</span>
                <span className="hm-term-state">
                  {r.state === "idle" && "—"}
                  {r.state === "checking" && "checking…"}
                  {r.state === "up" && `reachable · ${r.ms} ms`}
                  {r.state === "down" && "no answer"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="hm-term-foot" role="status" aria-live="polite">
          {checking ? "checking…" : up > 0 ? `${up} of ${statusApps.length} apps reachable from your browser` : "scroll here to check, or run it again"}
          <button type="button" onClick={run} disabled={checking}>
            run again
          </button>
        </p>
      </div>
    </div>
  );
}
