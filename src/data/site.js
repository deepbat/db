// ─────────────────────────────────────────────────────────────
//  SITE CONTENT — edit this file to update text across the site.
//  Everything here is meant to be personal and honest. If a claim
//  isn't true, don't put it here.
// ─────────────────────────────────────────────────────────────

export const identity = {
  name: "Deepak Batra",
  firstName: "DEEPAK",
  lastName: "BATRA",
  tagline: "Personal space for things I build, explore and find interesting.",
  location: "Jalandhar, India",
  coords: "31.33°N 75.58°E",
  email: "deepak.batra@outlook.com",
  whatsapp: "https://wa.me/919779777570",
  whatsappLabel: "+91 97797 77570",
};

export const about = {
  heading: "Mostly curious.",
  paragraphs: [
    "I work in office administration — documents, records, schedules, the quiet machinery that keeps an office running. I like it orderly. I like knowing where things are.",
    "Outside of that, technology is where my curiosity lives. AI, local LLMs, automation, PowerShell, Google Workspace, GitHub, web experiments — if it's interesting and I can take it apart or build with it, I'm in.",
    "I build things mostly because I enjoy it: a desktop app for scholarship and grant work, small scripts that quietly save real time, websites that exist because I wanted to see if I could make them. Figuring things out is the point.",
  ],
  facts: [
    { k: "BASE", v: "Jalandhar, India" },
    { k: "DAYTIME", v: "Office administration & documentation" },
    { k: "AFTER HOURS", v: "AI · automation · web experiments" },
    { k: "ALSO INTO", v: "Photography · family time" },
  ],
};

export const builds = [
  {
    id: "scholarship",
    index: "01",
    title: "Scholarship & Grant Software",
    blurb:
      "A Windows desktop application that brings scholarship and grant management into one place — records, workflows and reporting that used to live in scattered files.",
    tags: ["DESKTOP", "WINDOWS", "DATA"],
    hue: 190,
  },
  {
    id: "websites",
    index: "02",
    title: "Personal Websites",
    blurb:
      "This site and its ancestors. Ongoing experiments in modern web design, GitHub Pages and interactive graphics — currently deep in WebGL territory.",
    tags: ["WEB", "THREE.JS", "GITHUB PAGES"],
    hue: 265,
  },
  {
    id: "automation",
    index: "03",
    title: "Automation",
    blurb:
      "Small tools and scripts for office workflows — documentation, reporting and the repetitive parts of admin work, handed off to machines.",
    tags: ["POWERSHELL", "GOOGLE WORKSPACE", "SCRIPTS"],
    hue: 35,
  },
  {
    id: "ai",
    index: "04",
    title: "AI Experiments",
    blurb:
      "Local LLMs, AI tools and CLI utilities. Testing what models can actually do on my own machine — without the hype.",
    tags: ["LOCAL LLM", "CLI", "WORKFLOWS"],
    hue: 150,
  },
];

export const lab = {
  heading: "Tech Lab",
  intro: "A loose map of the things I play with.",
  hint: "Click an object to inspect it.",
  items: [
    {
      id: "ai",
      label: "AI",
      shape: "icosahedron",
      desc: "Exploring what AI can practically do — assistants, tools and workflows, beyond the headlines.",
      tools: "ChatGPT · Gemini · AI-assisted writing",
    },
    {
      id: "local-llm",
      label: "LOCAL LLM",
      shape: "torusKnot",
      desc: "Running models on my own hardware. Private, offline, and honest about the limits.",
      tools: "Ollama · LM Studio · small open models",
    },
    {
      id: "automation",
      label: "AUTOMATION",
      shape: "octahedron",
      desc: "If I have to do it twice, a script does it the third time.",
      tools: "Batch jobs · templates · macros",
    },
    {
      id: "web",
      label: "WEB",
      shape: "box",
      desc: "Websites as a playground — layout, motion and interactive graphics.",
      tools: "HTML / CSS / JS · React · Three.js",
    },
    {
      id: "windows",
      label: "WINDOWS",
      shape: "dodecahedron",
      desc: "Home turf. Tweaks, tools and knowing what's happening under the hood.",
      tools: "Windows 11 · Terminal · Sysinternals",
    },
    {
      id: "powershell",
      label: "POWERSHELL",
      shape: "tetrahedron",
      desc: "My favourite hammer. Scripts that quietly do hours of work.",
      tools: "PowerShell 7 · modules · scheduled tasks",
    },
    {
      id: "github",
      label: "GITHUB",
      shape: "torus",
      desc: "Code, experiments and this site — versioned and public.",
      tools: "Repos · Actions · Pages",
    },
    {
      id: "workspace",
      label: "GOOGLE WORKSPACE",
      shape: "capsule",
      desc: "Docs, Sheets and Drive, pushed further with Apps Script and CLI tooling.",
      tools: "Apps Script · Sheets · Drive CLI",
    },
    {
      id: "desktop",
      label: "DESKTOP APPS",
      shape: "ring",
      desc: "Real software for real desks — like the scholarship & grant manager.",
      tools: "Windows · UI work · installers",
    },
    {
      id: "experiments",
      label: "EXPERIMENTS",
      shape: "cone",
      desc: "Everything else. Hardware, software, setups and odd ideas worth testing.",
      tools: "Whatever's on the bench",
    },
  ],
};

export const notes = [
  // Add / edit / remove notes freely — newest first.
  {
    date: "2026-08",
    tag: "AI",
    title: "Small models got good",
    body: "Running a local LLM on modest hardware is finally useful for everyday drafting and summarising.",
  },
  {
    date: "2026-07",
    tag: "AUTOMATION",
    title: "PowerShell pays rent",
    body: "One scheduled script replaced a weekly copy-paste ritual. Boring win — the best kind.",
  },
  {
    date: "2026-06",
    tag: "WEB",
    title: "Learning Three.js",
    body: "Rebuilding this site taught me more about 3D on the web than any tutorial. Scroll is a camera.",
  },
  {
    date: "2026-05",
    tag: "GITHUB",
    title: "GitHub Pages is underrated",
    body: "Free hosting, Actions for builds, zero servers to babysit. Hard to beat for static sites.",
  },
  {
    date: "2026-04",
    tag: "WORK",
    title: "Docs are a product",
    body: "Treat internal documentation like something people use, not something people file.",
  },
];

export const now = {
  updated: "AUG 2026",
  // Update this list whenever — it's meant to reflect the current moment.
  items: [
    "Three.js & WebGL scenes",
    "Local AI models",
    "Automation scripts",
    "Web experiments",
    "PowerShell tooling",
  ],
};

export const contact = {
  heading: "Want to say hello?",
  sub: "No forms. Pick whichever is easier.",
};
