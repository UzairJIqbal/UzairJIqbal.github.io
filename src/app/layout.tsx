import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { site } from "@/data/portfolio";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
