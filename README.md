# Uzair Javaid — portfolio

Live at https://uzairjiqbal.github.io

A scroll-driven portfolio: one long world that a camera pans across as you scroll, built with Next.js 16, React 19, Tailwind CSS v4 and GSAP (ScrollTrigger + MotionPath). Warm paper theme with Fraunces, Geist and Geist Mono.

## Edit content

All text, links and project data live in `src/data/portfolio.ts`. Images, the resume and the favicon are in `public/portfolio/`.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # lint + type check + static build to ./out
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static export and publishes it to GitHub Pages.
