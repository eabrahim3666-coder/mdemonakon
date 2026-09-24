"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { ToolCard, type ToolName } from "@/components/tool-cards";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  tools?: ToolName[];
  error?: boolean;
}

interface ChatViewProps {
  initialQuery: string | null;
  onBack: () => void;
  conversation: ChatMsg[];
  setConversation: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
}

export function ChatView({ initialQuery, onBack, conversation, setConversation }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isStreaming) return;

      const historyMsgs = [
        ...conversation,
        { role: "user" as const, content: question },
      ];
      setConversation((prev) => [...prev, { role: "user", content: question }, { role: "assistant", content: "" }]);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyMsgs.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            let evt: { type: string; value?: string; name?: string };
            try {
              evt = JSON.parse(trimmed);
            } catch {
              continue;
            }
            if (evt.type === "text" && evt.value) {
              setConversation((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + evt.value };
                }
                return next;
              });
            } else if (evt.type === "tool" && evt.name) {
              setConversation((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = {
                    ...last,
                    tools: [...(last.tools ?? []), evt.name as ToolName],
                  };
                }
                return next;
              });
            } else if (evt.type === "error" && evt.value) {
              setConversation((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = { ...last, content: evt.value!, error: true };
                }
                return next;
              });
            }
          }
        }
      } catch {
        setConversation((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              content: "Sorry, my brain glitched! Can you try asking again?",
              error: true,
            };
          }
          return next;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [conversation, isStreaming, setConversation]
  );

  // Auto-submit the question that brought us here from the landing page
  useEffect(() => {
    if (initialQuery && !sentInitial.current && conversation.length === 0) {
      sentInitial.current = true;
      void sendMessage(initialQuery);
    }
  }, [initialQuery, conversation.length, sendMessage]);

  // Memoji talks while the AI is streaming
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isStreaming) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isStreaming]);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation, isStreaming]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) void sendMessage(input);
  };

  const lastMsg = conversation[conversation.length - 1];
  const waitingFirstToken = isStreaming && lastMsg?.role === "assistant" && !lastMsg.content && !lastMsg.tools?.length;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Fastfolio floating CTA */}
      <button
        className="group fixed top-6 left-6 z-51 hidden cursor-pointer items-center gap-2 rounded-full border bg-transparent px-4 py-2.5 backdrop-blur-2xl transition-all duration-300 hover:shadow-xl md:flex"
        onClick={() => window.open("https://fastfol.io?utm_source=portfolio&utm_medium=floating_cta", "_blank", "noopener,noreferrer")}
      >
        <Image alt="Fastfolio" width={24} height={24} className="object-contain" src="/fastfolio-logo.png" unoptimized />
        <span className="text-sm font-medium text-foreground">Build your AI portfolio</span>
        <ChevronRight className="group-hover:translate-x-0.5 h-4 w-4 transition-transform" />
      </button>

      {/* Header with talking memoji */}
      <header className="z-10 flex items-center justify-between px-4 pt-4 pb-2 md:px-8">
        <button
          onClick={onBack}
          aria-label="Back to home"
          className="hover:bg-border/30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white/30 backdrop-blur-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative h-32 w-28 overflow-hidden sm:h-36 sm:w-32 md:h-40 md:w-36" aria-hidden="true">
          <video
            ref={videoRef}
            src="/final_memojis.webm"
            muted
            playsInline
            loop
            preload="auto"
            className="translate-y-6 scale-[2.2] object-cover"
          />
        </div>

        <div className="h-10 w-10" />
      </header>

      {/* Messages */}
      <main className="z-10 flex-1 overflow-y-auto px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pt-2 pb-6">
          <AnimatePresence initial={false}>
            {conversation.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-3xl bg-[#0171E3] px-5 py-3 text-white shadow-md sm:max-w-[70%]">
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap sm:text-base">{msg.content}</p>
                  </div>
                ) : (
                  <div className="w-full max-w-full">
                    {/* Tool cards render above the text — generative UI */}
                    {msg.tools?.map((tool, j) => (
                      <div key={j} className="mb-4">
                        <ToolCard name={tool} />
                      </div>
                    ))}
                    {(msg.content || (!isStreaming && i === conversation.length - 1)) && (
                      <div className="bg-card text-card-foreground max-w-full rounded-3xl border px-5 py-3 shadow-sm">
                        <p
                          className={`text-sm leading-relaxed break-words whitespace-pre-wrap sm:text-base ${
                            msg.error ? "text-red-500" : "text-foreground"
                          }`}
                        >
                          {msg.content}
                          {isStreaming && i === conversation.length - 1 && (
                            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-current" />
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {waitingFirstToken && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-card flex items-center gap-1.5 rounded-3xl border px-5 py-3.5 shadow-sm">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: `${dot * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="z-10 px-4 pt-2 pb-6 md:px-8">
        <form className="mx-auto w-full max-w-3xl" onSubmit={submit}>
          <div className="flex items-center rounded-full border border-neutral-200 bg-white/30 py-2.5 pr-2 pl-6 shadow-lg backdrop-blur-lg transition-all hover:border-neutral-300">
            <input
              type="text"
              placeholder="Ask me anything…"
              className="placeholder:text-neutral-500 focus:outline-none w-full border-none bg-transparent text-base text-neutral-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={200}
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
