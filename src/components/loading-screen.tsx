"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * ============================================================
 *  CINEMATIC LOADING SCREEN
 *
 *  Plays on every fresh page load, before anything else is
 *  revealed:
 *    1. "Loading" label fades in
 *    2. "Md. Emon" letter-staggers into focus
 *    3. Role subtitle settles in
 *    4. Progress bar climbs with a believable micro-stall,
 *       then sprints to 100%
 *    5. Short hold at 100% → the whole curtain lifts away
 *       (exit animation) and the page content reveals slowly
 *       underneath with its own staggered transition.
 * ============================================================
 */

const APPLE_EASE = [0.19, 1, 0.22, 1] as const;
const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const;

/* Cinematic timeline (ms) */
const PHASE_A = 1150; // 0%   → 72%  (fast start, slowing)
const HOLD_MS = 240;  // stall at 72% — feels like real loading
const PHASE_C = 620;  // 72%  → 100% (satisfying sprint)
const DONE_HOLD = 420; // admire 100% before the curtain lifts

const NAME = "Md. Emon";
const ROLE = "Software Developer / AI Engineer";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    const total = PHASE_A + HOLD_MS + PHASE_C;
    let raf = 0;
    let finishTimer = 0;

    const tick = (now: number) => {
      const el = now - start;
      let p: number;
      if (el <= PHASE_A) {
        p = 0.72 * easeOutCubic(el / PHASE_A);
      } else if (el <= PHASE_A + HOLD_MS) {
        p = 0.72; // the stall
      } else if (el <= total) {
        p = 0.72 + 0.28 * easeInOutCubic((el - PHASE_A - HOLD_MS) / PHASE_C);
      } else {
        p = 1;
      }
      setProgress(Math.min(1, p));

      if (el < total) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setDone(true);
        finishTimer = window.setTimeout(() => onCompleteRef.current(), DONE_HOLD);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(finishTimer);
    };
  }, []);

  return (
    <motion.div
      role="status"
      aria-label={`Loading ${NAME} — ${ROLE}`}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-background"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.85, ease: CURTAIN_EASE }}
    >
      <motion.div
        animate={done ? { opacity: 0, y: -16, scale: 0.985 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: APPLE_EASE }}
        className="flex flex-col items-center px-6 text-center"
      >
        {/* Loading label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: APPLE_EASE }}
          className="text-xs font-medium tracking-[0.35em] text-neutral-400 uppercase"
        >
          Loading
        </motion.p>

        {/* Name — each letter staggers into focus */}
        <h1 className="mt-5 text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl">
          {NAME.split("").map((ch, i) => (
            <motion.span
              key={`${ch}-${i}`}
              initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4 + i * 0.055, duration: 0.75, ease: APPLE_EASE }}
              className="inline-block whitespace-pre"
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        {/* Role */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7, ease: APPLE_EASE }}
          className="mt-3 text-sm font-medium text-neutral-500 sm:text-base"
        >
          {ROLE}
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-10 flex w-64 items-center gap-3 sm:w-72"
        >
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-medium text-neutral-400 tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
