"use client";

import { useEffect } from "react";

// Starts the motion engine once the page has loaded and the browser is idle.
// Until then the page is plain, fully readable HTML; GSAP and Lenis never
// compete with the first paint.
export function MotionLayer() {
  useEffect(() => {
    let dead = false;
    let stop: (() => void) | undefined;
    let idleId = 0;

    const start = () => {
      import("./engine")
        .then(({ startMotion }) => {
          const root = document.querySelector<HTMLElement>(".hm");
          if (dead || !root) return;
          stop = startMotion(root);
        })
        .catch(() => {});
    };
    const onLoad = () => {
      const ric = window.requestIdleCallback;
      idleId = ric ? ric(start, { timeout: 1500 }) : window.setTimeout(start, 300);
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      dead = true;
      window.removeEventListener("load", onLoad);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      window.clearTimeout(idleId);
      stop?.();
    };
  }, []);

  return null;
}
