"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import styles from "./Button.module.css";

interface Props {
  children: React.ReactNode;
  href?: string;
  className?: string;
  /** Rune character to display before the label */
  rune?: string;
}

export default function Button({ children, href, className = "", rune }: Props) {
  const motionProps: HTMLMotionProps<"a"> & HTMLMotionProps<"button"> = {
    className: `${styles.button} ${className}`,
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };

  const content = (
    <>
      {rune && <span className={styles.rune} aria-hidden="true">{rune}</span>}
      <span className={styles.label}>{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a href={href} {...(motionProps as HTMLMotionProps<"a">)}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button {...(motionProps as HTMLMotionProps<"button">)}>
      {content}
    </motion.button>
  );
}
