"use client";

import { useState } from "react";
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
  ArrowUpRight,
  CalendarDays,
  Youtube,
  X,
} from "lucide-react";
import { brand, presentation, projects, skillCategories, funFacts } from "@/lib/persona";

/* ------------------------------------------------------------------ */
/* Projects — grid of clickable cards + detail view                    */
/* ------------------------------------------------------------------ */

function ProjectDetail({ project, onBack }: { project: (typeof projects)[number]; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm transition-colors"
      >
        ← Back to all projects
      </button>

      <div className="rounded-3xl bg-[#F5F5F7] p-6 sm:p-8 dark:bg-[#1D1D1F]">
        <div className="space-y-6">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4" />
            <span>{project.date}</span>
          </div>
          <h3 className="text-2xl font-semibold sm:text-3xl">{project.title}</h3>
          <p className="text-secondary-foreground text-base leading-relaxed md:text-lg">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {project.links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/70 group inline-flex items-center gap-1 text-sm font-medium"
              >
                {link.name}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {project.images.map((img, i) => (
          <button
            key={img.src + i}
            onClick={() => window.open(img.src, "_blank", "noopener,noreferrer")}
            className="relative aspect-video cursor-pointer overflow-hidden rounded-2xl"
          >
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" unoptimized />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function ProjectsCard() {
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="mx-auto w-full"
    >
      <AnimatePresence mode="wait">
        {selected ? (
          <ProjectDetail key="detail" project={selected} onBack={() => setSelected(null)} />
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <h2 className="text-foreground mb-4 text-2xl font-semibold md:text-3xl">My Projects</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
              {projects.map((p, idx) => (
                <motion.button
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(p)}
                  className="group bg-card text-card-foreground cursor-pointer rounded-2xl border p-3 text-left shadow-sm transition-all hover:shadow-md md:p-4"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-muted">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].src}
                        alt={p.images[0].alt}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">{p.category}</p>
                  <p className="flex items-center justify-between text-sm font-semibold">
                    {p.title}
                    <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Skills — category cards with colored chips                          */
/* ------------------------------------------------------------------ */

export function SkillsCard() {
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="mx-auto w-full"
    >
      <h2 className="text-foreground mb-4 text-2xl font-semibold md:text-3xl">My Skills</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {skillCategories.map((cat, idx) => {
          const icons = {
            "Frontend Development": Layers,
            "Backend & Systems": Briefcase,
            "AI & Fullstack Engineering": Sparkles,
            "Design & Creative Tools": Sparkles,
            "Soft Skills": Laugh,
          };
          const Icon = icons[cat.category as keyof typeof icons] ?? Layers;
          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-card rounded-3xl border p-5 shadow-sm sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <Icon className="text-foreground h-5 w-5" />
                <h3 className="text-foreground text-base font-semibold">{cat.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((s) => (
                  <span key={s} className={`rounded-full px-3 py-1 text-xs font-medium ${cat.color}`}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Presentation — profile card with live badge                         */
/* ------------------------------------------------------------------ */

export function PresentationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-accent mx-auto mt-2 w-full rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-12"
    >
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted h-16 w-16 overflow-hidden rounded-full shadow-md">
            <Image src={presentation.avatar} alt={presentation.fullName} width={64} height={64} className="h-full w-full object-cover" unoptimized />
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-semibold">{presentation.fullName}</h2>
            <p className="text-muted-foreground text-sm">{presentation.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:mt-0">
          <span className="flex items-center gap-1 rounded-full border border-green-500 px-3 py-0.5 text-sm font-medium text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live
          </span>
        </div>
      </div>
      <p className="text-accent-foreground mb-6 text-base leading-relaxed">{presentation.text}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {presentation.facts.map((f) => {
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
            <div key={f.label} className="flex items-start gap-3">
              <Icon className="text-foreground mt-0.5 h-5 w-5" />
              <div>
                <p className="text-foreground text-sm font-medium">{f.label}</p>
                <p className="text-muted-foreground text-sm">{f.value}</p>
              </div>
            </div>
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
    <div className="mx-auto mt-2 w-full">
      <div className="bg-accent w-full overflow-hidden rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-foreground text-3xl font-semibold md:text-4xl">Contacts</h2>
          <span className="text-muted-foreground mt-2 text-sm sm:mt-0">@{brand.name}</span>
        </div>
        <div className="mt-8 flex flex-col md:mt-10">
          <div className="group mb-5 cursor-pointer" onClick={() => open(`mailto:${brand.email}`)}>
            <div className="flex items-center gap-1">
              <span className="hover:underline text-base font-medium text-blue-500 sm:text-lg">
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </span>
              <Mail className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8">
            {brand.socials.map((s) => (
              <button
                key={s.name}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors"
                onClick={() => open(s.url)}
                title={s.name}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fun — Mont Blanc adventure card with photo lightbox                 */
/* ------------------------------------------------------------------ */

export function FunCard() {
  const [lightbox, setLightbox] = useState(false);
  return (
    <div className="mx-auto w-full">
      <div className="mb-4">
        <h2 className="text-foreground text-3xl font-semibold md:text-4xl">{funFacts.title}</h2>
      </div>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="bg-accent w-full cursor-pointer overflow-hidden rounded-3xl"
        onClick={() => setLightbox(true)}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={funFacts.photo.src}
            alt={funFacts.photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
            unoptimized
          />
        </div>
      </motion.div>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{funFacts.text}</p>
      <button
        onClick={() => window.open(funFacts.video, "_blank", "noopener,noreferrer")}
        className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-red-500 hover:underline"
      >
        <Youtube className="h-5 w-5" />
        Watch the adventure on YouTube
      </button>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4"
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Router                                                               */
/* ------------------------------------------------------------------ */

export type ToolName = "projects" | "skills" | "presentation" | "fun" | "contact";

export function ToolCard({ name }: { name: ToolName }) {
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
}

export const toolIcons = { Briefcase, Layers, PartyPopper, UserRoundSearch, Laugh };
