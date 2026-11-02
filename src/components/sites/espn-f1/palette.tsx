"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { projects, site, skills } from "@/data/portfolio";
import { lockScroll } from "./motion";

type Item = { group: string; label: string; hint?: string; run: () => void };

// ⌘K / Ctrl+K / "/" opens a command menu: jump to any part of the story,
// copy the email, or open a link. `jump` takes the nth match of a selector
// inside the world (null for the top).
export function Palette({ jump }: { jump: (selector: string | null, index?: number) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  // The toolbar's backdrop-filter would trap fixed children, so the overlay
  // renders into <main> (which still carries the theme tokens).
  const host = useSyncExternalStore(
    () => () => {},
    () => document.getElementById("top"),
    () => null,
  );

  const items = useMemo<Item[]>(() => {
    const go =
      (s: string | null, i = 0) =>
      () =>
        jump(s, i);
    const link = (href: string) => () => window.open(href, "_blank", "noopener");
    const list: Item[] = [
      { group: "Sections", label: "Top", run: go(null) },
      { group: "Sections", label: "About", run: go(".f1-vert1 .f1-tall-title") },
      ...projects.map((p, i) => ({
        group: "Projects",
        label: p.name,
        hint: p.status.toLowerCase(),
        run: go(".f1-hor1-section .f1-name", i),
      })),
      {
        group: "Sections",
        label: "How I build",
        run: go(".f1-vert2 .f1-tall-title"),
      },
      {
        group: "Sections",
        label: "At a glance",
        run: go(".f1-future .f1-tall-title"),
      },
      ...skills.map((s, i) => ({
        group: "Skills",
        label: s.group,
        run: go(".f1-skill-title", i),
      })),
      { group: "Sections", label: "Contact", run: go(".f1-recirc-title") },
      {
        group: "Actions",
        label: "Copy email",
        hint: site.email,
        run: () =>
          navigator.clipboard.writeText(site.email).then(
            () => setToast("Email copied"),
            () => setToast(site.email),
          ),
      },
      {
        group: "Actions",
        label: "Send an email",
        run: () => (window.location.href = `mailto:${site.email}`),
      },
    ];
    if (site.github)
      list.push({
        group: "Actions",
        label: "Open GitHub",
        hint: "↗",
        run: link(site.github),
      });
    if (site.linkedin)
      list.push({
        group: "Actions",
        label: "Open LinkedIn",
        hint: "↗",
        run: link(site.linkedin),
      });
    if (site.resume)
      list.push({
        group: "Actions",
        label: "Open resume",
        hint: "pdf ↗",
        run: link(site.resume),
      });
    return list;
  }, [jump]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const order = ["Sections", "Projects", "Skills", "Actions"];
    const sorted = [...items].sort((x, y) => order.indexOf(x.group) - order.indexOf(y.group));
    return q ? sorted.filter((i) => `${i.group} ${i.label} ${i.hint ?? ""}`.toLowerCase().includes(q)) : sorted;
  }, [items, query]);

  const show = () => {
    opener.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest?.("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    return lockScroll();
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const pick = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + d + shown.length) % Math.max(shown.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(shown[active]);
    }
  };

  return (
    <>
      <button type="button" className="f1-cmd-open" onClick={show} aria-haspopup="dialog">
        <span>Jump to</span>
        <kbd>⌘K</kbd>
      </button>
      {host &&
        createPortal(
          <>
            <p className="f1-cmd-toast" role="status" data-on={toast ? "" : undefined}>
              {toast}
            </p>
            {open && (
              <div className="f1-cmd" onPointerDown={(e) => e.target === e.currentTarget && close()}>
                <div
                  className="f1-cmd-box"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Command menu"
                  onKeyDown={onKeyDown}
                >
                  <div className="f1-cmd-field">
                    <b aria-hidden="true">&gt;</b>
                    <input
                      ref={input}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setActive(0);
                      }}
                      placeholder="Search sections, projects, actions…"
                      role="combobox"
                      aria-expanded="true"
                      aria-controls="f1-cmd-list"
                      aria-activedescendant={shown[active] ? `f1-cmd-${active}` : undefined}
                      spellCheck={false}
                    />
                    <kbd>esc</kbd>
                  </div>
                  <ul id="f1-cmd-list" role="listbox">
                    {shown.length === 0 && <li className="f1-cmd-empty">No matches</li>}
                    {shown.map((item, i) => {
                      const head = item.group !== shown[i - 1]?.group ? item.group : "";
                      return (
                        <li key={`${item.group}-${item.label}`} role="presentation">
                          {head && <p className="f1-cmd-group">{head}</p>}
                          <div
                            id={`f1-cmd-${i}`}
                            role="option"
                            aria-selected={i === active}
                            className="f1-cmd-item"
                            onPointerMove={() => setActive(i)}
                            onClick={() => pick(item)}
                          >
                            <span>{item.label}</span>
                            {item.hint && <small>{item.hint}</small>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </>,
          host,
        )}
    </>
  );
}
