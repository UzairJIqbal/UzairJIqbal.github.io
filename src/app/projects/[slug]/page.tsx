import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/home/case-study";
import { projects, site } from "@/data/portfolio";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.name} case study · ${site.name}`, description: p.problem };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  return <CaseStudy p={p} />;
}
