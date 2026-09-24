"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Laugh, Briefcase, Layers, PartyPopper, UserRoundSearch, ArrowRight, X, Rocket } from "lucide-react";
import { brand } from "@/lib/persona";

interface LandingViewProps {
  onAsk: (question: string) => void;
}

const quickActions = [
  { label: "Me", icon: Laugh, color: "#329696" },
  { label: "Projects", icon: Briefcase, color: "#3E9858" },
  { label: "Skills", icon: Layers, color: "#856ED9" },
  { label: "Fun", icon: PartyPopper, color: "#B95F9D" },
  { label: "Contact", icon: UserRoundSearch, color: "#C19433" },
];

const quickQueries: Record<string, string> = {
  Me: "Who are you? I want to know more about you.",
  Projects: "What are your projects? What are you working on right now?",
  Skills: "What are your skills? Give me a list of your soft and hard skills.",
  Fun: "What's the craziest thing you've ever done? What are your hobbies?",
  Contact: "How can I contact you?",
};

export function LandingView({ onAsk }: LandingViewProps) {
  const [question, setQuestion] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  // First-visit welcome popup (same UX as the reference site)
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!localStorage.getItem("welcome-dismissed");
    } catch {
      dismissed = true; // private mode — don't nag
    }
    if (!dismissed) {
      const t = setTimeout(() => setShowWelcome(true), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem("welcome-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = question.trim();
    if (q) {
      onAsk(q);
      setQuestion("");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-10 md:pb-20">
      {/* Giant watermark */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          className="hidden bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[10rem] leading-none font-black text-transparent select-none sm:block lg:text-[16rem]"
          style={{ marginBottom: "-2.5rem" }}
        >
          {brand.watermark}
        </div>
      </div>

      {/* Fastfolio floating CTA */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="group fixed top-8 left-6 z-51 flex cursor-pointer items-center gap-2 rounded-full border bg-transparent px-4 py-2.5 backdrop-blur-2xl transition-all duration-300 hover:shadow-xl"
        tabIndex={0}
        onClick={() =>
          window.open("https://fastfol.io?utm_source=portfolio&utm_medium=floating_cta", "_blank", "noopener,noreferrer")
        }
      >
        <Image
          alt="Fastfolio"
          loading="lazy"
          width={24}
          height={24}
          decoding="async"
          className="object-contain"
          style={{ color: "transparent" }}
          src="/fastfolio-logo.png"
          unoptimized
        />
        <span className="hidden text-sm font-medium text-foreground sm:inline">Build your AI portfolio</span>
        <span className="text-sm font-medium text-foreground sm:hidden">Build yours</span>
        <ChevronRight className="group-hover:translate-x-0.5 hidden h-4 w-4 transition-transform sm:block" />
      </motion.button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className="z-1 mt-24 mb-8 flex flex-col items-center text-center md:mt-4 md:mb-12"
      >
        <div className="z-100">
          <button
            data-slot="button"
            className="inline-flex h-auto w-auto cursor-pointer items-center justify-center rounded-2xl bg-white/30 p-3 shadow-lg backdrop-blur-lg transition-all hover:bg-white/60 focus-visible:ring-0 focus-visible:bg-transparent focus-visible:ring-offset-0"
            onClick={() => onAsk("Who are you? Tell me about yourself")}
            aria-label={`About ${brand.name}`}
          >
            <Image
              alt="Logo"
              loading="lazy"
              width={100}
              height={100}
              decoding="async"
              className="w-6 md:w-8"
              style={{ color: "transparent" }}
              src="/logo-toukoum.svg"
              unoptimized
            />
            <span className="sr-only">About {brand.name}</span>
          </button>
        </div>
        <h2 className="text-secondary-foreground mt-1 text-xl font-semibold md:text-2xl">{brand.greeting}</h2>
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">{brand.role}</h1>
      </motion.div>

      {/* Memoji */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 h-52 w-48 overflow-hidden sm:h-72 sm:w-72"
      >
        <Image
          alt="Hero memoji"
          width={2000}
          height={2000}
          decoding="async"
          priority
          className="translate-y-14 scale-[2] object-cover"
          style={{ color: "transparent" }}
          src="/landing-memojis.png"
          unoptimized
        />
      </motion.div>

      {/* Ask input + quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
        className="z-10 mt-4 flex w-full flex-col items-center justify-center md:px-0"
      >
        <form className="relative w-full max-w-lg" onSubmit={submit}>
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-white/30 py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all hover:border-neutral-300">
            <input
              type="text"
              placeholder="Ask me anything…"
              className="placeholder:text-neutral-500 focus:outline-none w-full border-none bg-transparent text-base text-neutral-800"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="mt-4 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {quickActions.map((action, idx) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + idx * 0.07, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              whileTap={{ scale: 0.95 }}
              data-slot="button"
              className="border-border hover:bg-border/30 bg-card/30 aspect-square w-full cursor-pointer rounded-2xl border py-8 shadow-none backdrop-blur-lg md:p-10"
              onClick={() => onAsk(quickQueries[action.label])}
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-700">
                <action.icon width={22} height={22} color={action.color} strokeWidth={2} />
                <span className="text-xs font-medium sm:text-sm">{action.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Welcome popup (first visit) */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={dismissWelcome}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between">
                <h3 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <Rocket className="h-6 w-6" />
                  Welcome to AI Portfolio
                </h3>
                <button
                  onClick={dismissWelcome}
                  className="cursor-pointer rounded-full bg-black p-2 text-white hover:bg-black/90"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <section className="bg-accent w-full space-y-3 rounded-2xl p-6">
                  <h4 className="text-primary text-lg font-semibold">What&apos;s this?</h4>
                  <p className="text-accent-foreground text-sm leading-relaxed">
                    I&apos;m so excited to present my <strong>brand new AI Portfolio.</strong>
                    <br />
                    Whether you&apos;re a recruiter, a friend, family member, or just curious, feel free to ask
                    anything you want!
                  </p>
                </section>
                <section className="bg-accent w-full space-y-3 rounded-2xl p-6">
                  <h4 className="text-primary text-lg font-semibold">Why an AI portfolio?</h4>
                  <p className="text-accent-foreground text-sm leading-relaxed">
                    Traditional portfolios can be limiting.
                    <br />
                    They can&apos;t adapt to every visitor&apos;s specific needs.
                    <br />
                    My portfolio becomes <strong>exactly what you&apos;re interested in</strong> knowing about me —
                    on demand.
                  </p>
                </section>
              </div>
              <button
                onClick={dismissWelcome}
                className="mt-6 w-full cursor-pointer rounded-full bg-[#0171E3] py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Let&apos;s chat!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
