"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { SCROLL_STOPS, toCssAlpha } from "@/lib/scrollTheme";
import styles from "./ScrollBackground.module.css";

/* Scroll-reactive background: a warm light source that drifts down the page
   and shifts color (black -> bronze -> crimson -> ember -> black) as you
   scroll, layered under a low-opacity full-page mood tint.

   Painted at z-index: -1, so it sits above the solid body background but
   below all normal-flow content — no changes needed to existing stacking. */

const STOP_ATS = SCROLL_STOPS.map((s) => s.at);

export default function ScrollBackground() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Smooth, slightly laggy easing so the glow trails the scroll organically
  // instead of snapping.
  const progress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.6,
  });

  // The glow center drifts from the top third to the bottom third of the
  // viewport so it's always partly visible.
  const y = useTransform(progress, [0, 1], ["22%", "78%"]);

  // Color stops shared with the ember particles (see @/lib/scrollTheme).
  const glowColor = useTransform(
    progress,
    STOP_ATS,
    SCROLL_STOPS.map((s) => toCssAlpha(s.rgb, 0.5))
  );
  const tintColor = useTransform(
    progress,
    STOP_ATS,
    SCROLL_STOPS.map((s) => toCssAlpha(s.rgb, 0.16))
  );

  // Compose the radial-gradient strings from the motion values.
  const glow = useMotionTemplate`radial-gradient(min(820px, 70vw) min(820px, 70vh) at 50% ${y}, ${glowColor}, transparent 70%)`;

  // Reduced motion: render a single static warm glow, no reactivity.
  if (reduced) {
    return (
      <div className={styles.layer} aria-hidden="true">
        <div
          className={styles.tint}
          style={{
            background:
              "radial-gradient(min(820px, 70vw) min(820px, 70vh) at 50% 40%, rgba(70, 44, 16, 0.35), transparent 70%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      <motion.div className={styles.tint} style={{ background: tintColor }} />
      <motion.div className={styles.glow} style={{ background: glow }} />
    </div>
  );
}
