"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Magnifying lens follower — corrected per user's clarification:      */
/*                                                                     */
/*  • The native OS cursor is left COMPLETELY UNTOUCHED (never hidden) */
/*    — the arrow stays exactly as the system draws it, everywhere.    */
/*  • A circle follows the cursor wherever it moves: it trails behind  */
/*    while the cursor is in motion and merges back onto the cursor    */
/*    the moment it stops.                                             */
/*  • Over any element marked [data-lens] (the project showcase zone)  */
/*    the circle springs open into an 80px lens that merges with the   */
/*    cursor position and shows a ~1.7x magnified, pixel-identical     */
/*    clone of the content beneath it — a magnifying glass.            */
/*  • The ring uses mix-blend-mode: difference so it stays crisp on    */
/*    light AND dark backgrounds.                                      */
/* ------------------------------------------------------------------ */

const LENS_SIZE = 80;
const RING_SIZE = 32;
const ZOOM = 1.7;
const RING_BORDER = 1.25;
const LENS_BORDER = 2;

/* Exponential follow rates (per second). Higher = tighter coupling.
   Ring state trails playfully behind the moving cursor; lens state
   hugs the cursor tightly — that's the "merge" the moment content is
   hovered: the circle converges onto the cursor and becomes the
   magnifying glass. Both converge exactly when the cursor stops. */
const RING_RATE = 12;
const LENS_RATE = 22;

/* Stable no-op subscription for useSyncExternalStore */
const noopSubscribe = () => () => {};

/* Client snapshot: real pointer (or ?lensdebug=1 for headless tests) */
const isFinePointer = () => {
  const params = new URLSearchParams(window.location.search);
  return window.matchMedia("(pointer: fine)").matches || params.has("lensdebug");
};

export function LensCursor() {
  const [lensOn, setLensOn] = useState(false);
  const [visible, setVisible] = useState(false);

  /* SSR-safe hydration gate + pointer capability check */
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const enabled = useSyncExternalStore(
    noopSubscribe,
    isFinePointer,
    () => false,
  );

  /* Raw mouse target (updated by mousemove) */
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  /* Smoothed follower position — where the circle actually is */
  const cx = useMotionValue(-200);
  const cy = useMotionValue(-200);

  /* Animated geometry: circle size + border width morph ring <-> lens */
  const size = useMotionValue(RING_SIZE);
  const borderW = useMotionValue(RING_BORDER);

  /* Mirror state into refs so the rAF loop reads fresh values
     without re-subscribing */
  const lensOnRef = useRef(false);
  const visibleRef = useRef(false);

  /* Lens zone captured on activation (original element + its viewport
     rect) — refreshed on every mousemove so the clone stays aligned */
  const sourceRef = useRef<HTMLElement | null>(null);
  const zoneLeft = useRef(0);
  const zoneTop = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const cleanupScrollRef = useRef<(() => void) | null>(null);

  /* Content shift: maps the point under the CIRCLE center to the
     circle center. The circle trails the cursor, so the lens always
     magnifies exactly what it is sitting on — like a real loupe being
     dragged across the page.
     shift = size/2 - ZOOM * (circle - zoneOrigin)  (scale origin fixed
     at 0 0, so the zoom layer compensates through translation alone) */
  const shiftX = useTransform([cx, size], (v: number[]) => v[1] / 2 - ZOOM * (v[0] - zoneLeft.current));
  const shiftY = useTransform([cy, size], (v: number[]) => v[1] / 2 - ZOOM * (v[0] - zoneTop.current));

  /* Trailing-follow loop: exponential approach of the circle toward
     the raw cursor position, frame-rate independent */
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const rate = lensOnRef.current ? LENS_RATE : RING_RATE;
      const alpha = 1 - Math.exp(-rate * dt);
      cx.set(cx.get() + (mx.get() - cx.get()) * alpha);
      cy.set(cy.get() + (my.get() - cy.get()) * alpha);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled, cx, cy, mx, my]);

  /* Ring <-> lens size morph */
  useEffect(() => {
    lensOnRef.current = lensOn;
    if (!enabled) return;
    const a1 = animate(size, lensOn ? LENS_SIZE : RING_SIZE, {
      type: "spring",
      stiffness: 480,
      damping: 34,
    });
    const a2 = animate(borderW, lensOn ? LENS_BORDER : RING_BORDER, {
      duration: 0.16,
      ease: "easeOut",
    });
    return () => {
      a1.stop();
      a2.stop();
    };
  }, [enabled, lensOn, size, borderW]);

  /* Global listeners: track mouse, detect [data-lens] zones */
  useEffect(() => {
    if (!enabled) return;

    const teardownClone = () => {
      if (cleanupScrollRef.current) {
        cleanupScrollRef.current();
        cleanupScrollRef.current = null;
      }
      hostRef.current?.replaceChildren();
      sourceRef.current = null;
    };

    const activateLens = (target: HTMLElement) => {
      if (sourceRef.current === target) return;
      teardownClone();
      sourceRef.current = target;

      const rect = target.getBoundingClientRect();
      zoneLeft.current = rect.left;
      zoneTop.current = rect.top;

      /* Static deep clone of the zone: cloneNode keeps classes + inline
         styles (including framer-motion's settled transforms) so it is
         pixel-identical; event listeners are not copied (pure visuals). */
      const clone = target.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.removeAttribute("data-lens");
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      clone.querySelectorAll("[data-lens]").forEach((el) => el.removeAttribute("data-lens"));

      const host = hostRef.current;
      if (!host) return;
      host.style.width = `${rect.width}px`;
      host.style.height = `${rect.height}px`;
      host.appendChild(clone);

      /* Keep the clone's horizontal scroll locked to the original's */
      const syncScroll = () => {
        clone.scrollLeft = target.scrollLeft;
      };
      syncScroll();
      target.addEventListener("scroll", syncScroll, { passive: true });
      cleanupScrollRef.current = () => target.removeEventListener("scroll", syncScroll);

      setLensOn(true);
    };

    const deactivateLens = () => {
      if (!sourceRef.current) return;
      teardownClone();
      setLensOn(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      /* First appearance (or re-entry into the document): snap the
         follower straight onto the cursor instead of gliding in from
         wherever it was last seen. */
      if (!visibleRef.current) {
        visibleRef.current = true;
        cx.set(e.clientX);
        cy.set(e.clientY);
        setVisible(true);
      }
      if (sourceRef.current) {
        const rect = sourceRef.current.getBoundingClientRect();
        zoneLeft.current = rect.left;
        zoneTop.current = rect.top;
      }
    };
    /* DOM-wise the zone contains fixed-position overlays (the project
       modal is rendered inside the carousel tree). Those overlays are NOT
       part of the visible zone — walking up from the hovered element, any
       `fixed` ancestor before the zone means an overlay escapes it. */
    const isWithinVisibleZone = (el: Element | null, zone: Element | null): boolean => {
      if (!zone) return false;
      let node: Element | null = el;
      while (node && node !== zone) {
        if (getComputedStyle(node).position === "fixed") return false;
        node = node.parentElement;
      }
      return node === zone;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest?.("[data-lens]") as HTMLElement | null;
      if (el && isWithinVisibleZone(target, el)) activateLens(el);
      else deactivateLens();
    };
    /* A click inside the zone (e.g. a project card) can open an overlay
       that lands under the STATIONARY cursor — browsers do not fire
       mouseover for DOM changes, so re-evaluate the zone after clicking. */
    const onMouseDown = (e: MouseEvent) => {
      if (!sourceRef.current) return;
      window.setTimeout(() => {
        if (!sourceRef.current) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || !isWithinVisibleZone(el, sourceRef.current)) deactivateLens();
      }, 60);
    };
    const onDocLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onDocLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      document.documentElement.removeEventListener("mouseleave", onDocLeave);
      teardownClone();
    };
  }, [enabled, mx, my, cx, cy]);

  if (!mounted || !enabled) return null;

  return createPortal(
    <>
      {/* Lens content layer — the magnified clone, clipped to the circle.
          Sits BELOW the ring so the ring's border frames the lens edge. */}
      <motion.div
        data-testid="lens-content"
        style={{
          x: cx,
          y: cy,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9998,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <motion.div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            overflow: "hidden",
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              opacity: lensOn ? 1 : 0,
              transition: "opacity 150ms ease",
            }}
          >
            <motion.div style={{ x: shiftX, y: shiftY, position: "absolute", left: 0, top: 0 }}>
              <div
                ref={hostRef}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transform: `scale(${ZOOM})`,
                  transformOrigin: "0 0",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Ring layer — the follower circle. Difference-blended so it stays
          visible on any background. Shares the same `size` motion value
          as the content clip, so the two circles can never drift apart.
          The native OS cursor is NOT hidden — the arrow stays on top of
          everything, exactly as the user described. */}
      <motion.div
        data-testid="lens-ring"
        style={{
          x: cx,
          y: cy,
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: "none",
          mixBlendMode: "difference",
        }}
        aria-hidden
      >
        <motion.div
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          style={{
            width: size,
            height: size,
            borderWidth: borderW,
            borderStyle: "solid",
            borderColor: "#ffffff",
            borderRadius: "50%",
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.div>
    </>,
    document.body,
  );
}
