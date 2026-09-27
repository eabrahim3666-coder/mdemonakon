"use client";

import { createContext, useContext, useEffect, useId, memo, useRef, useState } from "react";
import type { ReactNode, RefObject, SVGProps } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Layers,
  UserRoundSearch,
  Laugh,
  ChevronRight,
  ChevronDown,
  Mail,
  X,
  Link as LinkIcon,
  Server,
  Network,
  Zap,
  Radio,
  ShieldCheck,
  Database,
  Sparkles,
  PhoneCall,
  Webhook,
  FileCode,
  Braces,
  Wind,
  GitBranch,
  Github,
  Lock,
  Cloud,
  Cable,
  MessageSquare,
  CreditCard,
  Calendar,
  Package,
  Globe,
  Workflow,
  Atom,
  RefreshCw,
  MousePointer2,
  BarChart3,
  Rocket,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { brand, presentation, projects, skillCategories, faq, type Project } from "@/lib/persona";

/* Skill icon lookup — data files stay framework-free, the card resolves
   the string key to a lucide component at render time. */
const SKILL_ICONS: Record<string, LucideIcon> = {
  server: Server,
  network: Network,
  zap: Zap,
  radio: Radio,
  "shield-check": ShieldCheck,
  database: Database,
  sparkles: Sparkles,
  "phone-call": PhoneCall,
  webhook: Webhook,
  layers: Layers,
  "file-code": FileCode,
  braces: Braces,
  wind: Wind,
  "git-branch": GitBranch,
  github: Github,
  lock: Lock,
  cloud: Cloud,
  cable: Cable,
  "message-square": MessageSquare,
  "credit-card": CreditCard,
  calendar: Calendar,
  package: Package,
  mail: Mail,
  globe: Globe,
  workflow: Workflow,
  atom: Atom,
  "refresh-cw": RefreshCw,
  "mouse-pointer-2": MousePointer2,
  "bar-chart-3": BarChart3,
  rocket: Rocket,
  "flask-conical": FlaskConical,
};

/* Apple-style ease curve used across the reference site — one shared rhythm
   so every card entrance feels like the same cinematic "voice" */
const APPLE_EASE = [0.19, 1, 0.22, 1] as const;

/**
 * Reusable cinematic viewport-reveal wrapper.
 * As the user scrolls down, sections emerge smoothly with a subtle lift,
 * opacity fade, and Apple-grade cubic-bezier easing.
 */
function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.75, delay, ease: APPLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Projects — expandable card carousel (like the original site):       */
/* the cards NEVER disappear on click — instead the clicked card       */
/* morphs (framer-motion layoutId) into a full-screen modal overlay    */
/* that floats above the still-visible carousel.                      */
/* ------------------------------------------------------------------ */

interface ExpandableCardData {
  category: string;
  title: string;
  src: string;
  content: ReactNode;
}

interface CarouselCtx {
  onCardClose: (index: number) => void;
  currentIndex: number;
}

const CarouselContext = createContext<CarouselCtx>({
  onCardClose: () => {},
  currentIndex: 0,
});

function useClickOutside(ref: RefObject<HTMLDivElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* Exact SVG replicas of the original site's arrow-narrow-left/right icons */
function IconArrowNarrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12l14 0" />
      <path d="M5 12l4 4" />
      <path d="M5 12l4 -4" />
    </svg>
  );
}

function IconArrowNarrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12l14 0" />
      <path d="M15 16l4 -4" />
      <path d="M15 8l4 4" />
    </svg>
  );
}

/* Preview image with blur-up loading effect (as the original) */
function BlurImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [blurred, setBlurred] = useState(true);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="224px"
      loading="lazy"
      decoding="async"
      onLoad={() => setBlurred(false)}
      className={cn("transition-[filter,transform] duration-300", blurred ? "blur-sm" : "blur-0", className)}
      unoptimized
    />
  );
}

/* Case-study architecture diagram — vertical flow on a dark panel,
   thin white lines with subtle orange accents (Express API highlighted
   as the core, orange nodes on every connector). */
function ArchitectureDiagram({ nodes }: { nodes: string[] }) {
  const W = 320;
  const nodeH = 52;
  const gap = 44;
  const H = nodes.length * (nodeH + gap) - gap + 48;
  const cx = W / 2;
  const boxW = 220;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto h-auto w-full max-w-xs"
      role="img"
      aria-label="NextCall system architecture flow"
    >
      {nodes.map((n, i) => {
        const y = 24 + i * (nodeH + gap);
        const isCore = n === "Express API";
        const isLast = i === nodes.length - 1;
        return (
          <g key={n}>
            {i > 0 && (
              <>
                <line
                  x1={cx}
                  y1={y - gap}
                  x2={cx}
                  y2={y - 6}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                />
                <circle cx={cx} cy={y - gap / 2} r="3" fill="#F97316" />
              </>
            )}
            <rect
              x={cx - boxW / 2}
              y={y}
              width={boxW}
              height={nodeH}
              rx="14"
              fill="rgba(255,255,255,0.04)"
              stroke={isCore ? "#F97316" : isLast ? "rgba(249,115,22,0.55)" : "rgba(255,255,255,0.25)"}
              strokeWidth={isCore ? 1.5 : 1}
            />
            <text
              x={cx}
              y={y + nodeH / 2 + 4.5}
              textAnchor="middle"
              fontSize="14"
              fill="#FFFFFF"
              fontWeight="500"
            >
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Case-study intro — heading, subtitle, capability badges, problem/
   solution, tech pills, architecture diagram and feature cards. */
function CaseStudyIntro({ project }: { project: Project }) {
  const cs = project.caseStudy!;
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>{project.date}</span>
        </div>
        {cs.heading && (
          <h3 className="text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl">
            {cs.heading}
          </h3>
        )}
        <p className="text-neutral-500 md:text-lg">{cs.subtitle}</p>
        {cs.capabilities && cs.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {cs.capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded-full border border-neutral-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur"
              >
                {cap}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-[#F5F5F7] p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-neutral-900 uppercase">Problem</h4>
            <p className="text-secondary-foreground mt-2 font-sans text-base leading-relaxed">
              {cs.problem}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-neutral-900 uppercase">Solution</h4>
            <p className="text-secondary-foreground mt-2 font-sans text-base leading-relaxed">
              {cs.solution}
            </p>
          </div>
        </div>
        <div className="pt-6">
          <h3 className="mb-3 text-sm uppercase tracking-wide text-neutral-500">Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {cs.architecture && cs.architecture.length > 0 && (
        <div className="rounded-3xl bg-neutral-950 p-8">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">Architecture</h3>
          <p className="mt-1 text-sm text-neutral-400">How a call flows through the system</p>
          <div className="mt-6">
            <ArchitectureDiagram nodes={cs.architecture} />
          </div>
        </div>
      )}

      {cs.features && cs.features.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm uppercase tracking-wide text-neutral-500">What it does</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {cs.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 transition-[border-color,box-shadow] duration-300 hover:border-neutral-300 hover:shadow-[0_8px_28px_-8px_rgba(234,88,12,0.18)]"
              >
                <h4 className="font-semibold text-neutral-900">{f.title}</h4>
                <p className="mt-1 text-sm text-neutral-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cs.flowText && (
        <div>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-900 uppercase">
            How an order flows
          </h3>
          <p className="text-secondary-foreground font-sans text-base leading-relaxed">
            {cs.flowText}
          </p>
        </div>
      )}
    </div>
  );
}

/* Case-study outro — failure story, outcome cards, engineering
   highlights and the closing statement, composed per project. */
function CaseStudyOutro({ project }: { project: Project }) {
  const cs = project.caseStudy!;
  return (
    <div className="space-y-8">
      {cs.failText && (
        <div>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-900 uppercase">
            When things fail
          </h3>
          <p className="text-secondary-foreground font-sans text-base leading-relaxed">
            {cs.failText}
          </p>
        </div>
      )}

      {cs.outcomeFeatures && cs.outcomeFeatures.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm uppercase tracking-wide text-neutral-500">What it does</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {cs.outcomeFeatures.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 transition-[border-color,box-shadow] duration-300 hover:border-neutral-300 hover:shadow-[0_8px_28px_-8px_rgba(234,88,12,0.18)]"
              >
                <h4 className="font-semibold text-neutral-900">{f.title}</h4>
                <p className="mt-1 text-sm text-neutral-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cs.highlights && cs.highlights.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm uppercase tracking-wide text-neutral-500">Engineering Highlights</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {cs.highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-neutral-200 bg-white p-5 transition-[border-color,box-shadow] duration-300 hover:border-neutral-300 hover:shadow-[0_8px_28px_-8px_rgba(234,88,12,0.18)]"
              >
                <h4 className="font-semibold text-neutral-900">{h.title}</h4>
                <p className="mt-1 text-sm text-neutral-500">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="border-l-2 border-orange-400 pl-4 text-base leading-relaxed text-neutral-700 md:text-lg">
        {cs.closing}
      </p>
    </div>
  );
}

/* The detail content shown inside the expanded modal */
function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-10">
      {project.caseStudy ? (
        <CaseStudyIntro project={project} />
      ) : (
        <div className="rounded-3xl bg-[#F5F5F7] p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>{project.date}</span>
            </div>
            <p className="text-secondary-foreground font-sans text-base leading-relaxed md:text-lg">
              {project.description}
            </p>
            <div className="pt-4">
              <h3 className="mb-3 text-sm uppercase tracking-wide text-neutral-500">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {project.links && project.links.length > 0 && (
        <div className="mb-24">
          <div className="mb-4 flex items-center gap-2 px-6">
            <h3 className="text-sm uppercase tracking-wide text-neutral-500">Links</h3>
            <LinkIcon className="w-4 text-muted-foreground" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {project.links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl bg-[#F5F5F7] p-4 transition-colors hover:bg-[#E5E5E7]"
              >
                <span className="font-light capitalize">{link.name}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      )}

      {project.images && project.images.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {project.images.map((img, i) => (
              <div key={img.src + i} className="space-y-2">
                <p className="px-1 text-sm font-medium tracking-wide text-neutral-500">{img.alt}</p>
                <div
                  className="group/img relative aspect-video cursor-pointer overflow-hidden rounded-2xl"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 900px"
                    className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover/img:scale-105"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.caseStudy && <CaseStudyOutro project={project} />}
    </div>
  );
}

/* A single carousel card — click opens the morphing modal overlay */
function ExpandableCard({
  card,
  index,
  layout = false,
  idPrefix,
}: {
  card: ExpandableCardData;
  index: number;
  layout?: boolean;
  idPrefix: string;
}) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleClose = () => {
    setActive(false);
    onCardClose(index);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    if (active) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useClickOutside(ref, handleClose);

  return (
    <>
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-52 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={ref}
              layoutId={layout ? `${idPrefix}card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white font-sans"
            >
              <div className="sticky top-4 z-52 flex justify-end px-8 pt-8 md:px-14 md:pt-8">
                <button
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/90 shadow-md"
                  onClick={handleClose}
                  aria-label="Close project details"
                >
                  <X className="h-6 w-6 text-neutral-100" />
                </button>
              </div>
              <div className="relative px-8 pt-2 pb-0 md:px-14">
                <motion.p
                  layoutId={layout ? `${idPrefix}category-${card.title}` : undefined}
                  className="text-base font-medium text-black"
                >
                  {card.category}
                </motion.p>
                <motion.p
                  layoutId={layout ? `${idPrefix}title-${card.title}` : undefined}
                  className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl"
                >
                  {card.title}
                </motion.p>
              </div>
              <div className="px-8 pt-8 pb-14 md:px-14">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `${idPrefix}card-${card.title}` : undefined}
        onClick={() => setActive(true)}
        className="relative z-10 flex h-80 w-56 cursor-pointer flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100"
      >
        <div className="absolute inset-x-0 top-0 z-30 h-full cursor-pointer bg-gradient-to-b from-black via-transparent to-transparent" />
        <div className="relative z-40 p-8">
          <motion.p
            layoutId={layout ? `${idPrefix}cat-${card.category}` : undefined}
            className="text-left font-sans text-sm font-medium text-white md:text-base"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `${idPrefix}title-${card.title}` : undefined}
            className="max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl"
          >
            {card.title}
          </motion.p>
        </div>
        <BlurImage src={card.src} alt={card.title} className="absolute inset-0 z-10 object-cover" />
      </motion.button>
    </>
  );
}

/* Horizontal scrolling carousel with arrow controls */
function ExpandableCarousel({ items }: { items: ReactNode[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
      checkScroll();
    }
  }, []);

  const scrollAmount = () => 240;

  return (
    <CarouselContext.Provider
      value={{
        onCardClose: (index) => {
          if (carouselRef.current) {
            carouselRef.current.scrollTo({ left: (224 + 16) * index, behavior: "smooth" });
            setCurrentIndex(index);
          }
        },
        currentIndex,
      }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={carouselRef}
          onScroll={checkScroll}
        >
          <div className="absolute right-0 z-[10] h-auto w-[5%] overflow-hidden bg-gradient-to-l" />
          <div className="mx-auto flex max-w-7xl flex-row justify-start gap-4">
            {items.map((item, idx) => (
              <motion.div
                key={"card" + idx}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 + 0.12 * idx, ease: APPLE_EASE } }}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2 md:mr-20">
          <button
            className="relative z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={() => carouselRef.current?.scrollBy({ left: -scrollAmount(), behavior: "smooth" })}
            disabled={!canScrollLeft}
            aria-label="Scroll projects left"
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={() => carouselRef.current?.scrollBy({ left: scrollAmount(), behavior: "smooth" })}
            disabled={!canScrollRight}
            aria-label="Scroll projects right"
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export function ProjectsCard() {
  const idPrefix = useId();
  const cards: ExpandableCardData[] = projects.map((p) => ({
    category: p.category,
    title: p.title,
    src: p.src,
    content: <ProjectDetail project={p} />,
  }));
  const items = cards.map((card, idx) => (
    <ExpandableCard key={card.title + idx} card={card} index={idx} layout idPrefix={idPrefix} />
  ));
  return (
    <div className="h-full w-full pt-8" data-lens="true">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: APPLE_EASE }}
        className="mx-auto max-w-7xl font-sans text-xl font-bold text-neutral-800 md:text-3xl"
      >
        My Projects
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.6, ease: APPLE_EASE }}
        className="mx-auto max-w-7xl px-2 pt-3 text-sm leading-relaxed text-neutral-500 md:text-base"
      >
        Four products, all built end to end. An AI receptionist platform, the multi vendor commerce
        API that taught me how money moves, the lead engine that feeds NextCall, and a real time
        storefront. Open any card for the problem, the architecture and the full build.
      </motion.p>
      <ExpandableCarousel items={items} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skills — GitHub-repo-style cards: neutral background, subtle border, */
/* bold skill name, gray description, and a meta row with proficiency. */
/* Same cascade rhythm: container scales in, categories stagger, cards */
/* rise in with their own stagger.                                    */
/* ------------------------------------------------------------------ */

export function SkillsCard() {
  const categoryVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: APPLE_EASE } },
  };
  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: APPLE_EASE }}
      className="mx-auto w-full max-w-5xl"
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: APPLE_EASE }}
        className="text-primary mb-8 px-2 text-3xl font-bold md:text-4xl"
      >
        Core Technologies
      </motion.h2>
      <motion.div
        className="space-y-10 px-2 pb-4"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
        initial="hidden"
        animate="visible"
      >
        {skillCategories.map((cat, catIdx) => (
          <motion.section
            key={cat.category}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.05 + catIdx * 0.08, ease: APPLE_EASE }}
            className="space-y-4"
          >
            <div className="space-y-1 px-1">
              <h3 className="text-accent-foreground text-lg font-semibold">{cat.category}</h3>
              <p className="text-sm text-neutral-500">{cat.note}</p>
            </div>
            <motion.div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={cardsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
            >
              {cat.skills.map((skill) => {
                const Icon = SKILL_ICONS[skill.icon];
                return (
                  <motion.article
                    key={skill.name}
                    variants={cardVariants}
                    whileHover={{ y: -4, transition: { duration: 0.25, ease: APPLE_EASE } }}
                    className="group flex h-full flex-col items-center rounded-xl border border-neutral-200 bg-white p-4 text-center transition-[border-color,box-shadow] duration-300 hover:border-neutral-300 hover:shadow-[0_8px_28px_-8px_rgba(2,113,227,0.25)]"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                      <Icon className="h-4 w-4 text-[#0171E3] transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <h4 className="font-semibold text-neutral-900">{skill.name}</h4>
                    <p className="mt-0.5 text-sm text-neutral-500">{skill.subtitle}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </motion.section>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Presentation — "Me" card, two-column layout like the reference:     */
/* avatar scales up from .92 over 0.8s with the Apple ease curve,      */
/* then the name, bio (+0.2s) and chips (+0.6s) cascade in             */
/* ------------------------------------------------------------------ */

export function PresentationCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-5xl py-6 font-sans"
    >
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* Avatar column — minimal neutral portrait, flat */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] sm:max-w-[340px]">
          {/* The squircle portrait — quiet neutral gradient */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: APPLE_EASE }}
            className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#FAFAFB] to-[#EFEFF2]"
          >
            <Image
              src={presentation.avatar}
              alt={presentation.fullName}
              width={451}
              height={536}
              priority
              className="h-full w-full object-cover object-top"
              unoptimized
            />
          </motion.div>

          {/* Status — quiet black badge anchored bottom-right */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: APPLE_EASE, delay: 0.55 }}
            className="absolute -right-2 bottom-6 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-neutral-900" />
            <span className="text-xs font-medium text-neutral-900">Open to work</span>
          </motion.div>
        </div>

        {/* Text column — staggered reveal */}
        <div className="flex flex-col">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: APPLE_EASE, delay: 0.25 } },
            }}
          >
            <p className="text-muted-foreground mb-2 text-[11px] font-medium tracking-widest uppercase">
              What I Build
            </p>
            <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-3xl">
              {presentation.fullName}
            </h1>
            <div className="mt-1">
              <p className="text-muted-foreground text-sm">{presentation.subtitle}</p>
            </div>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: APPLE_EASE, delay: 0.45 } },
            }}
            className="text-foreground mt-6 text-justify leading-relaxed whitespace-pre-line"
          >
            {presentation.intro}
          </motion.p>

          {/* Chips — desktop: beside the photo. On mobile they move below
              the story section so the paragraphs read as one flow. */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delayChildren: 0.65, staggerChildren: 0.07 } },
            }}
            className="mt-6 hidden flex-wrap gap-2 md:flex"
          >
            {presentation.chips.map((chip) => (
              <motion.span
                key={chip}
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 8 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: APPLE_EASE } },
                }}
                className="text-muted-foreground rounded-full border border-border px-3 py-1 text-sm"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* The rest of the story — clean section under the grid, closing
          with the signature line as plain body text. Reveals smoothly as user scrolls. */}
      <ScrollReveal y={24} className="mt-6 md:mt-12 md:border-t md:border-border md:pt-8">
        {/* What I specialize in — minimal bulleted list, same quiet style */}
        <div className="max-w-2xl">
          <p className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            What I specialize in
          </p>
          <ul className="mt-4 space-y-2.5">
            {presentation.specialties.map((s, idx) => (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.08, ease: APPLE_EASE }}
                className="text-foreground flex items-center gap-2.5 text-sm leading-relaxed md:text-base"
              >
                <span className="bg-[#0171E3] h-1.5 w-1.5 shrink-0 rounded-full" />
                {s}
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="text-foreground mt-5 max-w-2xl text-justify leading-relaxed">
          {presentation.punchline}
        </p>
      </ScrollReveal>

      {/* Chips — mobile-only: after the story, before the fact sheet */}
      <ScrollReveal className="mt-8 flex flex-wrap gap-2 md:hidden">
        {presentation.chips.map((chip, idx) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: APPLE_EASE }}
            className="text-muted-foreground rounded-full border border-border px-3 py-1 text-sm"
          >
            {chip}
          </motion.span>
        ))}
      </ScrollReveal>

      {/* Fact sheet — quiet spec strip. Reveals as you scroll down */}
      <ScrollReveal y={20} className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 md:border-t md:border-border md:pt-8 lg:grid-cols-3">
        {presentation.facts.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.55, ease: APPLE_EASE }}
          >
            <p className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
              {f.label}
            </p>
            <p className="text-foreground mt-1.5 text-sm font-medium">{f.value}</p>
          </motion.div>
        ))}
      </ScrollReveal>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Contact — minimal, eye-catching: big invite headline, a giant       */
/* email link, and social link cards (GitHub / Instagram / LinkedIn    */
/* placeholder). Every link is a real <a>, so visitors actually land   */
/* on the profile.                                                     */
/* ------------------------------------------------------------------ */

const socialHandles: Record<string, string> = {
  GitHub: "@eabrahim3666-coder",
  Instagram: "@em0n36",
  LinkedIn: "Coming soon",
};

const BUDGET_OPTIONS = ["Under $500", "$500 to $2,000", "$2,000 to $5,000", "$5,000+", "Not sure yet"];
const TIMELINE_OPTIONS = ["As soon as possible", "In the next month", "Flexible, quality first"];

const CONTACT_INPUT_CLS =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export function ContactCard() {
  const [form, setForm] = useState({ name: "", email: "", message: "", budget: "", timeline: "" });
  const [sent, setSent] = useState(false);

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Project inquiry from ${form.name || "a visitor"}`;
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Project: ${form.message}`,
      form.budget ? `Budget: ${form.budget}` : "",
      form.timeline ? `Timeline: ${form.timeline}` : "",
    ].filter(Boolean);
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: APPLE_EASE }}
      className="mx-auto mt-2 w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: APPLE_EASE }}
        className="bg-accent w-full overflow-hidden rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12"
      >
        {/* Invite headline */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: APPLE_EASE }}
            className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Let&rsquo;s build something.
          </motion.h2>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground text-sm"
          >
            Have a project in mind? My inbox is open.
          </motion.span>
        </div>

        {/* Giant email link */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: APPLE_EASE }}
          className="mt-8 md:mt-10"
        >
          <a
            href={`mailto:${brand.email}`}
            className="group inline-flex flex-wrap items-center gap-2 text-xl font-medium text-blue-500 hover:underline sm:text-2xl md:text-3xl"
          >
            {brand.email}
            <Mail className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 sm:h-6 sm:w-6" />
          </a>
          <p className="text-muted-foreground mt-3 text-sm">
            Prefer a real conversation? Book a free 20 minute intro call, link below.
          </p>
        </motion.div>

        {/* Project inquiry form — three fields and a click, delivers via email */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: APPLE_EASE }}
          className="mt-8 rounded-2xl border border-neutral-200/70 bg-white p-6 md:mt-10 md:p-8"
        >
          <h3 className="text-foreground text-lg font-semibold tracking-tight">
            Tell me about your project
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Three fields, one click. You will hear back within 24 hours with questions or a quote.
          </p>

          {sent ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: APPLE_EASE }}
              className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-800"
            >
              Got it 👍 Your project landed in my inbox. Expect a reply within 24 hours, usually much
              faster.
            </motion.p>
          ) : (
            <form onSubmit={submitProject} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="pf-name" className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                    Your name
                  </label>
                  <input
                    id="pf-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Carter"
                    className={CONTACT_INPUT_CLS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pf-email" className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                    Email
                  </label>
                  <input
                    id="pf-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@company.com"
                    className={CONTACT_INPUT_CLS}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pf-message" className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                  What are you building?
                </label>
                <textarea
                  id="pf-message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="A few lines are enough. What does it do, who is it for, and what problem should I solve first?"
                  className={cn(CONTACT_INPUT_CLS, "resize-none")}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="pf-budget" className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                    Budget range
                  </label>
                  <select
                    id="pf-budget"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className={CONTACT_INPUT_CLS}
                  >
                    <option value="">Select a range</option>
                    {BUDGET_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pf-timeline" className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
                    When do you need it?
                  </label>
                  <select
                    id="pf-timeline"
                    value={form.timeline}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    className={CONTACT_INPUT_CLS}
                  >
                    <option value="">Optional</option>
                    {TIMELINE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600"
                >
                  Send my project
                </button>
                <p className="text-muted-foreground mt-3 text-xs">
                  No newsletters, no spam. Your details stay between us.
                </p>
              </div>
            </form>
          )}
        </motion.div>

        {/* Social link cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
          }}
          className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-10"
        >
          {brand.socials.map((s) => {
            const isPlaceholder = !s.url;
            const inner = (
              <>
                <div className="space-y-0.5">
                  <p className="text-neutral-900 text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-neutral-500">{socialHandles[s.name] ?? s.name}</p>
                </div>
                {isPlaceholder ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                ) : (
                  <LinkIcon className="text-neutral-400 transition-all duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-hover/link:text-neutral-700 h-4 w-4" />
                )}
              </>
            );
            const cls = cn(
              "group/link flex items-center justify-between rounded-xl border bg-white p-4 transition-colors duration-300",
              isPlaceholder
                ? "border-dashed border-neutral-200 opacity-60"
                : "border-neutral-200 hover:border-neutral-400",
            );
            return (
              <motion.div
                key={s.name}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: APPLE_EASE } },
                }}
              >
                {isPlaceholder ? (
                  <div className={cls} title="LinkedIn profile coming soon">
                    {inner}
                  </div>
                ) : (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* How we start — quiet 3-step strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-10 border-t border-neutral-200/70 pt-8"
        >
          <p className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            How we start
          </p>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
            {[
              { step: "01", title: "Send your project brief", desc: "The form above or a plain email, whatever is easier for you." },
              { step: "02", title: "Get a clear quote", desc: "Scope, timeline and price — back in your inbox within 24 hours." },
              { step: "03", title: "I start building", desc: "With progress updates you never have to chase." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.5, ease: APPLE_EASE }}
                className="space-y-1"
              >
                <p className="text-xs font-semibold tracking-widest text-blue-500">{s.step}</p>
                <p className="text-foreground text-sm font-medium">{s.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Availability bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5, ease: APPLE_EASE }}
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-neutral-200/70 bg-white px-5 py-4"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-foreground text-sm font-medium">Available for new projects</span>
          </span>
          <span className="bg-border hidden h-1 w-1 rounded-full sm:block" />
          <span className="text-muted-foreground text-sm">Replies within 24 hours</span>
          <span className="bg-border hidden h-1 w-1 rounded-full sm:block" />
          <span className="text-muted-foreground text-sm">Barishal, Bangladesh · GMT+6</span>
        </motion.div>

        {/* Bottom blurb */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-muted-foreground mt-8 px-2 text-center text-sm"
        >
          Form, email or a quick call 👇 Pick whatever feels easiest. All roads reach the same inbox.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — minimal accordion: bordered list, chevron rotates, answer     */
/* expands with the shared Apple ease. Client questions, pre-answered. */
/* ------------------------------------------------------------------ */

export function FaqCard() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: APPLE_EASE }}
      className="mx-auto w-full max-w-5xl"
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: APPLE_EASE }}
        className="text-primary mb-2 px-2 text-3xl font-bold md:text-4xl"
      >
        Frequently Asked Questions
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-8 px-2 text-sm text-neutral-500"
      >
        The questions clients ask most, answered straight. Quotes, timelines, ownership and what
        working with me actually looks like.
      </motion.p>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-6"
      >
        {faq.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={item.q}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
              }}
              className={cn("border-b border-neutral-100", i === faq.length - 1 && "border-b-0")}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-neutral-900 text-sm font-medium sm:text-base">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "text-neutral-400 h-4 w-4 shrink-0 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: APPLE_EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-8 text-sm leading-relaxed text-neutral-500">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 px-2 text-center text-sm text-neutral-500"
      >
        Quotes, process and ownership, all covered above 👇 If your question is not here, email me and
        you will hear back within 24 hours.
      </motion.p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Router                                                               */
/* ------------------------------------------------------------------ */

export type ToolName = "projects" | "skills" | "presentation" | "faq" | "contact";

/* Memoized: the parent re-renders on every typing tick — the heavy
   cards (carousel, images) must not re-render with it. Their props
   (`name`) never change for a given turn, so memo skips them entirely. */
export const ToolCard = memo(function ToolCard({ name }: { name: ToolName }) {
  switch (name) {
    case "projects":
      return <ProjectsCard />;
    case "skills":
      return <SkillsCard />;
    case "presentation":
      return <PresentationCard />;
    case "faq":
      return <FaqCard />;
    case "contact":
      return <ContactCard />;
    default:
      return null;
  }
});

export const toolIcons = { Briefcase, Layers, UserRoundSearch, Laugh };
