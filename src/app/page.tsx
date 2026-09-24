"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FluidBackground } from "@/components/fluid-background";
import { LandingView } from "@/components/landing-view";
import { ChatView } from "@/components/chat-view";
import { LensCursor } from "@/components/lens-cursor";
import { LoadingScreen } from "@/components/loading-screen";
import type { ToolName } from "@/components/tool-cards";

const APPLE_EASE = [0.19, 1, 0.22, 1] as const;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  tools?: ToolName[];
  error?: boolean;
}

export default function Home() {
  /* Cinematic boot: the loading screen plays FIRST, then the curtain
     lifts and the page content reveals slowly underneath. */
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState<"landing" | "chat">("landing");
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatMsg[]>([]);

  const handleAsk = (question: string) => {
    setInitialQuery(question);
    setConversation([]);
    setView("chat");
  };

  const handleBack = () => {
    setView("landing");
    setInitialQuery(null);
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* 1. Loading screen — covers everything until the bar completes,
          then slides away like a curtain. */}
      <AnimatePresence>
        {!booted && <LoadingScreen onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      {/* 2. The universal lens cursor is live from the very first frame,
          including on top of the loading screen itself. */}
      <LensCursor />

      {booted && (
        <>
          {/* Fluid background mounts only after the boot — zero splats
              during the loading screen, so no color flash can ever leak
              out when the curtain lifts. */}
          <FluidBackground />

          {/* 3. Slow, beautiful content reveal: the whole page fades in
              while each block inside plays its own staggered entrance
              (hero → memoji → input → buttons). Opacity-only on this
              wrapper keeps `position: fixed` children (modals) correct. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: APPLE_EASE }}
            className="flex min-h-screen flex-col"
          >
            <AnimatePresence mode="wait">
              {view === "landing" ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="z-10 flex min-h-screen flex-col"
                >
                  <LandingView onAsk={handleAsk} />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="z-10 flex h-screen flex-col"
                >
                  <ChatView
                    initialQuery={initialQuery}
                    onBack={handleBack}
                    conversation={conversation}
                    setConversation={setConversation}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </main>
  );
}
