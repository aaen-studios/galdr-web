"use client";

import { motion, useScroll, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./BackToTop.module.css";

export default function BackToTop() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (y) => {
      setVisible(y > window.innerHeight * 2);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const button = reduced ? (
    visible && (
      <button className={styles.button} onClick={handleClick} aria-label="Back to top">
        <span className={styles.rune} aria-hidden="true">ᛏ</span>
      </button>
    )
  ) : (
    <AnimatePresence>
      {visible && (
        <motion.button
          className={styles.button}
          onClick={handleClick}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.rune} aria-hidden="true">ᛏ</span>
        </motion.button>
      )}
    </AnimatePresence>
  );

  return button;
}
