// ─────────────────────────────────────────────────────────────
//  SITE CONTENT — edit this file to update text across the site.
//  Everything here is meant to be personal and honest. If a claim
//  isn't true, don't put it here.
// ─────────────────────────────────────────────────────────────

export const identity = {
  name: "Deepak Batra",
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
    "Outside of that, technology is where my curiosity lives — AI, local LLMs, automation, Windows and PowerShell, web experiments with Three.js. Software or hardware, if it's interesting and I can take it apart or build with it, I'm in.",
    "I build things mostly because I enjoy figuring them out: a desktop app for scholarship and grant work, small scripts that quietly save real time, websites that exist because I wanted to see if I could make them.",
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
      "A Windows desktop application I built for managing scholarship and grant-related records, workflows and reporting — the kind of work that used to live in scattered files.",
    why: "I wanted to turn a paper-and-spreadsheets process into something orderly, and to learn what building real desktop software actually takes.",
    stack: ["WINDOWS", "DESKTOP UI", "DATA & REPORTS"],
    hue: 190,
  },
  {
    id: "websites",
    index: "02",
    title: "Personal Websites",
    blurb:
      "This site and its ancestors — ongoing experiments in modern web design and interactive graphics.",
    why: "Each version is an experiment. The current one taught me most of what I know about 3D on the web.",
    stack: ["REACT", "THREE.JS", "GITHUB PAGES"],
    hue: 265,
  },
  {
    id: "automation",
    index: "03",
    title: "Automation",
    blurb:
      "Small tools and scripts that take over the repetitive parts of office work — documentation, reporting, file chores.",
    why: "If a task happens twice, a script should handle it the third time. Most of these started as exactly that.",
    stack: ["POWERSHELL", "GOOGLE WORKSPACE", "SCHEDULED TASKS"],
    hue: 35,
  },
  {
    id: "ai",
    index: "04",
    title: "AI Experiments",
    blurb:
      "Local LLMs, AI tools and CLI utilities — testing what models can actually do on my own machine.",
    why: "I wanted to know what the tools can really do on modest hardware, not what headlines claim.",
    stack: ["LOCAL LLMS", "OLLAMA", "CLI TOOLS"],
    hue: 150,
  },
];

export const lab = {
  heading: "Tech Lab",
  intro: "A workbench of things I explore.",
  hint: "Click an object to inspect it.",
  items: [
    {
      id: "ai",
      label: "AI",
      shape: "icosahedron",
      desc: "Exploring what AI can practically do — tools, assistants and workflows.",
      tools: "ChatGPT · Gemini · AI-assisted writing",
    },
    {
      id: "local-llm",
      label: "LOCAL LLM",
      shape: "torusKnot",
      desc: "Experimenting with local AI models, tools and workflows.",
      tools: "Ollama · LM Studio · small open models",
    },
    {
      id: "automation",
      label: "AUTOMATION",
      shape: "octahedron",
      desc: "Scripts and workflows that quietly take over repetitive work.",
      tools: "Batch jobs · templates · macros",
    },
    {
      id: "windows",
      label: "WINDOWS",
      shape: "dodecahedron",
      desc: "Home turf — tweaks, tools and what's happening under the hood.",
      tools: "Windows 11 · Terminal · Sysinternals",
    },
    {
      id: "powershell",
      label: "POWERSHELL",
      shape: "tetrahedron",
      desc: "My favourite hammer for quiet, repeatable work.",
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
      desc: "Docs, Sheets and Drive, pushed beyond the defaults.",
      tools: "Apps Script · Sheets · Drive CLI",
    },
    {
      id: "web",
      label: "WEB",
      shape: "box",
      desc: "Websites as a playground — layout, motion and interaction.",
      tools: "HTML / CSS / JS · React · Vite",
    },
    {
      id: "three",
      label: "THREE.JS",
      shape: "cone",
      desc: "Learning to build small 3D worlds that run in a browser tab.",
      tools: "WebGL · React Three Fiber · shaders",
    },
    {
      id: "desktop",
      label: "DESKTOP SOFTWARE",
      shape: "ring",
      desc: "Real apps for real desks — like the scholarship manager.",
      tools: "Windows · UI work · packaging",
    },
  ],
};

export const now = {
  updated: "AUG 2026",
  // Update this list whenever — it's meant to reflect the current moment.
  items: [
    "Three.js",
    "AI tools",
    "Local AI",
    "Automation",
    "Web experiments",
  ],
};

export const contact = {
  heading: "Want to say hello?",
  sub: "No forms. Pick whichever is easier.",
};
