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
  resume: "/portfolio/resume.pdf",
  location: "Pattoki, Punjab, Pakistan",

  // Top line, in the guide's format: [Name] — [role] who builds [what] for [whom].
  topLine:
    "Full stack & AI engineer who builds AI apps that answer from real data, not guesses, for developers and small businesses.",
  // Proof line: [college] · [biggest number] · [award or result]
  proof: ["BS CS, COMSATS '27", "5 apps live", "AI chat agent: 70 of 72 test answers right, 0 made-up files"],
  openTo: "Open to remote roles and fixed-price freelance work. Can start now.",
  // One philosophy line under the name in the hero.
  philosophy: "I build AI apps that answer from real data, not guesses, and I prove it with tests.",
};

// The 3D portrait on the right of the hero. Each chip repeats a fact already
// stated in this file (site.proof and the Flowlens proof).
export const heroPortrait = {
  alt: "Uzair Javaid in a black suit, smiling",
  chips: ["5 apps live", "Flowlens: 70 / 72 right", "BS CS, COMSATS '27"],
};

// Section headings on the home page, in page order.
export const sectionTitles = {
  work: "Shipped work",
  build: "How I build",
  skills: "Skills",
  about: "About",
  contact: "Let's work together",
  status: "Live status of my apps",
  back: "All projects",
};

// "How I build": two lines, then the 17-phases stat (taken from `proofs`).
export const howIBuild: string[] = [
  "I write a spec for every phase with a check at the end, then build with AI coding tools and test every step myself.",
  "Everything runs on free tiers, so I learned caching, rate limits and backup AI providers the hard way.",
];

export type Status = "Live" | "In progress";

// Case study page, same five headings for every project:
// Problem · What I built · How it works · Result · What I'd do next.
export type CaseStudy = {
  built: string;
  how: { caption: string; steps: string[] }; // the diagram: steps left to right
  result: string[];
  next: string;
};

export type Project = {
  name: string;
  slug: string; // case study lives at /projects/<slug>
  status: Status;
  year: string;
  role: string; // never a company or job title: these are solo builds
  stack: string; // main stack, shown in the tile's meta line
  tile: "feature" | "wide" | "normal"; // bento size: 2x2, 2x1, 1x1
  problem: string; // one line
  proof: { value: string; label: string }; // the one big number on the tile
  study: CaseStudy;
  line: string; // what it does, who it's for, one number
  tools: string[]; // 3 or 4 only
  live?: string;
  store?: string; // browser extension store listing
  code?: string;
  demo?: string; // 1-minute screen recording (YouTube/Loom). Empty = button hidden.
  image?: string; // screenshot of the live app, in public/portfolio/projects/
};

// Order is the bento grid order: biggest tile first, then the wide one.
export const projects: Project[] = [
  {
    name: "Flowlens",
    slug: "flowlens",
    role: "Solo build",
    stack: "Next.js, ts-morph",
    tile: "feature",
    problem: "Developers can't see how files in a big TypeScript repo connect.",
    proof: { value: "70/72", label: "AI answers fully right, 0 made-up files" },
    study: {
      built:
        "A web app that reads a public TypeScript or JavaScript repo and draws what imports what. Every line on the map is an import that resolved to a real file. Select a file to see what it uses and what uses it, then ask a chat that can only look facts up in that map.",
      how: {
        caption:
          "The model only explains what the parser found, and every file path in an answer is checked against the map.",
        steps: ["GitHub archive", "Parser (TypeScript compiler)", "Framework adapters", "Postgres with row-level security", "Map, lookups and AI chat"],
      },
      result: [
        "70 of 72 test answers fully right on the immer codebase, with 0 made-up file names (scored in LangSmith).",
        "The other 2 hit the 8-round cap and were not scored. After a fix, the same question took 2 rounds each time.",
        "17 spec-driven phases to build it, each one checked by hand before the next.",
      ],
      next: "Run the same answer check on bulletproof-react. It hasn't been run yet because Gemini's free daily quota ran out. Only one repository is measured in full today.",
    },
    image: "/portfolio/projects/flowlens.webp",
    status: "Live",
    year: "2026",
    line: "Turns any public TypeScript repo into a map of how its files connect, with an AI chat that answers only from that map. 70 of 72 test answers fully right, 0 made-up files.",
    tools: ["Next.js", "ts-morph", "Supabase", "LangSmith"],
    live: "https://flowlens-rouge.vercel.app",
    code: "https://github.com/UzairJIqbal/flowlens",
    demo: "",
  },
  {
    name: "VerifAI",
    slug: "verifai",
    role: "Solo build",
    stack: "TypeScript, AI SDK",
    tile: "wide",
    problem: "Support bots make things up and nobody measures it.",
    proof: { value: "89.7%", label: "pass rate, release gate catches broken agents" },
    study: {
      built:
        "A customer-support agent for a made-up shop that sells device accessories, plus the system that grades it: 81 test tasks, code graders, a made-up-facts checker, an AI judge and a release gate. The agent is deliberately plain. The grading system is the project.",
      how: {
        caption: "Every task runs on a fresh copy of the shop. Code grades first, and the AI judge only grades what code can't see.",
        steps: ["81 test tasks", "Agent and tools on a fresh shop copy", "Code graders", "Made-up-facts checks and AI judge", "Release gate on a locked holdout"],
      },
      result: [
        "89.7% of dev tries pass (56 tasks, 4 tries each) and 81.0% of holdout tries (25 tasks, 4 tries each).",
        "Running the same setup twice shows 4.9 points of run-to-run noise, so smaller changes are not counted as improvements.",
        "The gate failed a deliberately broken agent, as it should.",
      ],
      next: "Raise the rubric judge's agreement with hand labels (kappa 0.21, the bar is 0.6), and run the improvement loop and online-traffic simulation that are built but not yet run.",
    },
    image: "/portfolio/projects/verifai.webp",
    status: "Live",
    year: "2026",
    line: "A customer-support AI agent plus the test system that grades it: fake customers, an AI judge, a made-up-facts checker and a release gate. Final pass rate 89.7%.",
    tools: ["TypeScript", "AI SDK", "Groq", "SQLite"],
    live: "https://verifai-phi-one.vercel.app",
    code: "https://github.com/UzairJIqbal/verifai",
    demo: "",
  },
  {
    name: "SoonerSlot",
    slug: "soonerslot",
    role: "Solo build",
    stack: "Manifest V3",
    tile: "normal",
    problem: "Earlier Global Entry interview slots disappear in minutes.",
    proof: { value: "60 s", label: "Checks every center once a minute, no servers" },
    study: {
      built:
        "A free browser extension. Enter your ZIP code and a radius, or pick centers. Every minute it checks the official scheduler, filters by your dates, days and times, and alerts you only to openings earlier than your current interview. Unofficial: you book it yourself.",
      how: {
        caption: "Everything runs in the browser. Settings stay on your machine, and only new openings trigger an alert.",
        steps: ["Alarm every 60 s", "One request: which centers have openings", "Keep centers in your radius", "Fetch slots for up to 10 of them", "Filter by your dates and times", "Notification, chime and badge"],
      },
      result: [
        "Checks every center in your radius once a minute.",
        "No servers, accounts or tracking.",
        "Covers Global Entry, NEXUS, SENTRI and both FAST programs.",
        "Live on the Microsoft Edge Add-ons store.",
      ],
      next: "Mobile alerts through free push services (ntfy, Telegram, Discord), and a Chrome Web Store listing, which is coming soon.",
    },
    image: "/portfolio/projects/soonerslot.webp",
    status: "Live",
    year: "2026",
    line: "A browser extension that alerts you the minute an earlier Global Entry, NEXUS, SENTRI or FAST interview opens near you. Checks every center in your radius once a minute, with no servers, accounts or tracking. Unofficial; you book it yourself.",
    tools: ["JavaScript", "Manifest V3", "Chrome APIs"],
    store: "https://microsoftedge.microsoft.com/addons/detail/jjljahhpphkoeggpmihfokhcldhpblon",
    code: "https://github.com/UzairJIqbal/soonerslot",
    demo: "",
  },
  {
    name: "NeuraMeet",
    slug: "neurameet",
    role: "Solo build",
    stack: "Next.js, Stream",
    tile: "normal",
    problem: "Long meetings break free AI transcript limits.",
    proof: { value: "200+", label: "tests, 9 reviewed PRs" },
    study: {
      built:
        "Real-time video meetings that turn into a summary, action items, a category and a chat that answers from that meeting's transcript. Guests can join from a lobby, with optional owner approval.",
      how: {
        caption: "Long transcripts are split into chunks so every call fits free AI limits.",
        steps: ["Meeting on Stream Video", "Transcript: upload or Groq Whisper", "Split into chunks", "Gemini summary and action items, Groq as backup", "Chunks in Supabase pgvector for chat and search"],
      },
      result: [
        "200+ Vitest tests.",
        "Shipped as 9 pull requests reviewed with CodeRabbit.",
        "Every external service runs on its free tier.",
      ],
      next: "Make the AI fallback less fragile. It depends on one hard-coded Groq model id, and a retired id once broke every fallback. Probing a list of candidate models would fix that.",
    },
    image: "/portfolio/projects/neurameet.webp",
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
    slug: "kunji",
    role: "Solo build",
    stack: "Next.js, Supabase",
    tile: "normal",
    problem: "Pakistanis can't easily buy subscriptions in rupees.",
    proof: { value: "1", label: "checked DB function can write to the encrypted vault" },
    study: {
      built:
        "A store for digital subscriptions priced in Pakistani rupees. Customers pay from a mobile wallet or by bank transfer, the seller checks the payment, and the login lands in the customer's own encrypted vault.",
      how: {
        caption: "An order is never marked paid until the seller approves it, and every status change goes through the database.",
        steps: ["Customer picks a plan and uploads a receipt", "Order shows verifying, never paid", "Seller approves in the verification queue", "One database function moves the order forward", "Login encrypted into the customer's vault"],
      },
      result: [
        "Order statuses change only through checked database functions, and every change is recorded.",
        "Logins are encrypted (AES-256-GCM) before they reach the database.",
        "5 ways to pay: Easypaisa, JazzCash, NayaPay, SadaPay or bank transfer.",
      ],
      next: "Move off Vercel Hobby, which is for non-commercial use, to Vercel Pro or a host that allows commercial use before the first real customer pays. The code has no Vercel-only dependency, so it is configuration, not a rewrite.",
    },
    image: "/portfolio/projects/kunji.webp",
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

// "What I can build for you": cold-email landing cards. Each `id` is a deep link (/#id), so don't rename them.
// Proof links to a project go to its case study page. Samples are design samples, never client results.
export type ServiceProof = { name: string; note?: string; href: string };
export type Service = {
  id: string;
  title: string; // the niche, also used in the email subject
  problem: string;
  detail?: string; // extra line under the problem
  proof: ServiceProof[];
};

export const servicesSection = {
  title: "What I can build for you",
  cta: "Get a free custom sample",
  subjectPrefix: "Sample for ",
};

export const services: Service[] = [
  {
    id: "3d-websites",
    title: "3D & animated websites",
    problem: "Your site looks dated next to competitors and doesn't hold attention.",
    proof: [
      {
        name: "This portfolio",
        note: "3D tilt portrait, GSAP scroll motion, Lenis smooth scrolling and page transitions",
        href: "https://github.com/UzairJIqbal/UzairJIqbal.github.io",
      },
      { name: "Design sample", href: "https://summit-roofing-cardiff.vercel.app" },
      { name: "Clinic site sample", href: "https://quietnite-victoria.vercel.app" },
    ],
  },
  {
    id: "chrome-extensions",
    title: "Chrome extensions",
    problem: "You need a browser tool built, or your extension broke after a site or Manifest V3 change.",
    proof: [
      {
        name: "YouTube Study Bookmarks",
        note: "Live on Microsoft Edge Add-ons. React 19, strict TypeScript, Manifest V3, Playwright tests",
        href: "https://microsoftedge.microsoft.com/addons/detail/youtube-study-bookmarks/ciobpmgaabihaoabjjiifhigfbnggmob",
      },
      { name: "SoonerSlot", note: "Live Manifest V3 extension that talks to a real scheduler API", href: "/projects/soonerslot/" },
    ],
  },
  {
    id: "system-design",
    title: "System design & scaling",
    problem: "Your app slows down, times out or breaks as more people use it.",
    detail: "Everything I run is on free tiers, so I design for caching, rate limits and fallback providers.",
    proof: [
      { name: "Flowlens", note: "Dependency map built by the TypeScript compiler, MCP server, Supabase RLS", href: "/projects/flowlens/" },
      {
        name: "Kunji",
        note: "Order statuses enforced in the database, only one checked DB function can write to the vault",
        href: "/projects/kunji/",
      },
    ],
  },
  {
    id: "fix-ai-built-apps",
    title: "Fixing AI-built apps",
    problem: "Your Lovable, Bolt, Replit or Cursor app works in the demo but breaks with real users.",
    detail: "What I check: Supabase RLS rules, exposed API keys, broken routes and forms, failed payments, slow pages.",
    proof: [
      { name: "Kunji", note: "Next.js + Supabase with RLS, the app never holds the service key", href: "/projects/kunji/" },
      { name: "Flowlens", note: "Supabase RLS", href: "/projects/flowlens/" },
    ],
  },
  {
    id: "ai-agents",
    title: "AI agents & calling agents",
    problem: "Calls, bookings and questions go unanswered after hours.",
    proof: [
      { name: "VerifAI", note: "Support agent with 7 tools, 89.7% pass rate, release gate", href: "/projects/verifai/" },
      { name: "NeuraMeet", note: "Whisper transcripts in English and Urdu, RAG chat", href: "/projects/neurameet/" },
    ],
  },
  {
    id: "website-fixes",
    title: "Website fixes",
    problem: "Broken buttons, template text, dead links or a site that's hard to use on a phone.",
    detail: "I check your live site and send a short list of what to fix first.",
    proof: [{ name: "Design sample", href: "https://summit-roofing-cardiff.vercel.app" }],
  },
];
