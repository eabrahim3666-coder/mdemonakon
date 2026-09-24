"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Magnifying lens follower — universal content lens:                  */
/*                                                                     */
/*  • The native OS cursor is NEVER hidden — the arrow stays exactly   */
/*    as the system draws it, everywhere.                              */
/*  • A circle follows the cursor wherever it moves: over EMPTY        */
/*    space it chases the cursor with a playful trailing lag and       */
/*    merges back onto it when it stops.                               */
/*  • The moment the cursor enters CONTENT — any box, element or       */
/*    text anywhere on the page — the circle springs open into an      */
/*    80px magnifying glass that merges with the cursor and shows a    */
/*    ~1.3x slightly-magnified, pixel-identical clone of whatever it   */
/*    hovers over, like inspecting the page through a loupe.           */
/*  • Elements marked [data-lens] (the project showcase) keep their    */
/*    zone-level lens: hovering anywhere in the zone magnifies the     */
/*    whole showcase, exactly like the reference video.                */
/* ------------------------------------------------------------------ */

const LENS_SIZE = 80;
const RING_SIZE = 38;
const ZOOM = 1.3; // slight magnification — subtle, not aggressive
const RING_BORDER = 1.25;
const LENS_BORDER = 2;

/* Exponential follow rates (per second). Ring state trails playfully
   behind the moving cursor (the "chase"); lens state hugs the cursor
   tightly — the "merge". Both converge exactly when the cursor stops. */
const RING_RATE = 12;
const LENS_RATE = 22;

/* Universal-lens tuning */
const GENERIC_PAD = 56;      // white context padding around small hosts
const MIN_CONTEXT = 110;     // min dimension for a host to count as a "block"
const REBUILD_DRIFT = 24;    // px of size change before the clone rebuilds
const DEACTIVATE_GRACE = 90; // ms grace at content edges (no ring<->lens thrash)
const POST_CLICK_REARM = 350;// ms after a click before re-detecting content

/* Elements that are "content" by their very nature */
const SUBSTANCE_TAGS = new Set([
  "IMG", "VIDEO", "INPUT", "SELECT", "TEXTAREA", "BUTTON", "A", "LABEL",
]);

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

  /* Lens host captured on activation (original element + its viewport
     rect, optionally padded with page-colored context) */
  const sourceRef = useRef<HTMLElement | null>(null);
  const padRef = useRef(0);
  const builtW = useRef(0);
  const builtH = useRef(0);
  const zoneLeft = useRef(0);
  const zoneTop = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const bodyBgRef = useRef("#ffffff");
  const deactivateTimerRef = useRef<number | null>(null);
  const postClickTimerRef = useRef(0);
  const reevalRafRef = useRef(0);

  /* Content shift: maps the point under the CIRCLE center to the
     circle center — the lens always magnifies exactly what it sits on.
     shift = size/2 - ZOOM * (circle - zoneOrigin)  (scale origin fixed
     at 0 0, so the zoom layer compensates through translation alone) */
  const shiftX = useTransform([cx, size], (v: number[]) => v[1] / 2 - ZOOM * (v[0] - zoneLeft.current));
  const shiftY = useTransform([cy, size], (v: number[]) => v[1] / 2 - ZOOM * (v[0] - zoneTop.current));

  /* Trailing-follow loop: exponential approach of the circle toward
     the raw cursor position. dt comes from the wall clock (capped only
     against pathological pauses) so the convergence RATE is identical
     at 144Hz, 60Hz or a throttled/compositor-starved frame pipeline. */
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(500, now - last) / 1000;
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

  /* Global listeners: track mouse, detect content everywhere */
  useEffect(() => {
    if (!enabled) return;
    bodyBgRef.current = getComputedStyle(document.body).backgroundColor || "#ffffff";

    const cancelPendingDeactivate = () => {
      if (deactivateTimerRef.current !== null) {
        window.clearTimeout(deactivateTimerRef.current);
        deactivateTimerRef.current = null;
      }
    };

    const teardownClone = () => {
      hostRef.current?.replaceChildren();
      sourceRef.current = null;
      builtW.current = 0;
      builtH.current = 0;
    };

    /* Deep-clone the host element into the padded, scaled layer.
       cloneNode keeps classes + inline styles (incl. framer-motion's
       settled transforms) so it renders pixel-identically; listeners
       are not copied (pure visuals). The clone is pinned to the
       original's exact rendered box (margins neutralized) and offset
       by `pad` inside the host so the shift math stays exact. */
    const buildClone = (target: HTMLElement, pad: number) => {
      teardownClone();
      sourceRef.current = target;
      padRef.current = pad;

      const rect = target.getBoundingClientRect();
      builtW.current = rect.width;
      builtH.current = rect.height;
      zoneLeft.current = rect.left - pad;
      zoneTop.current = rect.top - pad;

      const clone = target.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.removeAttribute("data-lens");
      clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
      clone.querySelectorAll("[data-lens]").forEach((el) => el.removeAttribute("data-lens"));

      clone.style.position = "absolute";
      clone.style.left = `${pad}px`;
      clone.style.top = `${pad}px`;
      clone.style.margin = "0";
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        (clone as HTMLInputElement).value = target.value;
      }

      const host = hostRef.current;
      if (!host) return;
      host.style.width = `${rect.width + pad * 2}px`;
      host.style.height = `${rect.height + pad * 2}px`;
      host.style.background = pad > 0 ? bodyBgRef.current : "transparent";
      host.replaceChildren();
      host.appendChild(clone);
    };

    /* Keep the clone aligned with the original: element-level scroll
       positions (matched by DOM order, covers inner scrollers like the
       carousel and modal body) + live form-field values. */
    const syncActiveClone = () => {
      const target = sourceRef.current;
      const host = hostRef.current;
      if (!target || !host || !host.firstElementChild) return;
      const clone = host.firstElementChild as HTMLElement;
      const tEls = [target, ...target.querySelectorAll<HTMLElement>("*")];
      const cEls = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
      if (tEls.length === cEls.length) {
        for (let i = 0; i < tEls.length; i++) {
          if (tEls[i].scrollLeft) cEls[i].scrollLeft = tEls[i].scrollLeft;
          if (tEls[i].scrollTop) cEls[i].scrollTop = tEls[i].scrollTop;
        }
      }
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        (clone as HTMLInputElement).value = target.value;
      }
    };

    /* Refresh zone refs every frame the mouse moves; rebuild the clone
       if the host's size drifted (streaming text, layout shifts). */
    const maybeRebuild = () => {
      const t = sourceRef.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      if (Math.abs(r.width - builtW.current) > REBUILD_DRIFT ||
          Math.abs(r.height - builtH.current) > REBUILD_DRIFT) {
        buildClone(t, padRef.current);
      } else {
        zoneLeft.current = r.left - padRef.current;
        zoneTop.current = r.top - padRef.current;
      }
    };

    const activateLens = (target: HTMLElement, pad: number) => {
      cancelPendingDeactivate();
      if (sourceRef.current === target) {
        if (padRef.current !== pad) buildClone(target, pad);
        else maybeRebuild();
        return;
      }
      buildClone(target, pad);
      setLensOn(true);
    };

    const deactivateLens = (immediate = false) => {
      if (!sourceRef.current) return;
      cancelPendingDeactivate();
      if (immediate) {
        teardownClone();
        setLensOn(false);
        return;
      }
      /* small grace period — kills ring<->lens thrash when the cursor
         skims the edge of a content element */
      deactivateTimerRef.current = window.setTimeout(() => {
        deactivateTimerRef.current = null;
        teardownClone();
        setLensOn(false);
      }, DEACTIVATE_GRACE);
    };

    /* Does an element carry visible substance of its own? */
    const bgAlphaOf = (bg: string): number => {
      const m = bg.match(/\/\s*([\d.]+)\s*\)/) || bg.match(/,\s*([\d.]+)\s*\)$/);
      return m ? parseFloat(m[1]) : 1;
    };
    const hasSubstance = (el: Element): boolean => {
      const tag = el.tagName;
      if (tag === "BODY" || tag === "HTML") return false;
      if (SUBSTANCE_TAGS.has(tag)) return true;
      let hasText = false;
      Array.from(el.childNodes).forEach((n) => {
        if (n.nodeType === 3 && n.textContent && n.textContent.trim()) hasText = true;
      });
      if (hasText) return true;
      const cs = getComputedStyle(el);
      if (cs.backgroundImage !== "none") return true;
      const bg = cs.backgroundColor;
      if (bg && bg !== "transparent" && bgAlphaOf(bg) > 0.02) return true;
      const sides = ["Top", "Right", "Bottom", "Left"];
      for (const s of sides) {
        const w = parseFloat(cs.getPropertyValue(`border${s}Width`));
        const st = cs.getPropertyValue(`border${s}Style`);
        if (w > 0 && st !== "none" && st !== "hidden") return true;
      }
      return false;
    };

    /* Walk up from the hovered leaf to the content host that should be
       magnified: the first ancestor-or-self with substance that is big
       enough to give the lens context (>= MIN_CONTEXT), else the
       largest substance element that fits the size caps. Giant
       full-page surfaces (backgrounds, canvases, page columns) never
       qualify — hovering them keeps the chase ring. */
    const findContentHost = (leaf: Element | null): HTMLElement | null => {
      if (!leaf) return null;
      const maxW = window.innerWidth * 0.95;
      const maxH = window.innerHeight * 1.6;
      let best: HTMLElement | null = null;
      let node: Element | null = leaf;
      while (node && node !== document.body && node !== document.documentElement) {
        const el = node as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.width >= 1 && r.height >= 1 && r.width <= maxW && r.height <= maxH && hasSubstance(el)) {
          best = el;
          if (Math.min(r.width, r.height) >= MIN_CONTEXT) return el;
        }
        node = node.parentElement;
      }
      return best;
    };

    /* DOM-wise a [data-lens] zone contains fixed-position overlays (the
       project modal is rendered inside the carousel tree). Those are NOT
       part of the visible zone — any `fixed` ancestor between the hovered
       element and the zone means an overlay escapes it. */
    const isWithinVisibleZone = (el: Element | null, zone: Element | null): boolean => {
      if (!zone) return false;
      let node: Element | null = el;
      while (node && node !== zone) {
        if (getComputedStyle(node).position === "fixed") return false;
        node = node.parentElement;
      }
      return node === zone;
    };

    const detectAt = (target: Element | null) => {
      const zoneEl = target?.closest?.("[data-lens]") as HTMLElement | null;
      if (zoneEl && isWithinVisibleZone(target, zoneEl)) {
        activateLens(zoneEl, 0);
        return;
      }
      const host = findContentHost(target);
      if (host) activateLens(host, GENERIC_PAD);
      else deactivateLens();
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
      maybeRebuild();
    };

    const onMouseOver = (e: MouseEvent) => {
      detectAt(e.target as Element | null);
    };

    /* A click can change the DOM under the STATIONARY cursor (modal
       opens, navigation). Retract immediately so no stale lens lingers,
       then re-detect the settled content a beat later. */
    const onMouseDown = () => {
      if (!sourceRef.current) return;
      deactivateLens(true);
      if (postClickTimerRef.current) window.clearTimeout(postClickTimerRef.current);
      postClickTimerRef.current = window.setTimeout(() => {
        postClickTimerRef.current = 0;
        if (!visibleRef.current) return;
        detectAt(document.elementFromPoint(mx.get(), my.get()));
      }, POST_CLICK_REARM);
    };

    /* Scrolling moves content under a stationary cursor — capture ALL
       scroll events (page + inner scrollers), keep an active clone's
       internal scroll aligned, and re-detect what now sits under the
       cursor. */
    const onScrollCapture = (e: Event) => {
      if (sourceRef.current) {
        const scrolled = e.target as Element | null;
        if (scrolled && (scrolled === sourceRef.current || sourceRef.current.contains(scrolled))) {
          syncActiveClone();
        }
      }
      if (reevalRafRef.current) return;
      reevalRafRef.current = requestAnimationFrame(() => {
        reevalRafRef.current = 0;
        if (!visibleRef.current) return;
        detectAt(document.elementFromPoint(mx.get(), my.get()));
      });
    };

    const onDocLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("scroll", onScrollCapture, { capture: true, passive: true });
    document.documentElement.addEventListener("mouseleave", onDocLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScrollCapture, { capture: true } as EventListenerOptions);
      document.documentElement.removeEventListener("mouseleave", onDocLeave);
      cancelAnimationFrame(reevalRafRef.current);
      cancelPendingDeactivate();
      if (postClickTimerRef.current) window.clearTimeout(postClickTimerRef.current);
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
