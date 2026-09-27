/**
 * ============================================================
 *  STATIC CHAT ENGINE — zero AI, zero network, zero waiting.
 *
 *  Every response is deterministic and lives in this file.
 *  Edit the texts below to rebrand/organize the content later.
 * ============================================================
 */

import type { ToolName } from "@/components/tool-cards";

export interface StaticReply {
  tools: ToolName[];
  text: string;
}

/* ------------------------------------------------------------------ */
/* The replies. One entry per quick-action button + typed questions.  */
/* Keep the tone casual & short — the card above carries the data.    */
/* ------------------------------------------------------------------ */

const R_PRESENTATION: StaticReply = {
  tools: ["presentation"],
  /* No chat text — the card above speaks for itself */
  text: "",
};

const R_PROJECTS: StaticReply = {
  tools: ["projects"],
  text: "I love turning ideas into real, working software. From AI-powered applications and SaaS platforms to backend systems, automation tools, and full-stack products, most of my projects start with a problem and end with something I can actually build, test, and use.\n\nI\u2019m particularly interested in backend engineering, AI, APIs, automation, and building systems that connect everything together. Each project is an opportunity to explore new technology, solve a different problem, and push my development skills further. Here are some of the things I\u2019ve built along the way.",
};

const R_SKILLS: StaticReply = {
  tools: ["skills"],
  text: "I am a backend developer first 👉 Node.js, realtime systems, event driven architecture, auth, payments and AI integrations, all proven in shipped products. And yes, I can hold my own on the frontend when a product needs a face.",
};

const R_FAQ: StaticReply = {
  tools: ["faq"],
  text: "Most answers live right here ☝️ — what I build, how I work, rates and availability. If yours isn't covered, email me and you'll hear back within 24 hours.",
};

const R_CONTACT: StaticReply = {
  tools: ["contact"],
  text: "All my links are just above 📬 Email is the fastest way to reach me. Let's talk!",
};

const R_GREETING: StaticReply = {
  tools: [],
  text: "Hey! 👋 Welcome to my portfolio. Ask me anything — or use the quick buttons below to explore my projects, skills and more!",
};

const R_FALLBACK: StaticReply = {
  tools: [],
  text: "Hmm, I don't have a pre-written answer for that one yet 😅 Drop me an email at eabrahim3666@gmail.com and I'll answer you personally — or try the quick buttons below.",
};

/* ------------------------------------------------------------------ */
/* Exact queries sent by the quick-action buttons (landing + chat).   */
/* Keyed lowercase — button clicks resolve in O(1), always the       */
/* right card, never a wrong guess.                                   */
/* ------------------------------------------------------------------ */

const QUICK_REPLIES: Record<string, StaticReply> = {
  "who are you? i want to know more about you.": R_PRESENTATION,
  "who are you? tell me about yourself": R_PRESENTATION,
  "what are your projects? what are you working on right now?": R_PROJECTS,
  "what are your skills? give me a list of your soft and hard skills.": R_SKILLS,
  "what are your faqs? what do clients usually ask?": R_FAQ,
  "how can i contact you?": R_CONTACT,
};

/* ------------------------------------------------------------------ */
/* Keyword routing for free-typed questions (deterministic — the      */
/* same question always gets the same answer).                        */
/* ------------------------------------------------------------------ */

const KEYWORD_ROUTES: { keywords: string[]; reply: StaticReply }[] = [
  {
    keywords: ["project", "work", "built", "build", "hackathon", "portfolio piece", "showcase"],
    reply: R_PROJECTS,
  },
  {
    keywords: ["skill", "stack", "tech", "language", "tools you use", "know"],
    reply: R_SKILLS,
  },
  {
    keywords: [
      "faq",
      "rate",
      "price",
      "cost",
      "charge",
      "quote",
      "budget",
      "freelance",
      "contract",
      "hire",
      "available",
      "availability",
      "how do we start",
      "get started",
      "process",
      "timezone",
      "time zone",
      "remote",
      "alone or",
      "team",
      "study",
      "see your code",
      "clients ask",
    ],
    reply: R_FAQ,
  },
  {
    keywords: ["contact", "email", "reach", "social", "linkedin", "github", "call", "phone"],
    reply: R_CONTACT,
  },
  {
    keywords: ["who", "about you", "yourself", "presentation", "introduce", "background", "study", "studies"],
    reply: R_PRESENTATION,
  },
];

const GREETING_RE = /^(hi|hii+|hello+|hey+|yo|sup|salam|assalamu|good (morning|afternoon|evening))\b/;

/**
 * Resolve any question to its static reply.
 * Pure function — no state, no network, instant.
 */
export function resolveStaticReply(question: string): StaticReply {
  const q = question.trim().toLowerCase();

  const quick = QUICK_REPLIES[q];
  if (quick) return quick;

  if (GREETING_RE.test(q)) return R_GREETING;

  for (const route of KEYWORD_ROUTES) {
    if (route.keywords.some((k) => q.includes(k))) return route.reply;
  }

  return R_FALLBACK;
}
