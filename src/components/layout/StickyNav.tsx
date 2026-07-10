"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import styles from "./StickyNav.module.css";

const NAV_LINKS = [
  { label: "Foreword", href: "#about" },
  { label: "Spells", href: "#spells" },
  { label: "Forge", href: "#forge" },
  { label: "Subtitles", href: "#subtitles" },
  { label: "Alchemy", href: "#alchemy" },
  { label: "Watch", href: "#watch" },
  { label: "Acquisition", href: "#download" },
];

export default function StickyNav() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [0, 1]);

  if (reduced) return null;

  return (
    <motion.nav
      className={styles.nav}
      style={{ opacity }}
      aria-label="Table of contents"
    >
      <div className={styles.inner}>
        <a href="#" className={styles.brand} aria-label="Back to top">
          <span className={styles.brandRune} aria-hidden="true">ᚷ</span>
          <span className={styles.brandText}>galdr</span>
        </a>

        <ul className={styles.links} role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
