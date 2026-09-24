"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FluidBackground } from "@/components/fluid-background";
import { LandingView } from "@/components/landing-view";
import { ChatView } from "@/components/chat-view";
import { LensCursor } from "@/components/lens-cursor";
import type { ToolName } from "@/components/tool-cards";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  tools?: ToolName[];
  error?: boolean;
}

export default function Home() {
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
      <FluidBackground />
      <LensCursor />
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
    </main>
  );
}
