import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { projects, site } from "@/data/portfolio";
import "./globals.css";

// Editorial developer pairing: Fraunces for display headings, Geist for
// body, Geist Mono for labels, tags, figure numbers and the wordmark.
const sans = Geist({ variable: "--dev-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--dev-mono", subsets: ["latin"] });
const serif = Fraunces({ variable: "--dev-serif", subsets: ["latin"], axes: ["opsz", "SOFT"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.role}`,
  description: site.topLine,
  icons: { icon: "/portfolio/favicon.svg" },
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.topLine,
    url: site.url,
    images: [{ url: "/portfolio/og.png" }],
  },
  twitter: { card: "summary_large_image", images: ["/portfolio/og.png"] },
};

// Structured data for search engines and AI tools: who Uzair is, the site,
// and one short entry per project. Every value comes from portfolio.ts.
const person = `${site.url}/#person`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": person,
      name: site.name,
      jobTitle: site.role,
      description: site.topLine,
      url: site.url,
      sameAs: [site.github],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      author: { "@id": person },
    },
    ...projects.map((p) => ({
      "@type": "CreativeWork",
      name: p.name,
      url: `${site.url}/projects/${p.slug}/`,
      description: p.line,
      creator: { "@id": person },
    })),
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
