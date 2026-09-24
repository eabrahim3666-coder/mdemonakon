"use client";

import { createContext, useContext, useEffect, useId, memo, useRef, useState } from "react";
import type { ReactNode, RefObject, SVGProps } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Layers,
  PartyPopper,
  UserRoundSearch,
  Laugh,
  ChevronRight,
  Mail,
  MapPin,
  GraduationCap,
  Building2,
  Bike,
  Sparkles,
  Youtube,
  X,
  Link as LinkIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { brand, presentation, projects, skillCategories, funFacts, type Project } from "@/lib/persona";

/* Apple-style ease curve used across the reference site — one shared rhythm
   so every card entrance feels like the same cinematic "voice" */
const APPLE_EASE = [0.19, 1, 0.22, 1] as const;

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

/* The detail content shown inside the expanded modal */
function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-10">
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
          <div className="grid grid-cols-1 gap-4">
            {project.images.map((img, i) => (
              <div
                key={img.src + i}
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
            ))}
          </div>
        </div>
      )}
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
      <ExpandableCarousel items={items} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skills — vertical cascade like the reference: container scales in   */
/* (0.98→1, Apple ease), categories stagger at 0.1s intervals, and     */
/* each category's chips pop in (scale .9→1) with their own stagger    */
/* ------------------------------------------------------------------ */

export function SkillsCard() {
  const categoryVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: APPLE_EASE } },
  };
  const chipsContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const chipVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
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
        Skills &amp; Expertise
      </motion.h2>
      <motion.div
        className="space-y-8 px-2"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
        initial="hidden"
        animate="visible"
      >
        {skillCategories.map((cat) => {
          const icons = {
            "Frontend Development": Layers,
            "Backend & Systems": Briefcase,
            "AI & Fullstack Engineering": Sparkles,
            "Design & Creative Tools": Sparkles,
            "Soft Skills": Laugh,
          };
          const Icon = icons[cat.category as keyof typeof icons] ?? Layers;
          return (
            <motion.div key={cat.category} variants={categoryVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="text-foreground h-5 w-5" />
                <h3 className="text-accent-foreground text-lg font-semibold">{cat.category}</h3>
              </div>
              <motion.div
                className="flex flex-wrap gap-2"
                variants={chipsContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {cat.skills.map((s) => (
                  <motion.span
                    key={s}
                    variants={chipVariants}
                    whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                    className={`rounded-full border px-3 py-1.5 font-normal ${cat.color}`}
                  >
                    {s}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Presentation — "Me" card, two-column layout like the reference:     */
/* avatar scales up from .92 over 0.8s with the Apple ease curve,      */
/* then the name, bio (+0.2s) and chips (+0.6s) cascade in             */
/* ------------------------------------------------------------------ */

const presentationChips = ["AI", "Developer", "42 Paris", "Sport", "SaaS Builder"];

export function PresentationCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-5xl py-6 font-sans"
    >
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        {/* Avatar column — editorial ARCH portrait: the bust floats on a
            misty blue gradient inside a rounded-top arch, with a deep-blue
            gradient arch ring offset behind for layered depth */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px] sm:max-w-[340px]">
          {/* Deep blue gradient arch — offset behind (the halo layer) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: APPLE_EASE, delay: 0.1 }}
            aria-hidden
            className="absolute inset-0 translate-x-3 translate-y-4 rounded-t-full rounded-b-[2rem] bg-gradient-to-br from-[#0A2A6B] via-[#1D4ED8] to-[#0171E3] opacity-90"
          />

          {/* The arch portrait — soft misty gradient with the cutout bust */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: APPLE_EASE }}
            className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-[2rem] bg-gradient-to-b from-[#F3F7FF] via-[#E9F0FC] to-[#DCE8FA] shadow-[0_24px_48px_-18px_rgba(10,42,107,0.35)]"
          >
            <Image
              src={presentation.avatar}
              alt={presentation.fullName}
              width={451}
              height={536}
              priority
              className="h-full w-full object-cover object-top drop-shadow-[0_18px_28px_rgba(10,42,107,0.28)]"
              unoptimized
            />
          </motion.div>

          {/* Status chip — small badge anchored bottom-right of the arch */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: APPLE_EASE, delay: 0.55 }}
            className="absolute -right-2 bottom-6 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0171E3] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0171E3]" />
            </span>
            <span className="text-xs font-semibold text-[#0A2A6B]">Open to work</span>
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
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-xl font-semibold text-transparent md:text-3xl">
              {presentation.fullName}
            </h1>
            <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
              <p className="text-muted-foreground text-sm">21 years old</p>
              <div className="bg-border hidden h-1.5 w-1.5 rounded-full md:block" />
              <p className="text-muted-foreground text-sm">Paris, France</p>
            </div>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: APPLE_EASE, delay: 0.45 } },
            }}
            className="text-foreground mt-6 leading-relaxed whitespace-pre-line"
          >
            {"Hey \uD83D\uDC4B\nI'm Raphael, also known as Aaaaby. I'm a developer specializing in AI at 42 Paris, currently working at LightOn AI. I'm passionate about AI, tech, entrepreneurship and SaaS."}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delayChildren: 0.65, staggerChildren: 0.07 } },
            }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {presentationChips.map((chip) => (
              <motion.span
                key={chip}
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: 8 },
                  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: APPLE_EASE } },
                }}
                className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Fact sheet — final wave of the cinematic cascade */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {presentation.facts.map((f, i) => {
          const icons = {
            "Based in": MapPin,
            Studies: GraduationCap,
            Internship: Building2,
            Focus: Sparkles,
            Previously: Bike,
            "Open to": Briefcase,
          };
          const Icon = icons[f.label as keyof typeof icons] ?? Sparkles;
          return (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.09, duration: 0.5, ease: APPLE_EASE }}
              className="bg-accent flex items-start gap-3 rounded-2xl p-4"
            >
              <Icon className="text-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="text-foreground text-sm font-medium">{f.label}</p>
                <p className="text-muted-foreground text-sm">{f.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Contact — big card with email + socials                             */
/* ------------------------------------------------------------------ */

export function ContactCard() {
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-foreground text-3xl font-semibold md:text-4xl">Contacts</h2>
          <span className="text-muted-foreground mt-2 text-sm sm:mt-0">@{brand.name}</span>
        </div>
        <div className="mt-8 flex flex-col md:mt-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: APPLE_EASE }}
            className="group mb-5 cursor-pointer"
            onClick={() => open(`mailto:${brand.email}`)}
          >
            <div className="flex items-center gap-1">
              <span className="hover:underline text-base font-medium text-blue-500 sm:text-lg">
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </span>
              <Mail className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delayChildren: 0.6, staggerChildren: 0.06 } },
            }}
            className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8"
          >
            {brand.socials.map((s) => (
              <motion.button
                key={s.name}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: APPLE_EASE } },
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors"
                onClick={() => open(s.url)}
                title={s.name}
              >
                {s.name}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Fun — Mont Blanc adventure card: title rises in, photo scales up,   */
/* caption overlays on hover, lightbox on click                        */
/* ------------------------------------------------------------------ */

export function FunCard() {
  const [lightbox, setLightbox] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: APPLE_EASE, delay: 0.05 }}
        className="mb-8"
      >
        <h2 className="text-foreground text-3xl font-semibold md:text-4xl">{funFacts.title}</h2>
      </motion.div>
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.9, ease: APPLE_EASE }}
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl"
        whileHover={{ scale: 1.02 }}
        onClick={() => setLightbox(true)}
      >
        <Image
          src={funFacts.photo.src}
          alt={funFacts.photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          className="h-full w-full object-cover transition-transform"
          unoptimized
        />
        {funFacts.photo.caption && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-end bg-black/30 p-4"
          >
            <p className="text-sm font-medium text-white sm:text-base">{funFacts.photo.caption}</p>
          </motion.div>
        )}
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease: APPLE_EASE }}
        className="text-muted-foreground mt-4 text-sm leading-relaxed"
      >
        {funFacts.text}
      </motion.p>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95, duration: 0.5 }}
        onClick={() => window.open(funFacts.video, "_blank", "noopener,noreferrer")}
        className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-red-500 hover:underline"
      >
        <Youtube className="h-5 w-5" />
        Watch the adventure on YouTube
      </motion.button>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
          >
            <div className="relative max-h-[85vh] max-w-[90vw]">
              <Image
                src={funFacts.photo.src}
                alt={funFacts.photo.alt}
                width={1200}
                height={900}
                className="max-h-[85vh] w-auto max-w-[90vw] rounded-xl object-contain"
                unoptimized
              />
              <button className="absolute top-3 right-3 cursor-pointer rounded-full bg-black/70 p-2 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Router                                                               */
/* ------------------------------------------------------------------ */

export type ToolName = "projects" | "skills" | "presentation" | "fun" | "contact";

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
    case "fun":
      return <FunCard />;
    case "contact":
      return <ContactCard />;
    default:
      return null;
  }
});

export const toolIcons = { Briefcase, Layers, PartyPopper, UserRoundSearch, Laugh };
