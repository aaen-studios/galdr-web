"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import ScrambleText from "@/components/ui/ScrambleText";
import OrnamentalDivider from "./OrnamentalDivider";
import styles from "./Chapter.module.css";

interface Props {
  /** Section ID for anchor links */
  id: string;
  /** Heading text (displayed with ScrambleText) */
  heading: string;
  /** Rune prefix for the heading */
  rune?: string;
  /** Chapter number label (e.g., "Chapter I") */
  chapterLabel?: string;
  children: React.ReactNode;
  className?: string;
  /** If true, hides the decorative top divider */
  noDivider?: boolean;
  /** If true, renders a larger more ornate chapter intro */
  major?: boolean;
}

export default function Chapter({
  id,
  heading,
  rune,
  chapterLabel,
  children,
  className = "",
  noDivider = false,
  major = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <motion.section
      id={id}
      ref={ref}
      data-section={id}
      className={`${styles.chapter} ${major ? styles.major : ""} ${className}`}
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={reduced ? undefined : { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
      viewport={{ once: true, margin: "-80px" }}
    >
      {!noDivider && (
        <OrnamentalDivider chapter={major} rune={major ? "ᚠ" : "ᛟ"} />
      )}

      {chapterLabel && (
        <p className={styles.chapterLabel} aria-hidden="true">
          {chapterLabel}
        </p>
      )}

      <ScrambleText
        text={rune ? `${rune} ${heading}` : heading}
        as="h2"
        className={styles.heading}
        trigger={inView}
      />

      <div className={styles.content}>
        {children}
      </div>
    </motion.section>
  );
}
