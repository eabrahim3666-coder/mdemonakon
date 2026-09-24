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
  role: "Software Developer",
  greeting: "Hey, I'm Md. Emon \uD83D\uDC4B",
  email: "raphaelgiraud12@gmail.com",
  resume: "/giraud.pdf",
  socials: [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/raphael-giraud-60939519a/" },
    { name: "Youtube", url: "https://www.youtube.com/@toukoum" },
    { name: "Instagram", url: "https://www.instagram.com/raphael.giraud/" },
    { name: "Discord", url: "https://discord.com/users/toukoum" },
    { name: "Github", url: "https://github.com/toukoum" },
    { name: "X", url: "https://x.com/toukoumcode" },
  ],
};

export const presentation = {
  fullName: "Md. Emon",
  avatar: "/avatar-me.png",
  age: "21 years old",
  location: "Barishal, Bangladesh",
  /* Short intro — shown BESIDE the photo in the presentation card */
  intro:
    "Hey, I'm Emon \uD83D\uDC4B\nI'm a backend focused developer and SaaS builder passionate about building the systems behind modern software. I specialize in backend engineering, APIs, databases, integrations, AI, and automation, while working comfortably across the full stack when a product demands it.",
  /* The rest of the story — full-width section UNDER the photo/text grid */
  moreText:
    "I enjoy taking ideas from architecture to implementation, designing the logic, connecting the systems, solving the difficult parts, and turning concepts into reliable, usable software. I'm driven by curiosity, problem solving, and the process of building things that are useful, scalable, and built to last.",
  punchline: "I don't just write code, I build systems.",
  chips: ["AI", "Developer", "SaaS Builder", "Node.js", "Next.js"],
  facts: [
    { label: "Based in", value: "Barishal, Bangladesh" },
    { label: "Studied at", value: "Govt. BM College" },
    { label: "Focus", value: "AI Engineering, SaaS, Web3" },
    { label: "Open to", value: "Internships & collaborations" },
  ],
};

export interface ProjectLink {
  name: string;
  url: string;
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
}

export const projects: Project[] = [
  {
    title: "Synto",
    category: "Startup Project",
    src: "/syntopreview.png",
    description:
      "Synto is an AI-powered interface that transforms complex blockchain interactions into simple, natural language commands. Whether you want to send tokens, stake assets, swap coins, or even create NFTs or liquidity pools, just tell Synto what to do — no manual wallet interactions, no technical jargon. One of my biggest projects yet",
    techStack: [
      "Next.js",
      "TailwindCSS",
      "Web3.js",
      "shadcn-ui",
      "TypeScript",
      "Phantom Wallet",
      "OpenAI API",
      "Vercel AI SDK",
      "Solana Agent kit",
      "Neon",
      "Prisma",
    ],
    date: "2025",
    links: [
      { name: "website", url: "https://synto.fun" },
      { name: "Launch Video", url: "https://www.youtube.com/watch?v=4QUE2KgKDUw" },
      { name: "X", url: "https://x.com/chainSynto" },
      { name: "Technical Video", url: "https://www.youtube.com/watch?v=1CjBLKPUwtA&feature=youtu.be" },
      {
        name: "Pitch Deck",
        url: "https://drive.google.com/file/d/1B3m44mEgv81rJHfjNfTKi147yX4raQed/view?usp=sharing",
      },
      { name: "Usage tutorial", url: "https://www.youtube.com/watch?v=PRu1cfvT2bA" },
    ],
    images: [
      { src: "/synto1.png", alt: "Synto landing page" },
      { src: "/synto2.png", alt: "Synto chat interface" },
      { src: "/synto3.png", alt: "Synto chat interface" },
      { src: "/synto4.png", alt: "Synto chat interface" },
      { src: "/synto5.png", alt: "Synto chat interface" },
      { src: "/synto6.png", alt: "Synto chat interface" },
    ],
  },
  {
    title: "Rrate",
    category: "Fun Tool",
    src: "/ratepreview.png",
    description:
      "Rrate is a fun website to allow user to compare his salary with the richest people in the world. Try it now it's online!",
    techStack: ["Html", "Css", "Javascript"],
    date: "2024",
    links: [
      { name: "website", url: "https://rrate.app" },
      { name: "github", url: "https://github.com/toukoum/Rrate" },
    ],
    images: [
      { src: "/rrate1.png", alt: "Rrate landing page" },
      { src: "/rrate2.png", alt: "Rrate comparison page" },
      { src: "/rrate3.png", alt: "Rrate comparison page" },
    ],
  },
  {
    title: "Defai",
    category: "Hackathon Winner",
    src: "/defaipreview.png",
    description:
      "We Win ETHOXford hackathon by building DEFAI. DEFAI stands for Decentralized Finance Artificial Intelligence. It's an AI-powered chat interface that simplifies on-chain operations on the Avalanche blockchain by allowing users to interact using natural language. This makes complex DeFi operations accessible even for those with limited technical expertise.",
    techStack: ["Next.js", "TailwindCSS", "shadcn-ui", "Vercel AI SDK", "TypeScript"],
    date: "2025",
    links: [
      { name: "website", url: "https://dorahacks.io/buidl/22605" },
      { name: "github", url: "https://github.com/toukoum/DEFAI" },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/feed/update/urn:li:activity:7299337190151483392/",
      },
      {
        name: "Youtube Video",
        url: "https://www.youtube.com/watch?v=N9O7los4-ng&t=34s&ab_channel=Toukoum",
      },
    ],
    images: [
      { src: "/defai1.png", alt: "Landing Page of Defai" },
      { src: "/defai2.png", alt: "Confirmation popup of Defai" },
      { src: "/defai3.png", alt: "Chatbot of Defai" },
      { src: "/defai4.jpeg", alt: "Winner team" },
    ],
  },
  {
    title: "Fitgear",
    category: "Hackathon Winner",
    src: "/fitgearpreview.png",
    description:
      "Won the Gotta Go Hack IA by building Fitgear, a virtual voice seller accessible by QR code to improve the ratio between customers and sellers. Created an AI pipeline with API calls and a RAG system for natural language interactions.",
    techStack: ["Next.js", "TailwindCSS", "OpenAI API", "Langchain"],
    date: "2024",
    links: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/posts/raphael-giraud-60939519a_hackathon-innovation-sporttech-activity-7210399263774674946-qSXq",
      },
    ],
    images: [
      { src: "/fitgear2.png", alt: "Fitgear chatbot" },
      { src: "/fitgear1.png", alt: "Fitgear landing page" },
    ],
  },
  {
    title: "Datai",
    category: "Business Intelligence",
    src: "/dataipreview.png",
    description:
      "DATAI is an AI-powered agent that lets non-technical users query a database using natural language without writing SQL. Built using Next.js, TailwindCSS, shadcn-ui, and Anthropic's Claude API, this project focuses on simplicity, speed, and user-friendly design.",
    techStack: ["Next.js", "TailwindCSS", "shadcn-ui", "Claude API", "TypeScript"],
    date: "2024",
    links: [
      { name: "GitHub", url: "https://github.com/toukoum/datai" },
      { name: "Youtube Video Demo", url: "https://youtu.be/iE0RXjdbQsw" },
    ],
    images: [
      { src: "/datai1.png", alt: "Datai landing page" },
      { src: "/datai2.png", alt: "Datai chatbot" },
      { src: "/datai3.png", alt: "Datai chatbot" },
      { src: "/datai4.png", alt: "Datai chatbot" },
    ],
  },
  {
    title: "3d Pong Game",
    category: "42 Project",
    src: "/transcendancepreview.png",
    description:
      "Transcendance is the final project of my 42 cursus. It's a 3D pong game with multiplayer capabilities, user authentication, and real-time gameplay. We had to do everything from scratch, so it was pretty challenging and we learned a lot.",
    techStack: [
      "Django",
      "Python",
      "JavaScript",
      "Websockets",
      "PostgreSQL",
      "Docker",
      "Nginx",
      "Web3",
      "Solidity",
    ],
    date: "2023",
    links: [{ name: "GitHub", url: "https://github.com/toukoum/Transcendance" }],
    images: [
      { src: "/trans1.png", alt: "Transcendance landing page" },
      { src: "/trans2.png", alt: "Transcendance game" },
      { src: "/trans3.png", alt: "Transcendance game" },
      { src: "/trans4.png", alt: "Transcendance game" },
      { src: "/trans5.png", alt: "Transcendance game" },
      { src: "/trans6.png", alt: "Transcendance game" },
    ],
  },
  {
    title: "Minishell",
    category: "42 Project",
    src: "/minishellpreview.png",
    description:
      "Minishell is a project that aims to create a simple shell. It's a great introduction to process creation and management in C, offering fundamental Unix command-line functionality. This was a very challenging project, but I learned a lot from it.",
    techStack: ["C", "Unix", "Bash"],
    date: "2023",
    links: [{ name: "GitHub", url: "https://github.com/toukoum/Michelle-42" }],
    images: [{ src: "/minishell1.png", alt: "Minishell landing page" }],
  },
  {
    title: "YouBot",
    category: "Automation",
    src: "/youbotpreview.png",
    description:
      "YouBot is a Python Bot that Scrapes Videos from Pexels, adds a random song from a Songs Folder, then auto-uploads the videos to your YouTube Channel for continuous content generation.",
    techStack: ["Python", "YouTube API", "Pexels API"],
    date: "2022",
    links: [
      { name: "YouTube Video", url: "https://youtu.be/vp1v5mBG7rA" },
      { name: "GitHub", url: "https://github.com/toukoum/YouBot" },
    ],
    images: [
      { src: "/youbot1.jpg", alt: "Youbot landing page" },
      { src: "/youbot2.png", alt: "Youbot chatbot" },
    ],
  },
  {
    title: "Old Portfolio",
    category: "Web Development",
    src: "/oldportfoliopreview.png",
    description:
      "My previous traditional portfolio built with vanilla HTML, CSS and JS with GSAP animations for a smooth and interactive user experience.",
    techStack: ["HTML", "CSS", "JavaScript", "GSAP"],
    date: "2022",
    links: [
      { name: "Website", url: "https://toukoum.github.io/oldPortfolio/" },
      { name: "GitHub", url: "https://github.com/toukoum/portfolio" },
    ],
    images: [
      { src: "/oldport1.png", alt: "Old Portfolio landing page" },
      { src: "/oldport2.png", alt: "Old Portfolio projects" },
    ],
  },
];

export const skillCategories = [
  {
    category: "Frontend Development",
    skills: [
      "HTML",
      "CSS",
      "JavaScript/TypeScript",
      "Tailwind CSS",
      "Bootstrap",
      "Next.js",
      "React",
      "Vercel AI SDK",
      "Gsap",
    ],
    color: "bg-blue-50 text-blue-600 border border-blue-200",
    dot: "bg-blue-500",
  },
  {
    category: "Backend & Systems",
    skills: [
      "Unix",
      "C",
      "C++",
      "Python",
      "Typescript",
      "Git",
      "GitHub",
      "Docker",
      "GCP",
      "PostgreSQL",
    ],
    color: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    category: "AI & Fullstack Engineering",
    skills: [
      "LLM Providers (ChatGPT, Whisper, Groq, Mistral & Claude)",
      "AI Agents",
      "Prompt engineering",
      "Vector databases (Weaviate, Pinecone)",
      "RAG (Retrieval-Augmented Generation)",
      "Tool routing & calling",
      "Hugging Face Transformers",
      "Vercel AI SDK",
      "Supabase",
      "Prisma",
      "Next.js",
    ],
    color: "bg-purple-50 text-purple-600 border border-purple-200",
    dot: "bg-purple-500",
  },
  {
    category: "Design & Creative Tools",
    skills: ["Figma", "Davinci Code", "Illustrator", "Canva", "Keynote"],
    color: "bg-indigo-50 text-indigo-600 border border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    category: "Soft Skills",
    skills: [
      "Communication",
      "Problem-Solving",
      "Adaptability",
      "Learning Agility",
      "Teamwork",
      "Creativity",
      "Focus",
    ],
    color: "bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-500",
  },
];

export const funFacts = {
  title: "Mont Blanc (4810m)",
  photo: {
    src: "/blancmont.JPG",
    alt: "Mont Blanc",
    caption: "On top of Mont Blanc (me in blue behind)",
  },
  video: "https://www.youtube.com/watch?v=rufGMSgzUOk&ab_channel=Toukoum",
  text:
    "Me on top of Mont Blanc, the highest mountain in the Alps and the highest in Europe. I made it with a friend of mine without a guide, it was a great experience! You can see the 80km/h of wind on the photo!",
};
