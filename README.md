# Uzair Javaid — portfolio

One-page developer portfolio built with Next.js + Tailwind, following "The Portfolio Playbook" (simple one-page style, Rinkit's order).

All text lives in `src/data/site.ts`. Change words there, not in the page code.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # check it builds before you push
```

## Pages

- `/` — Top, Projects, Proof, Skills, About, Contact, and a live status box at the bottom
- `/projects/flowlens` — full project page (problem, my part, what I built, hard part, results, what's next)

## 3D and animation

- `src/components/HeroScene.tsx` — the 3D node graph in the hero (React Three Fiber). Loads after the page, pauses off screen, stays still with reduced motion.
- `src/components/PageMotion.tsx` — all scroll animation (GSAP + ScrollTrigger). Add a data attribute in the page code to animate something: `data-reveal`, `data-stagger`, `data-count`, `data-line`, `data-wipe`, `data-hero-item`.
- `src/components/Tilt.tsx` — 3D tilt on hover, used for project cards and the photo.
