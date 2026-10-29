// All the words on the site live in this one file.
// Change text here, not in the page code.

export const site = {
  name: "Uzair Javaid",
  role: "Full stack & AI engineer",
  url: "https://uzairjiqbal.github.io", // change to your own domain when you buy one
  email: "uzair.j1089@gmail.com",
  github: "https://github.com/UzairJIqbal",
  githubUser: "UzairJIqbal",
  linkedin: "", // paste your LinkedIn URL here and the button shows up
  resume: "/resume.pdf",
  location: "Pattoki, Punjab, Pakistan",

  // Top line, in the guide's format: [Name] — [role] who builds [what] for [whom].
  topLine:
    "Full stack & AI engineer who builds AI apps that answer from real data, not guesses, for developers and small businesses.",
  // Proof line: [college] · [biggest number] · [award or result]
  proof: ["BS CS, COMSATS '27", "5 apps live", "AI chat agent: 70 of 72 test answers right, 0 made-up files"],
  openTo: "Open to remote roles and fixed-price freelance work. Can start now.",
};

export type Status = "Live" | "In progress";

export type Project = {
  name: string;
  status: Status;
  year: string;
  line: string; // what it does, who it's for, one number
  tools: string[]; // 3 or 4 only
  live?: string;
  code?: string;
  demo?: string; // 1-minute screen recording (YouTube/Loom). Empty = button hidden.
  page?: string; // full project page
};

// Best project first, the one closest to the job second.
export const projects: Project[] = [
  {
    name: "Flowlens",
    status: "Live",
    year: "2026",
    line: "Turns any public TypeScript repo into a map of how its files connect, with an AI chat that answers only from that map. 70 of 72 test answers fully right, 0 made-up files.",
    tools: ["Next.js", "ts-morph", "Supabase", "LangSmith"],
    live: "https://flowlens-rouge.vercel.app",
    code: "https://github.com/UzairJIqbal/flowlens",
    demo: "",
    page: "/projects/flowlens",
  },
  {
    name: "VerifAI",
    status: "Live",
    year: "2026",
    line: "A customer-support AI agent plus the test system that grades it: fake customers, an AI judge, a made-up-facts checker and a release gate. Final pass rate 89.7%.",
    tools: ["TypeScript", "AI SDK", "Groq", "SQLite"],
    live: "https://verifai-phi-one.vercel.app",
    code: "https://github.com/UzairJIqbal/verifai",
    demo: "",
  },
  {
    name: "NeuraMeet",
    status: "Live",
    year: "2026",
    line: "Video meetings with AI transcripts and meeting notes, plus safe guest access. Long meetings are split into chunks to fit free AI limits. 200+ tests.",
    tools: ["Next.js", "Stream", "Clerk", "Gemini"],
    live: "https://neurameet.vercel.app",
    code: "https://github.com/UzairJIqbal/Neurameet",
    demo: "",
  },
  {
    name: "Kunji",
    status: "Live",
    year: "2026",
    line: "A store for buying digital subscriptions in Pakistani rupees. Logins are delivered into an encrypted vault that only one checked database function can write to.",
    tools: ["Next.js", "Supabase", "Clerk", "Web Push"],
    live: "https://kunji-two.vercel.app",
    code: "https://github.com/UzairJIqbal/kunji",
    demo: "",
  },
];

// Proof: wins with a number on each one.
export const proofs: { number: string; text: string }[] = [
  {
    number: "70 / 72",
    text: "Flowlens chat answers fully right on the immer codebase, with 0 made-up file names (scored in LangSmith).",
  },
  {
    number: "89.7%",
    text: "VerifAI agent pass rate on the final baseline. Its release gate measures run-to-run noise (4.9 points) and caught a deliberately broken agent.",
  },
  { number: "200+", text: "Vitest tests on NeuraMeet, shipped as 9 pull requests reviewed with CodeRabbit." },
  { number: "17", text: "Spec-driven phases to build Flowlens, each one checked by hand before the next." },
  { number: "5", text: "Apps live on Vercel today: Flowlens, VerifAI, NeuraMeet, Kunji and JobPilot." },
];

// Skills in groups. Just the names, no bars.
export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["TypeScript", "JavaScript", "SQL", "HTML", "CSS"] },
  { group: "Frontend", items: ["Next.js", "React", "Tailwind CSS", "shadcn/ui", "React Flow"] },
  { group: "Backend", items: ["Node.js", "Express", "PostgreSQL", "Supabase", "MongoDB", "Redis", "Clerk"] },
  { group: "AI", items: ["Tool-calling agents", "MCP servers", "LLM evals", "LangSmith", "Gemini", "Groq"] },
  { group: "Tools", items: ["Git", "GitHub Actions", "Vercel", "Vitest", "pnpm", "Claude Code", "CodeRabbit"] },
];

// About: 4 to 6 short lines.
export const about: string[] = [
  "I'm Uzair, from Pattoki in Punjab, Pakistan.",
  "I study Computer Science at COMSATS University, Sahiwal, and finish in 2027.",
  "Before I code, I write the plan: a spec for each phase with a check at the end. Then I build it with AI coding tools and test every step myself.",
  "I build everything on free tiers, so I've learned caching, rate limits and backup AI providers the hard way.",
  "Kunji started as my own small business idea: selling subscriptions in Pakistan with local payment methods.",
];

// The live apps the status box at the bottom checks.
export const statusApps = [
  { name: "Flowlens", url: "https://flowlens-rouge.vercel.app" },
  { name: "VerifAI", url: "https://verifai-phi-one.vercel.app" },
  { name: "NeuraMeet", url: "https://neurameet.vercel.app" },
  { name: "Kunji", url: "https://kunji-two.vercel.app" },
  { name: "JobPilot", url: "https://jobpilot-psi-nine.vercel.app" },
];
