"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import ScrambleText from "@/components/ui/ScrambleText";
import OrnamentalDivider from "@/components/grimoire/OrnamentalDivider";
import styles from "./FooterSection.module.css";

const RUNIC_ALPHABET = "ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛝ ᛟ ᛞ";

export default function FooterSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <motion.footer
      id="colophon"
      ref={ref}
      className={styles.footer}
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <OrnamentalDivider rune="ᛟ" chapter />

      <div className={styles.inner}>
        <ScrambleText
          text="ᛟ colophon"
          as="h3"
          className={styles.heading}
          trigger={inView}
        />

        <p className={styles.runicLine} aria-hidden="true">
          {RUNIC_ALPHABET}
        </p>

        <p className={styles.text}>
          Built with Tauri, React, and Rust
        </p>
        <p className={styles.text}>
          Licensed under MIT
        </p>

        <a
          href="https://github.com/aaen-studios/galdr"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          github.com/aaen-studios/galdr
        </a>

        <p className={styles.copy}>
          &copy; {new Date().getFullYear()} Aaen Studios. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
