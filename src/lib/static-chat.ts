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
  text: "Here's what I've been building! 🚀 Swipe through the showcase above — tap any project to open the full details with images, tech stack and links.",
};

const R_SKILLS: StaticReply = {
  tools: ["skills"],
  text: "My full arsenal ☝️ — from frontend to AI engineering, plus the soft skills. Want to know more about any of them?",
};

const R_FUN: StaticReply = {
  tools: ["fun"],
  text: "Glad you asked 😄 The craziest one is in the card above — spoiler: it involves a very tall mountain and a lot of wind!",
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
  text: "I keep things simple for now 😅 Try the quick buttons below — I can tell you about Me, my Projects, my Skills, some Fun stuff, or how to Contact me!",
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
  "what's the craziest thing you've ever done? what are your hobbies?": R_FUN,
  "what's the craziest thing you've ever done? (mb?) what are your hobbies?": R_FUN,
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
    keywords: ["fun", "crazy", "hobby", "hobbies", "mont blanc", "adventure", "mountain", "spare time"],
    reply: R_FUN,
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
