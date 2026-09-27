/**
 * ============================================================
 *  PORTFOLIO PERSONA & BRAND CONFIG
 *  Single place to rebrand the whole site later.
 *  Currently mirrors the reference site's content 1:1.
 * ============================================================
 */

export const brand = {
  name: "Md. Emon",
  siteTitle: "Md. Emon Portfolio",
  description: "Portfolio of Md. Emon — Software Developer. Projects, skills and contact.",
  watermark: "Emon", // giant background text on the landing page
  role: "Node.js Backend Developer",
  greeting: "Hey, I'm Md. Emon \uD83D\uDC4B",
  email: "eabrahim3666@gmail.com",
  socials: [
    { name: "GitHub", url: "https://github.com/eabrahim3666-coder" },
    { name: "Instagram", url: "https://www.instagram.com/em0n36/" },
    { name: "LinkedIn", url: "" }, // TODO: add LinkedIn profile URL
  ],
};

export const presentation = {
  fullName: "Md. Emon",
  avatar: "/avatar-me.png",
  subtitle: "Node.js Backend Developer",
  location: "Barishal, Bangladesh",
  /* Short intro — shown BESIDE the photo in the presentation card */
  intro:
    "I build backend systems that run real businesses. APIs, payment flows, AI voice agents, and the automation that keeps everything working when nobody is watching.\n\nMy flagship product is NextCall, an AI receptionist that answers calls and books appointments for small businesses with zero human input. I built Prospector to feed it customers, an AI sales engine that finds local businesses, audits their online presence, and scores every lead from 0 to 100. One product finds the customers, the other serves them.",
  /* Specialties — bulleted under "What I specialize in" in the story section */
  specialties: [
    "REST APIs & Backend Architecture",
    "AI Voice Agents & LLM Integration",
    "Payments, Webhooks & Third Party Integrations",
    "Real Time Systems with Socket.IO",
  ],
  punchline:
    "I care about the unglamorous parts that make software trustworthy: idempotency, retries, monitoring, and clean data models. I don't just write code. I build systems.",
  chips: ["AI Agents", "SaaS Builder", "Node.js", "TypeScript", "APIs", "Next.js", "Backend"],
  facts: [
    { label: "Based in", value: "Barishal, Bangladesh · GMT+6" },
    { label: "Shipped", value: "4 real products built end to end" },
    { label: "Focus", value: "AI Agents, SaaS & Backend Systems" },
    { label: "Open to", value: "Freelance & full-time roles" },
    { label: "Response time", value: "Within 24 hours" },
    { label: "Working style", value: "Remote-friendly, async-first" },
  ],
};

/* Client-facing FAQ — pre-written answers for the questions visitors
   usually ask. Typed questions that don't match any of these fall
   through to the fallback reply inviting a direct email. */
export const faq = [
  {
    q: "What kind of projects do you take on?",
    a: "Mostly backend heavy work: REST APIs, real time systems, multi vendor platforms, payment and third party integrations, AI powered features and automation. Recent examples include an AI receptionist that books appointments over the phone, a lead generation engine that scores every prospect, and a multi vendor commerce API with payment webhooks. I ship the full stack too when a product needs a face.",
  },
  {
    q: "How much will my project cost?",
    a: "Every project gets its own quote. The price depends on scope, complexity and how fast you need it, so a small integration costs a fraction of a full platform build. Here is how it always works: you tell me what you need, I send one fixed quote in writing covering scope, timeline and price, and that number does not move unless you change the scope. No hourly meter, no surprise invoices. Payments are split into milestones tied to deliverables, so you only pay for work you have already seen.",
  },
  {
    q: "How long will my project take?",
    a: "That depends on what we are building. Simple tasks often take days, full products take weeks. Tell me your deadline and I will tell you honestly whether it is realistic before you commit to anything. Once we agree on a timeline it becomes part of the deal, and you get progress updates the whole way so you always know where things stand.",
  },
  {
    q: "How do we start working together?",
    a: "Email me your idea. I reply within 24 hours with a few questions, then send a clear quote with scope, timeline and price. Once you approve, we start. Most communication is async, which means detailed written updates you can read anytime instead of endless meetings.",
  },
  {
    q: "What do you need from me during the project?",
    a: "Much less than most developers ask for. At the start I need access to your accounts, any brand or product details, and one person who can make final decisions. After that I run the build and bring you in at milestones for feedback. You can be as involved or as hands off as you want.",
  },
  {
    q: "Can you integrate AI into my existing site or product?",
    a: "Yes, and it is my specialty. I have shipped AI voice agents answering real phone calls, chat systems trained on private documents, and lead scoring engines grading every incoming prospect. The AI layer sits on top of your existing stack, so no rebuild is required. Tell me the workflow you want automated and I will honestly tell you if AI is the right tool or if a simpler solution is cheaper.",
  },
  {
    q: "Do you work alone or with a team?",
    a: "I work solo, which means you talk directly to the person writing your code. No account managers, no handoffs, no agency markup. For bigger builds I bring in trusted collaborators for design or extra frontend hands, but architecture and delivery always stay on me.",
  },
  {
    q: "What happens if something breaks after launch?",
    a: "We agree on support terms before the project starts, so this is never a surprise. Every project includes a support window after delivery for fixing anything on my side, and a simple monthly maintenance plan is available if you want someone watching your product long term. You will never be left holding software nobody supports.",
  },
  {
    q: "Who owns the code?",
    a: "You do, fully. On final payment you receive the complete repository, documentation and deployment access, and I keep nothing hostage. During the build you watch progress on a live staging link. Some client work stays private, but my public projects with full source are linked in the Projects section.",
  },
];

export interface ProjectLink {
  name: string;
  url: string;
}

/* Case-study extras — only projects with `caseStudy` render the
   extended engineering layout in the detail modal. All sections are
   optional except subtitle/problem/solution/features/closing so each
   project can compose its own story. */
export interface CaseStudy {
  heading?: string;
  subtitle: string;
  capabilities?: string[];
  problem: string;
  solution: string;
  architecture?: string[];
  features?: { title: string; description: string }[];
  flowText?: string;
  failText?: string;
  outcomeFeatures?: { title: string; description: string }[];
  highlights?: { title: string; description: string }[];
  closing: string;
}

export interface Project {
  title: string;
  category: string;
  src: string; // carousel preview image
  description: string;
  techStack: string[];
  date: string;
  links: ProjectLink[];
  images: { src: string; alt: string }[];
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  {
    title: "NextCall",
    category: "Startup Product",
    src: "/nextcallpreview.png",
    description:
      "NextCall is an AI-powered 24/7 call & chat receptionist for small businesses — it answers calls, books appointments, and automates customer interactions end to end.",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Retell AI",
      "OpenAI",
      "Twilio",
      "Clerk",
      "DataStax Astra DB",
      "Pusher",
      "Google Calendar API",
      "Paddle",
      "Resend",
      "Tailwind CSS 4",
      "Framer Motion",
    ],
    date: "2025",
    links: [
      { name: "Case Study (PDF)", url: "/case-studies/NextCall-Case-Study.pdf" },
      { name: "GitHub", url: "https://github.com/eabrahim3666-coder/nextCall-V2" },
      { name: "Website", url: "https://getnextcall.com" },
    ],
    caseStudy: {
      heading: "NextCall — Production AI Receptionist Platform",
      subtitle:
        "Built from scratch using Node.js, Twilio, OpenAI, Redis, AstraDB, and Google OAuth.",
      capabilities: [
        "24/7 Call Handling",
        "Auto Calendar Sync",
        "AI Conversations",
        "Real-Time Webhooks",
      ],
      problem: "Small businesses lose customers when calls go unanswered.",
      solution:
        "NextCall uses AI to answer calls, book appointments, update Google Calendar, and automate customer interactions.",
      architecture: [
        "Phone",
        "Twilio",
        "Express API",
        "OpenAI",
        "Google Calendar",
        "Confirmation SMS",
      ],
      features: [
        { title: "AI Call Handling", description: "Answers calls 24/7." },
        { title: "Appointment Booking", description: "Google Calendar integration." },
        { title: "Instant Follow-ups", description: "Confirmation messages automatically." },
        { title: "Call Intelligence", description: "AI summaries after every conversation." },
      ],
      highlights: [
        {
          title: "Express.js Backend Architecture",
          description: "Modular REST API with clean routing, middleware and centralized error handling.",
        },
        {
          title: "Event-Driven Webhooks",
          description: "Signature-verified Twilio and calendar events processed reliably in real time.",
        },
        {
          title: "Secure Google OAuth Integration",
          description: "Scoped access and safe token handling for calendar sync.",
        },
        {
          title: "Redis & AstraDB Data Management",
          description: "High-speed caching layered on a scalable cloud database.",
        },
      ],
      closing:
        "NextCall demonstrates my ability to build production-grade backend systems—from AI-powered phone automation to real-time webhooks, authentication, and scalable API architecture.",
    },
    images: [
      { src: "/nextcall-1.png", alt: "NextCall cinematic landing page" },
      { src: "/nextcall-2.png", alt: "Everything you need to know about NextCall" },
      { src: "/nextcall-3.png", alt: "Automatic Appointment Sync" },
      { src: "/nextcall-4.png", alt: "NextCall Pricing" },
      { src: "/nextcall-5.png", alt: "AI Command Center" },
      { src: "/nextcall-6.png", alt: "Real-Time Call Management" },
      { src: "/nextcall-7.png", alt: "Live AI Activity" },
    ],
  },
  {
    title: "DaraZ API",
    category: "Backend API",
    src: "/darazpreview.png",
    description:
      "A multi vendor commerce backend inspired by the scale of marketplaces like DaraZ. One cart, one payment, many sellers: Redis locked carts, atomic inventory reservation, Stripe payments that auto split into per seller fulfilments with real shipping labels, and a Kafka event pipeline driving it all in real time.",
    techStack: [
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "Redis",
      "Socket.IO",
      "Kafka",
      "Stripe",
      "Shippo",
      "JWT",
      "Argon2",
      "Passport.js",
      "Speakeasy",
      "Twilio",
      "Winston",
      "Helmet",
    ],
    date: "2025",
    links: [
      { name: "System Map (PDF)", url: "/case-studies/daraz_user_activity_map.pdf" },
      { name: "GitHub", url: "https://github.com/eabrahim3666-coder/Daraz-api" },
    ],
    caseStudy: {
      subtitle:
        "A multi vendor commerce backend inspired by the scale of marketplaces like DaraZ. One cart, one payment, many sellers: Redis locked carts, atomic inventory reservation, Stripe payments that auto split into per seller fulfilments with real shipping labels, and a Kafka event pipeline driving it all in real time.",
      problem:
        "Marketplaces are the hardest backend problem there is. Many sellers share one cart and one payment, inventory can never oversell, and every order must split cleanly into per seller fulfilments with real shipping.",
      solution:
        "DaraZ API solves it with Redis distributed locks and atomic per SKU reservation, Stripe PaymentIntents confirmed by signature verified webhooks, automatic order splitting into per seller fulfilments that purchase real Shippo labels, and Kafka carrying every state change between services.",
      flowText:
        "A buyer checks out once. The API reserves inventory atomically across every seller in the cart, creates a single Stripe PaymentIntent, and on the confirmed webhook splits the order into per seller fulfilments. Each fulfilment purchases a real shipping label through Shippo, tracking webhooks drive delivery status, and a refund rolls inventory back automatically. Kafka carries every state change and Socket.IO pushes live updates to buyer and seller dashboards.",
      failText:
        "Concurrency is the enemy of commerce. Distributed locks and atomic reservation make overselling impossible even under heavy load. Every webhook is signature verified and idempotent, so a replay does nothing. Refunds trigger automatic inventory rollback across sellers. In front of it all: layered rate limiting, request sanitization, Helmet, JWT blacklisting in Redis, optional TOTP two factor, and fraud detection on suspicious patterns.",
      outcomeFeatures: [
        {
          title: "Multi Vendor Marketplace",
          description: "Sellers onboard, manage products and fulfil their own orders.",
        },
        {
          title: "Race Safe Checkout",
          description: "Locked carts and atomic reservation, so two buyers can never claim the last unit.",
        },
        {
          title: "Payments That Split",
          description: "One PaymentIntent from the buyer, per seller fulfilments behind the scenes.",
        },
        {
          title: "Real Shipping",
          description: "Shippo labels, carrier tracking webhooks and automatic delivery updates.",
        },
        {
          title: "Live Buyer Seller Chat",
          description: "Real time messaging and offers over Socket.IO, scaled with the Redis adapter.",
        },
        {
          title: "Admin Console",
          description: "Marketplace analytics, refunds, order control and customer support tools.",
        },
      ],
      closing:
        "This was my first production grade backend, and the project that taught me to handle money, concurrency and multiple sellers at once. Everything I shipped after it stands on this foundation.",
    },
    images: [
      {
        src: "/daraz-1.png",
        alt: "The full system: client apps, API gateway, data layer, event stream and external services",
      },
      { src: "/daraz-4.png", alt: "A versioned REST API, every endpoint validated and tested" },
      { src: "/daraz-3.png", alt: "The event pipeline, live in the logs" },
    ],
  },
  {
    title: "NextCall Prospector",
    category: "AI Lead Generation",
    src: "/prospectorpreview.png",
    description:
      "An internal lead generation engine built for NextCall's own sales team. It finds local businesses on a live map, enriches them by crawling their web presence, audits them with a deterministic scoring engine, and turns every audit into a personalized PDF report and a grounded outreach email that follows up only after it was actually opened.",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "OpenAI GPT 4o mini",
      "SerpAPI",
      "Apify",
      "Leaflet",
      "DataStax Astra DB",
      "Resend",
      "React PDF",
      "Cheerio",
      "Zod",
      "Tailwind CSS 4",
      "shadcn/ui",
    ],
    date: "2025",
    links: [
      { name: "Case Study (PDF)", url: "/case-studies/NextCall-User-Activity-Map.pdf" },
      { name: "Website", url: "https://audit-next-call.vercel.app/" },
      { name: "GitHub", url: "https://github.com/eabrahim3666-coder/audit_nextCall" },
    ],
    caseStudy: {
      subtitle:
        "An internal lead generation engine built for NextCall's own sales team. It finds local businesses on a live map, enriches them by crawling their web presence, audits them with a deterministic scoring engine, and turns every audit into a personalized PDF report and a grounded outreach email that follows up only after it was actually opened.",
      problem:
        "NextCall needed customers, and manually hunting local businesses, reading their websites and writing outreach was eating the time that should go into building product. Generic cold email was not an option, it had to reference real findings about each business.",
      solution:
        "Prospector automates the entire pipeline: discovery on an interactive map through four pluggable data providers, enrichment by crawling each website for emails, phone numbers, socials and booking systems, a deterministic audit scored 0 to 100, and AI outreach grounded in those audit facts with automated PDF reports attached.",
      flowText:
        "A search starts on the map, powered by four pluggable data providers. The enricher crawls each business website for contact details, socials and booking systems. The deterministic audit engine scores the business 0 to 100 across five weighted categories, then GPT 4o mini turns that raw audit into a narrative report and a branded multi page PDF. The scheduler sends the outreach email, and the tracking pixel gates every follow up until the previous email was actually opened.",
      failText:
        "AI never invents the score. The audit math is fully deterministic, and the LLM only writes narrative on top of facts it is handed, so outreach cannot hallucinate a business into something it is not. Every send and follow up carries an idempotency key, so duplicates are impossible even on retries. Zod validates every payload crossing a boundary, rate limiting protects third party quotas, and delivery webhooks track every send. If one data provider fails, discovery falls back to the others.",
      outcomeFeatures: [
        {
          title: "Map Discovery",
          description: "Search any town or trade on a live map, backed by four pluggable data providers.",
        },
        {
          title: "Lead Enrichment",
          description:
            "Crawls each website for emails, phone numbers, social profiles and booking systems.",
        },
        {
          title: "Deterministic Audit",
          description: "Scores every business 0 to 100 across five weighted categories. No AI in the math.",
        },
        {
          title: "AI Reports",
          description: "GPT 4o mini turns the raw audit into a narrative and a branded multi page PDF.",
        },
        {
          title: "Grounded Outreach",
          description: "Emails written only from audit facts, with AI follow ups after a real open.",
        },
        {
          title: "Pipeline Dashboard",
          description: "Prospects, audits and outreach tracked end to end in one view.",
        },
      ],
      closing:
        "NextCall serves the customers, Prospector finds them. I built my own sales pipeline, and every report it sends is grounded in audited facts instead of AI guesses.",
    },
    images: [
      { src: "/prospector-2.png", alt: "Business discovery on a live map, enrichment one click away" },
      { src: "/prospector-3.png", alt: "Outreach grounded in the audit, follow ups wait for a real open" },
      {
        src: "/prospector-4.png",
        alt: "The pipeline at a glance: prospects, audits and outreach tracked end to end",
      },
      { src: "/prospector-1.png", alt: "The quiet front door to an internal tool" },
    ],
  },
  {
    title: "PhoneMarket",
    category: "E-Commerce Platform",
    src: "/phonemarketpreview.png",
    description:
      "A full stack e commerce platform for flagship smartphones. An Apple grade dark storefront with variant aware products and coupon checkout, a real time support chat with typing indicators and read receipts, a complete admin suite for products, orders, coupons and analytics, all running on my own Ubuntu VPS behind nginx and PM2.",
    techStack: [
      "React 18",
      "Redux Toolkit",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "Multer",
      "Joi",
      "Socket.io",
      "JWT Auth",
      "Nodemailer",
      "PM2",
      "REST API",
    ],
    date: "2025",
    links: [{ name: "GitHub", url: "https://github.com/eabrahim3666-coder/PhoneMarket" }],
    caseStudy: {
      subtitle:
        "A full stack e commerce platform for flagship smartphones. An Apple grade dark storefront with variant aware products and coupon checkout, a real time support chat with typing indicators and read receipts, a complete admin suite for products, orders, coupons and analytics, all running on my own Ubuntu VPS behind nginx and PM2.",
      problem:
        "Most storefront projects stop at a product list and a cart. A real shop needs variant inventory, coupons, order tracking, support that actually answers, and someone who can deploy and operate the whole thing.",
      solution:
        "PhoneMarket is the full picture: a dark, Apple grade storefront backed by a secure Express API with JWT sessions and strict input validation, a Socket.IO support chat that behaves like a modern messenger, an admin operations suite with revenue trends and conversion funnels, and a deployment I own end to end.",
      flowText:
        "A shopper browses the catalog, compares models side by side, picks color and storage variants, and applies a coupon at checkout. The Express API validates every input with Joi, writes the cart and order through Mongoose models, and confirms with a JWT protected session. The buyer tracks the order from placed to delivered, the admin drives every status change from the operations suite, and updates arrive live over Socket.IO, chat and notifications included.",
      failText:
        "Security runs deep: Helmet, request sanitization, layered rate limiting, hashed credentials, JWT sessions with role based access, and Joi validation on every payload. Multer gates file uploads and structured logs keep everything debuggable. In production the API runs under PM2 with zero downtime restarts, nginx fronts it with SSL from Let's Encrypt, and the same codebase deploys cleanly to Render, Railway or Fly.io.",
      outcomeFeatures: [
        {
          title: "Dark Storefront",
          description: "An Apple grade shopping experience with instant search and rich product pages.",
        },
        {
          title: "Variants and Compare",
          description: "Color and storage variants per model, with side by side comparison.",
        },
        {
          title: "Cart, Coupons and Checkout",
          description: "Persistent carts, coupon discounts and tracked orders end to end.",
        },
        {
          title: "Live Support Chat",
          description:
            "Real time buyer and seller chat over Socket.IO with typing indicators, read receipts and unread counts.",
        },
        {
          title: "Admin Operations Suite",
          description:
            "Full control over products, orders, users and coupons, plus revenue trends and conversion funnels.",
        },
        {
          title: "Self Hosted Deployment",
          description: "Runs on my own Ubuntu VPS behind nginx and PM2, with cloud deploys ready.",
        },
      ],
      closing:
        "PhoneMarket is where I learned to ship and operate a complete product: the storefront customers see, the API behind it, and the server it runs on. The storefront, the chat, the admin suite and the deployment are all mine, end to end.",
    },
    images: [
      { src: "/phonemarket-1.png", alt: "The storefront: dark, fast and variant aware" },
      {
        src: "/phonemarket-2.png",
        alt: "The variant aware flagship catalog; side by side comparison one click away",
      },
      { src: "/phonemarket-3.png", alt: "The admin suite: revenue trends, top categories and full order control" },
    ],
  },
];

export const skillCategories = [
  {
    category: "Backend Engineering",
    note: "My core discipline. Production Node.js systems from routing to deployment.",
    skills: [
      { name: "Node.js", subtitle: "The runtime behind every backend I ship.", icon: "server" },
      { name: "Express", subtitle: "Versioned REST APIs with strict input validation.", icon: "network" },
      { name: "TypeScript", subtitle: "Type safety across backend and frontend.", icon: "file-code" },
      {
        name: "Auth & Sessions",
        subtitle:
          "JWT httpOnly cookies, Argon2 hashing, Clerk, Google and Facebook OAuth, TOTP 2FA, RBAC.",
        icon: "shield-check",
      },
      {
        name: "API Security",
        subtitle: "Rate limiting, sanitization, Helmet and layered request validation.",
        icon: "lock",
      },
    ],
  },
  {
    category: "Databases & Caching",
    note: "Where the data lives and how it stays fast.",
    skills: [
      {
        name: "MongoDB",
        subtitle: "Schema design, Mongoose models and aggregation pipelines on Atlas.",
        icon: "database",
      },
      { name: "Redis", subtitle: "Caching, pub/sub, distributed locks and rate limiting.", icon: "zap" },
      { name: "DataStax Astra DB", subtitle: "Vector search powering RAG features.", icon: "cloud" },
    ],
  },
  {
    category: "Realtime & Events",
    note: "Systems that react the moment something happens.",
    skills: [
      {
        name: "Socket.IO",
        subtitle: "Live chat and activity feeds, scaled horizontally with the Redis adapter.",
        icon: "radio",
      },
      {
        name: "Apache Kafka",
        subtitle: "Event driven services with KafkaJS producers and consumers.",
        icon: "cable",
      },
      {
        name: "Webhooks",
        subtitle: "Signature verified flows for payments, shipping and email tracking.",
        icon: "webhook",
      },
    ],
  },
  {
    category: "AI & Integrations",
    note: "Wiring AI and third party services into products that do real work.",
    skills: [
      {
        name: "OpenAI",
        subtitle: "GPT 4o chat, function calling and RAG over uploaded PDF knowledge bases.",
        icon: "sparkles",
      },
      {
        name: "Retell AI",
        subtitle: "Voice agents answering real phone calls around the clock.",
        icon: "phone-call",
      },
      { name: "Twilio", subtitle: "Calls, SMS, WhatsApp and number provisioning.", icon: "message-square" },
      { name: "Stripe & Paddle", subtitle: "Checkout, subscriptions and payment webhooks.", icon: "credit-card" },
      {
        name: "Google Calendar API",
        subtitle: "Automated appointment booking and sync.",
        icon: "calendar",
      },
      { name: "Shippo", subtitle: "Shipping labels and carrier tracking webhooks.", icon: "package" },
      { name: "Resend & Nodemailer", subtitle: "Transactional email pipelines.", icon: "mail" },
      {
        name: "Web Scraping & Enrichment",
        subtitle: "Cheerio, SerpAPI, Apify and Meta Graph data pipelines.",
        icon: "globe",
      },
      {
        name: "Workflow Automation",
        subtitle: "n8n flows, Telegram alert bots and Vercel cron jobs.",
        icon: "workflow",
      },
    ],
  },
  {
    category: "Frontend",
    note: "Clean, working interfaces for the systems I build.",
    skills: [
      { name: "Next.js", subtitle: "App Router, middleware, API routes and cron jobs.", icon: "layers" },
      { name: "React 19", subtitle: "Modern hooks, composition and performance patterns.", icon: "atom" },
      {
        name: "Redux Toolkit",
        subtitle: "Complex client state for realtime commerce UIs.",
        icon: "refresh-cw",
      },
      {
        name: "Tailwind CSS",
        subtitle: "Design systems at speed, paired with shadcn/ui.",
        icon: "wind",
      },
      {
        name: "Framer Motion",
        subtitle: "Motion and micro interactions where they earn their place.",
        icon: "mouse-pointer-2",
      },
      {
        name: "Leaflet & Recharts",
        subtitle: "Interactive maps and analytics dashboards.",
        icon: "bar-chart-3",
      },
    ],
  },
  {
    category: "Tools & Infrastructure",
    note: "The daily drivers.",
    skills: [
      {
        name: "Git & GitHub",
        subtitle: "Version control on every project from day one.",
        icon: "git-branch",
      },
      { name: "Deployment", subtitle: "Vercel, Railway, Render and Fly.io.", icon: "rocket" },
      { name: "Vitest", subtitle: "Automated tests on the flows that matter.", icon: "flask-conical" },
    ],
  },
];
