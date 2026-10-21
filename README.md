<div align="center">

# Uzair Javaid — Portfolio

**Full stack & AI engineer who builds AI apps that answer from real data, not guesses.**

[**Live site →**](https://uzairjiqbal.github.io) &nbsp;·&nbsp; [Resume](https://uzairjiqbal.github.io/resume.pdf) &nbsp;·&nbsp; [Email](mailto:uzair.j1089@gmail.com)

[![Deploy to GitHub Pages](https://github.com/UzairJIqbal/UzairJIqbal.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/UzairJIqbal/UzairJIqbal.github.io/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000?logo=threedotjs)
![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger%20%C2%B7%20SplitText-0ae448?logo=greensock)
![Lenis](https://img.shields.io/badge/Lenis-smooth%20scroll-111)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

<img src="public/og.png" alt="Portfolio preview" width="760" />

</div>

---

## Overview

A fast developer portfolio with a cinematic intro, a WebGL hero and scroll-driven 3D motion, exported as static HTML and deployed to GitHub Pages on every push. The motion language borrows from award-winning studio sites (Lusion, Active Theory, Klausen) and editorial features: a counting loader, kinetic type, a velocity-driven marquee, cards that swing up out of 3D space, and curtain transitions between pages.

It is built around one rule: **the motion supports the content and never blocks it.** The 3D scene loads after the page, pauses when it is off screen, and every animation is switched off for visitors who prefer reduced motion.

## Features

| Area | What it does |
| --- | --- |
| **Intro loader** | The name flips in letter by letter, a 000→100 counter and progress bar track real font and page loading, then a two-layer curtain lifts away. Shown once per visit. |
| **Page transitions** | Leaving for another page drops the curtain; the next page lifts it. Back/forward cache is handled. |
| **3D hero** | A turning graph of connected nodes, with light pulses walking the edges, inside a cloud of 1,600 GLSL shader particles that orbit, breathe and scatter as you scroll. Scrolling also dollies the camera in. It follows the pointer and the light/dark theme. |
| **Kinetic type** | The hero name rises in 3D character by character (GSAP SplitText); headings and paragraphs rise line by line out of masks. |
| **Marquee band** | Full-width oversized type that drifts forever. Scroll speed pushes it, skews it and turns it around. |
| **3D project cards** | Cards swing up out of 3D space as they scroll in, then tilt toward the cursor with layered depth and a cursor-lit animated panel. |
| **Smooth scroll & cursor** | Lenis inertial scrolling synced to ScrollTrigger, a custom cursor that labels cards with "View", and magnetic buttons. |
| **Scroll animation** | Staggered reveals, count-up statistics, self-drawing section rules, a wipe-in GitHub chart, a reading-progress bar and active-section nav highlighting. All of it runs on GSAP and ScrollTrigger. |
| **3D tilt cards** | Project cards and the profile photo tilt toward the cursor, with layered depth and a cursor-following highlight. |
| **Live status box** | Pings each deployed app from the visitor's browser and shows response time. |
| **Dark mode** | Theme toggle with no flash on load; the 3D scene recolours live. |
| **Content in one file** | Every word on the site lives in [`src/data/site.ts`](src/data/site.ts). |

## Tech stack

- **Framework:** Next.js 15 (App Router, static export), React 19, TypeScript
- **3D:** Three.js via React Three Fiber, using instanced meshes for the nodes and pulses
- **3D shaders:** custom GLSL vertex/fragment shaders for the particle cloud
- **Animation:** GSAP 3 + ScrollTrigger + SplitText (`@gsap/react` `useGSAP` for cleanup), Lenis for smooth scrolling
- **Styling:** Tailwind CSS 4 with CSS-variable design tokens
- **CI/CD:** GitHub Actions, then GitHub Pages

## Performance & accessibility

- **Small first load (~114 kB JS).** Three.js is split into its own chunk and loaded only in the browser, after the page is interactive.
- **No wasted frames.** The WebGL loop stops when the hero leaves the viewport, and nodes and pulses render as a few instanced draw calls.
- **Cheap animation.** Only `transform`, `opacity` and `clip-path` are animated, so the browser doesn't recompute layout mid-animation.
- **Reduced motion respected everywhere.** With `prefers-reduced-motion`, there is no loader, curtain, smooth scroll or custom cursor, the 3D scene renders one still frame, and GSAP reveals, count-ups, tilt and CSS loops are all disabled.
- **Mouse-only extras.** The custom cursor, magnetic buttons and tilt only switch on for a real mouse; touch screens keep native behaviour.
- **Content never hidden by mistake.** The loader and hero are hidden only while their animations run, with safety timeouts (4s, or 8s with the loader), so the page can't stay covered if a script fails.
- **Accessible markup.** Semantic HTML, visible focus rings, and `aria-hidden` on decorative layers.

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Fonts, metadata, theme script, global motion
│   ├── page.tsx                # Home: hero, projects, proof, skills, about, contact
│   ├── globals.css             # Design tokens, tilt / glow / nav styles
│   └── projects/flowlens/      # Full case-study page
├── components/
│   ├── Preloader.tsx           # Intro loader and page curtain transitions
│   ├── SmoothScroll.tsx        # Lenis, synced to GSAP's ticker
│   ├── Cursor.tsx              # Custom cursor and magnetic buttons
│   ├── Marquee.tsx             # Kinetic type band
│   ├── HeroScene.tsx           # React Three Fiber graph + GLSL particle cloud
│   ├── HeroCanvas.tsx          # Client-only lazy loader for the scene
│   ├── PageMotion.tsx          # All GSAP + ScrollTrigger animation
│   ├── Tilt.tsx                # 3D hover tilt wrapper
│   ├── StatusBox.tsx           # Live uptime check for deployed apps
│   ├── Nav.tsx · ThemeToggle.tsx · ui.tsx
└── data/
    └── site.ts                 # All site copy and project data
```

## Animation system

Animation is declarative: add a data attribute in the markup and [`PageMotion.tsx`](src/components/PageMotion.tsx) picks it up.

| Attribute | Effect |
| --- | --- |
| `data-hero-title` | Letters flip up in 3D once the intro curtain lifts |
| `data-hero-item` | Fades up after the title, one item after another |
| `data-split` | Text rises line by line out of a mask |
| `data-chars` | Letters rise one by one |
| `data-card3d` | Swings up out of 3D space as it scrolls in (scrubbed) |
| `data-parallax` | Drifts against the scroll (value = strength) |
| `data-zoom` | Opens from a smaller rounded frame as it scrolls in |
| `data-marquee` | The endless type band, driven by scroll velocity |
| `data-magnetic` | Leans toward the cursor (value = strength) |
| `data-cursor` | Shows a word in the cursor, e.g. `data-cursor="View"` |
| `data-reveal` | Fades up when scrolled into view |
| `data-stagger` | Its children fade up one after another |
| `data-count` | The first number in the text counts up from zero |
| `data-line` | A rule that draws itself from the left |
| `data-wipe` | Revealed left to right with a clip-path |
| `data-progress` | Scroll-linked reading progress bar |

```tsx
<ul data-stagger>
  <li data-count>90.7%</li>
</ul>
```

## Getting started

Requires Node.js 20+.

```bash
git clone https://github.com/UzairJIqbal/UzairJIqbal.github.io.git
cd UzairJIqbal.github.io
npm install
npm run dev        # http://localhost:3000
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build and export static HTML to `out/` |
| `npm run lint` | Run Next.js lint |

To change any text, project, skill or link, edit [`src/data/site.ts`](src/data/site.ts). You don't need to touch the page code.

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Installs dependencies with `npm ci`
2. Type-checks with `tsc --noEmit`
3. Builds the static export (`output: "export"`) to `out/`
4. Publishes `out/` to GitHub Pages

## Contact

**Uzair Javaid**, open to remote full stack and AI engineer roles (PKT, UTC+5).

[uzair.j1089@gmail.com](mailto:uzair.j1089@gmail.com) · [GitHub](https://github.com/UzairJIqbal) · [Portfolio](https://uzairjiqbal.github.io)
