"use client";

import { motion, useScroll, useReducedMotion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";
import ScrambleText from "@/components/ui/ScrambleText";
import Button from "@/components/ui/Button";
import OrnamentalDivider from "./OrnamentalDivider";
import ConjuringCircle from "./ConjuringCircle";
import styles from "./CoverPage.module.css";

const RUNIC_ALPHABET = "ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛝ ᛟ ᛞ";

const REPO_URL = "https://github.com/Aaen-Studios/galdr";

interface Props {
  version?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CoverPage({ version }: Props) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [hintHidden, setHintHidden] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (y) => {
      if (y > window.innerHeight * 0.8) setHintHidden(true);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const scrollHint = (
    <p className={styles.scrollHint} aria-hidden="true">
      ᚨ turn the page
    </p>
  );

  // Shared CTA row — used by both branches.
  const actions = (children: ReactNode) => (
    <div className={styles.actions}>
      <Button href="#download" rune="ᚷ">acquire the grimoire</Button>
      {version && <span className={styles.version}>v{version}</span>}
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ossBadge}
        title="galdr is free & open source — view on GitHub"
      >
        ◆ open source
      </a>
      {children}
    </div>
  );

  const githubLink = (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.githubLink}
    >
      view on github
    </a>
  );

  // Static (reduced motion) render
  if (reduced) {
    return (
      <section className={styles.cover}>
        <p className={styles.runicLine} aria-hidden="true">
          {RUNIC_ALPHABET}
        </p>

        <div className={styles.inner}>
          <h1 className={styles.heading}>galdr</h1>
          <p className={styles.tagline}>media incantations</p>

          <ConjuringCircle />

          {actions(githubLink)}
        </div>

        <OrnamentalDivider rune="ᛟ" />
        {!hintHidden && scrollHint}
      </section>
    );
  }

  return (
    <section className={styles.cover}>
      <motion.p
        className={styles.runicLine}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {RUNIC_ALPHABET}
      </motion.p>

      <div className={styles.inner}>
        <ScrambleText text="galdr" as="h1" className={styles.heading} load />

        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
        >
          media incantations
        </motion.p>

        <motion.div
          className={styles.circleSlot}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.9, ease: EASE }}
        >
          <ConjuringCircle />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6, ease: EASE }}
        >
          {actions(githubLink)}
        </motion.div>
      </div>

      <OrnamentalDivider rune="ᛟ" />
      {!hintHidden && scrollHint}
    </section>
  );
}
