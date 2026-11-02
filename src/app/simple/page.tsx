import type { Metadata } from "next";
import { Simple } from "@/components/sites/espn-f1/simple";
import { site } from "@/data/portfolio";

export const metadata: Metadata = {
  title: `${site.name} — ${site.role} (plain view)`,
};

export default function SimplePage() {
  return <Simple />;
}
