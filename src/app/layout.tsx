import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/data/site";
import { PageMotion } from "@/components/PageMotion";
import { Preloader } from "@/components/Preloader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });

const description = `${site.name}: ${site.topLine}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | ${site.role}`,
  description,
  openGraph: {
    title: `${site.name} | ${site.role}`,
    description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.role}`,
    description,
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#111317" },
  ],
};

// Runs before the page paints, so there is no white flash in dark mode.
// "motion" hides the hero until its entrance animation starts. "loading" shows the intro loader
// (first page of a visit) and "curtain" the short curtain lift (every page after). If scripts
// fail, all three are removed after a few seconds so the page can never stay covered.
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark')}catch(e){}if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var s=0;try{s=sessionStorage.getItem('intro-seen')}catch(e){}d.classList.add('motion',s?'curtain':'loading');setTimeout(function(){d.classList.remove('motion','loading','curtain')},s?4000:8000)}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <Preloader />
        {children}
        <PageMotion />
        <SmoothScroll />
        <Cursor />
        {/* Vercel Analytics only works on Vercel; skip it on GitHub Pages. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
