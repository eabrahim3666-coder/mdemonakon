"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Laugh,
  Briefcase,
  Layers,
  PartyPopper,
  UserRoundSearch,
} from "lucide-react";
import { ToolCard, type ToolName } from "@/components/tool-cards";
import { resolveStaticReply } from "@/lib/static-chat";

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

/* ------------------------------------------------------------------ */
/* Quick actions — same set as the home landing page, rendered as      */
/* compact pills inside the chat (like the reference site)             */
/* ------------------------------------------------------------------ */

const quickActions = [
  { key: "Me", icon: Laugh, color: "#329696" },
  { key: "Projects", icon: Briefcase, color: "#3E9858" },
  { key: "Skills", icon: Layers, color: "#856ED9" },
  { key: "Fun", icon: PartyPopper, color: "#B95F9D" },
  { key: "Contact", icon: UserRoundSearch, color: "#C19433" },
];

const quickQueries: Record<string, string> = {
  Me: "Who are you? I want to know more about you.",
  Projects: "What are your projects? What are you working on right now?",
  Skills: "What are your skills? Give me a list of your soft and hard skills.",
  Fun: "What's the craziest thing you've ever done? What are your hobbies?",
  Contact: "How can I contact you?",
};

/* Apple-style ease curve used across the reference site */
const APPLE_EASE = [0.19, 1, 0.22, 1] as const;

/* ------------------------------------------------------------------ */
/* STATIC responses — no AI, no network, no waiting.                  */
/* The reply resolves instantly from src/lib/static-chat.ts; this      */
/* timeline only stages the reveal so it still feels alive: a short   */
/* thinking beat (dots pulse + avatar bobs), the card entrance,      */
/* then the text types in fast (~480ms). Click-to-full-answer   */
/* is roughly one second.                                             */
/* ------------------------------------------------------------------ */
const THINK_MS = 300; // loading-dots beat while the "avatar thinks"
const CARD_MS = 240;  // beat between the card entrance and the text
const TYPE_MS = 420;  // total time the text takes to type in
const TYPE_STEPS = 9; // state updates while typing (fewer renders = snappy)

/* rAF-based sleep — immune to background-tab setTimeout throttling and
   aligned with the display's frame clock, so the typing cadence is
   identical on every machine. */
const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    const start = performance.now();
    const check = () => {
      if (performance.now() - start >= ms) resolve();
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });

/* The quick-questions row above the chat input, with show/hide toggle */
function QuickQuestions({
  onQuickAction,
  disabled,
}: {
  onQuickAction: (query: string) => void;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(true);
  return (
    <div className="w-full">
      <div className={visible ? "mb-2 flex justify-center" : "mb-0 flex justify-center"}>
        <button
          onClick={() => setVisible(!visible)}
          className="flex cursor-pointer items-center gap-1 px-3 py-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
        >
          {visible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {visible ? "Hide quick questions" : "Show quick questions"}
        </button>
      </div>
      {visible && (
        <div className="flex w-full flex-wrap gap-1 md:gap-3" style={{ justifyContent: "safe center" }}>
          {quickActions.map(({ key, icon: Icon, color }) => (
            <motion.button
              key={key}
              onClick={() => !disabled && onQuickAction(quickQueries[key])}
              whileTap={disabled ? {} : { scale: 0.95 }}
              className={`h-auto min-w-[96px] flex-shrink-0 rounded-xl border px-4 py-1.5 shadow-none backdrop-blur-sm transition-colors ${
                disabled
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-50"
                  : "border-border hover:bg-border/30 cursor-pointer bg-white/80 active:scale-95"
              }`}
              disabled={disabled}
            >
              <div className="flex items-center gap-2.5 text-gray-700">
                <Icon size={17} strokeWidth={2} color={color} />
                <span className="text-sm font-medium">{key}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatView({ initialQuery, onBack, conversation, setConversation }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sentInitial = useRef(false);
  /* Synchronous streaming guard — state updates are batched in React 18,
     so a stale `isStreaming` closure could theoretically allow overlapping
     sends. The ref flips immediately, making double-sends impossible. */
  const streamingRef = useRef(false);
  /* Turn token + liveness guard: cancels the local typing loop when a
     newer turn starts or the view unmounts (user pressed back). */
  const turnIdRef = useRef(0);
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  /* Bottom-following scroll: while the AI streams we PIN the viewport to
     the bottom (instant, ChatGPT-style) instead of restarting a smooth
     scroll on every token — that restart was the "unstable" jitter.
     Card entrances glide (smooth). If the user scrolls up to read, we
     stop following until they return or a new turn starts. */
  const stickToBottom = useRef(true);
  const lastWasTool = useRef(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || streamingRef.current) return;
      streamingRef.current = true;
      const myTurn = ++turnIdRef.current;
      const isCurrent = () => turnIdRef.current === myTurn && aliveRef.current;

      setConversation((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: "" },
      ]);
      setInput("");
      setIsStreaming(true);

      /* Deterministic, instant — the entire reply is decided here */
      const reply = resolveStaticReply(question);

      const patchLast = (fn: (last: ChatMsg) => ChatMsg) => {
        setConversation((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") next[next.length - 1] = fn(last);
          return next;
        });
      };

      try {
        /* 1) Thinking beat — the dots pulse and the avatar bobs */
        await sleep(THINK_MS);
        if (!isCurrent()) return;

        /* 2) Card entrance — same grand reveal as before */
        if (reply.tools.length > 0) {
          lastWasTool.current = true;
          patchLast((last) => ({
            ...last,
            tools: [...(last.tools ?? []), ...reply.tools],
          }));
          await sleep(CARD_MS);
          if (!isCurrent()) return;
        }

        /* 3) Type the text — fast word-chunks, few renders, cancel-safe */
        const steps = Math.max(5, Math.min(TYPE_STEPS, Math.ceil(reply.text.length / 16)));
        for (let s = 1; s <= steps; s++) {
          await sleep(TYPE_MS / steps);
          if (!isCurrent()) return;
          const soFar = reply.text.slice(0, Math.ceil((reply.text.length * s) / steps));
          patchLast((last) => ({ ...last, content: soFar }));
        }
      } finally {
        streamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [setConversation]
  );

  /* ---------------------------------------------------------------- */
  /* Single-turn architecture (like the reference site): only the      */
  /* CURRENT exchange is rendered — every new button click replaces    */
  /* the previous turn, feeling like a brand-new chat each time.       */
  /* The avatar stage vanishes COMPLETELY once data starts loading,   */
  /* handing the full screen to the cinematic card entrance.           */
  /* ---------------------------------------------------------------- */

  const lastMsg = conversation[conversation.length - 1];
  const hasMessages = conversation.length > 0;
  const lastUserMsg = [...conversation].reverse().find((m) => m.role === "user");
  const currentAssistant = lastMsg?.role === "assistant" ? lastMsg : null;
  const assistantStarted =
    !!currentAssistant && ((currentAssistant.content?.length ?? 0) > 0 || (currentAssistant.tools?.length ?? 0) > 0);
  const userTurns = conversation.filter((m) => m.role === "user").length;

  // Auto-submit the question that brought us here from the landing page
  useEffect(() => {
    if (initialQuery && !sentInitial.current && conversation.length === 0) {
      sentInitial.current = true;
      void sendMessage(initialQuery);
    }
  }, [initialQuery, conversation.length, sendMessage]);

  // Every new turn re-engages bottom-following (fresh chat, fresh scroll)
  useEffect(() => {
    stickToBottom.current = true;
    lastWasTool.current = false;
  }, [userTurns]);

  // Follow the content as it grows: the card entrance glides down smoothly,
  // streamed tokens pin the bottom instantly (no smooth-restart jitter).
  useEffect(() => {
    const el = mainRef.current;
    if (!el || !assistantStarted || !stickToBottom.current) return;
    if (lastWasTool.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [conversation, assistantStarted]);

  // User scrolled up to read → stop yanking them around
  const handleMainScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) void sendMessage(input);
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Header: back button row + the avatar stage.
          The stage (talking avatar + the user's question bubble) is ONLY
          visible while the response is being prepared — the moment data
          starts arriving it dissolves upward and collapses to zero
          height, handing the whole screen to the content. */}
      <header className="z-10 flex flex-col items-center px-4 pt-3">
        <div className="flex w-full items-center justify-between">
          <button
            onClick={onBack}
            aria-label="Back to home"
            className="hover:bg-border/30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white/30 backdrop-blur-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-10 w-10" />
        </div>

        <AnimatePresence initial={false}>
          {!assistantStarted && (
            <motion.div
              key="avatar-stage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -36, height: 0, marginTop: 0 }}
              transition={{ duration: 0.5, ease: APPLE_EASE }}
              className="flex w-full flex-col items-center overflow-hidden"
            >
              {/* The avatar face — transparent cutout; while the reply is
                  being prepared it plays a gentle talking bob (like the
                  old memoji video used to) */}
              <motion.div
                aria-hidden="true"
                animate={
                  isStreaming && !assistantStarted
                    ? { scale: [1, 1.045, 1], y: [0, -4, 0] }
                    : { scale: 1, y: 0 }
                }
                transition={
                  isStreaming && !assistantStarted
                    ? { duration: 1.05, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.35, ease: APPLE_EASE }
                }
                className="h-36 w-28 sm:h-40 sm:w-32 md:h-44 md:w-36"
              >
                <Image
                  src="/avatar-face.png"
                  alt="Avatar"
                  width={789}
                  height={1000}
                  className="h-full w-full object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.16)]"
                  style={{ color: "transparent" }}
                  unoptimized
                />
              </motion.div>

              {/* The user's question sits right under the avatar while the
                  response is being prepared — it dissolves away with the stage */}
              {lastUserMsg && (
                <motion.div
                  key={`q-${userTurns}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: APPLE_EASE }}
                  className="mx-auto mt-1 flex w-full max-w-3xl justify-end px-1"
                >
                  <div className="max-w-[85%] rounded-3xl bg-[#0171E3] px-5 py-3 text-white shadow-md sm:max-w-[70%]">
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap sm:text-base">
                      {lastUserMsg.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main stage — sequenced states: landing grid → loading dots →
          response data. The response container rises in with a single
          smooth Apple-ease motion while the tool cards layer their own
          staggered cascade on top (the cinema). */}
      <main ref={mainRef} onScroll={handleMainScroll} className="z-10 flex-1 overflow-y-auto px-2 md:px-4">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
          <AnimatePresence mode="wait">
            {!hasMessages && (
              /* In-chat landing state (only when arriving without a query):
                 the quick action grid, vertically centered */
              <motion.div
                key="chat-landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex min-h-full w-full items-center justify-center px-4 py-6"
              >
                <motion.div
                  className="flex w-full flex-col items-center"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                  }}
                >
                  {quickActions.map(({ key, icon: Icon, color }) => (
                    <motion.button
                      key={key}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
                      }}
                      onClick={() => sendMessage(quickQueries[key])}
                      className="border-border hover:bg-border/30 bg-card/30 mb-3 h-[84px] w-full max-w-[124px] cursor-pointer rounded-2xl border shadow-none backdrop-blur-lg active:scale-95"
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-700">
                        <Icon width={20} height={20} color={color} strokeWidth={2} />
                        <span className="text-xs font-medium sm:text-sm">{key}</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading dots — they pulse while the AI "thinks" (the beat
              before the cinematic entrance), then dissolve upward the
              moment data begins to arrive — no more instant vanishing */}
          <AnimatePresence initial={false}>
            {hasMessages && !assistantStarted && (
              <motion.div
                key="loading-dots"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.35, ease: APPLE_EASE } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex w-full items-start px-2 pt-8 md:px-4"
              >
                <div className="flex items-center gap-1.5 rounded-2xl bg-[#ECECF0] px-5 py-3.5 shadow-sm dark:bg-neutral-800">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                      style={{ animationDelay: `${dot * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The response data — tool cards + streamed text. Keyed per turn
              so every new button click replays the entrance: the container
              rises gently while each card plays its internal cascade. */}
          <AnimatePresence initial={false}>
            {assistantStarted && (
              <motion.div
                key={`turn-${userTurns}`}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14, transition: { duration: 0.22, ease: "easeOut" } }}
                transition={{ duration: 0.65, ease: APPLE_EASE }}
                className="flex w-full flex-col px-2 pt-2 pb-4 md:px-4"
              >
                {currentAssistant?.tools?.map((tool, j) => (
                  <div key={`${userTurns}-${j}`} className="mb-4 w-full">
                    <ToolCard name={tool} />
                  </div>
                ))}
                {currentAssistant?.content ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: APPLE_EASE }}
                    className="w-full"
                  >
                    <div className="rounded-2xl bg-[#ECECF0] px-5 py-3 shadow-sm dark:bg-neutral-800">
                      <p
                        className={`text-sm leading-relaxed break-words whitespace-pre-wrap text-neutral-800 sm:text-base dark:text-neutral-100 ${
                          currentAssistant.error ? "text-red-500 dark:text-red-400" : ""
                        }`}
                      >
                        {currentAssistant.content}
                        {isStreaming && (
                          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-current" />
                        )}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-1" />
        </div>
      </main>

      {/* Quick questions + input */}
      <footer className="z-10 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pt-3 pb-5 md:px-8 md:pb-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3">
          <QuickQuestions onQuickAction={(q) => void sendMessage(q)} disabled={isStreaming} />
          <form className="w-full" onSubmit={submit}>
            <div className="flex items-center rounded-full border border-[#E5E5E9] bg-[#ECECF0] py-2 pr-2 pl-6 shadow-lg transition-all hover:border-neutral-300">
              <input
                type="text"
                placeholder={isStreaming ? "Thinking…" : "Ask me anything…"}
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
        </div>
      </footer>
    </div>
  );
}
