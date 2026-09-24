"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Laugh, Briefcase, Layers, PartyPopper, UserRoundSearch, ArrowRight, X, Rocket } from "lucide-react";
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
      /* After the cinematic boot reveal finishes, so the popup never
         competes with the loading-screen exit + content entrance */
      const t = setTimeout(() => setShowWelcome(true), 1600);
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
      {/* Giant watermark — fades in slowly behind everything */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
          className="hidden bg-gradient-to-b from-[#0A2A6B]/[0.09] to-[#0A2A6B]/0 bg-clip-text text-[10rem] leading-none font-black text-transparent select-none sm:block lg:text-[16rem]"
          style={{ marginBottom: "-2.5rem" }}
        >
          {brand.watermark}
        </motion.div>
      </div>

      {/* Hero — drifts down INTO FOCUS after the curtain lifts */}
      <motion.div
        initial={{ opacity: 0, y: -60, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.3, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
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
        <h1 className="bg-gradient-to-r from-[#0A2A6B] via-[#1D4ED8] to-[#0171E3] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
          {brand.role}
        </h1>
      </motion.div>

      {/* Avatar face — transparent cutout, scales up out of blur */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.55, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10"
      >
        <Image
          alt={`${brand.name} — avatar`}
          width={789}
          height={1000}
          decoding="async"
          priority
          className="h-56 w-auto object-contain drop-shadow-[0_24px_36px_rgba(0,0,0,0.20)] sm:h-72 md:h-96"
          style={{ color: "transparent" }}
          src="/avatar-face.png"
          unoptimized
        />
      </motion.div>

      {/* Ask input + quick actions — rises into focus last */}
      <motion.div
        initial={{ opacity: 0, y: 80, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.8, duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
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
              className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#0171E3] to-[#0A2A6B] p-2.5 text-white transition-all hover:brightness-110 disabled:opacity-70"
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
              transition={{ delay: 0.95 + idx * 0.08, duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
              whileTap={{ scale: 0.95 }}
              data-slot="button"
              className="border-border hover:bg-border/30 bg-card/30 h-[84px] w-full cursor-pointer rounded-2xl border shadow-none backdrop-blur-lg"
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
                className="mt-6 w-full cursor-pointer rounded-full bg-gradient-to-r from-[#0171E3] to-[#0A2A6B] py-3 text-sm font-medium text-white transition-all hover:brightness-110"
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
