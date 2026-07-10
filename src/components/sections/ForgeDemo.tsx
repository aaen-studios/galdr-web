"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ForgeDemo.module.css";

const TRACK_LABELS = ["VIDEO", "AUDIO", "FX"];

/**
 * Deterministic pseudo-random from a seed (for stable clip positions).
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Return deterministic left + width for a track's clip. */
function clipStyle(trackIndex: number, clipIndex: number) {
  const seed = trackIndex * 100 + clipIndex * 10;
  const left = 8 + seededRandom(seed) * 22;
  const width = 20 + seededRandom(seed + 1) * 40;
  return { left: `${left}%`, width: `${width}%` };
}

/**
 * Evolved Forge demo — animated ASCII timeline editor.
 * Shows a multi-track timeline with a cycling progress bar.
 */
export default function ForgeDemo() {
  const [progress, setProgress] = useState(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedRef.current) return;

    const interval = setInterval(() => {
      setProgress((p) => (p >= 99 ? 0 : p + 1));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const barLength = 20;
  const filled = Math.round((progress / 100) * barLength);
  const bar =
    "█".repeat(filled) + "░".repeat(barLength - filled);

  return (
    <div className={styles.demo} aria-label="Forge timeline editor preview">
      {/* Title bar */}
      <div className={styles.titleBar}>
        <span className={styles.titleRune} aria-hidden="true">ᚹ</span>
        <span className={styles.titleText}>forge — timeline</span>
        <span className={styles.titleButtons} aria-hidden="true">_ □ X</span>
      </div>

      {/* Timeline tracks */}
      <div className={styles.timeline}>
        {TRACK_LABELS.map((label, ti) => (
          <div key={label} className={styles.track}>
            <span className={styles.trackLabel}>{label}</span>
            <div className={styles.trackBar}>
              <div
                className={styles.trackClip}
                style={clipStyle(ti, 0)}
              />
              <div
                className={styles.trackClip}
                style={clipStyle(ti, 1)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Time ruler */}
      <div className={styles.ruler}>
        <span>00:00</span>
        <span>00:10</span>
        <span>00:20</span>
        <span>00:30</span>
        <span>00:40</span>
      </div>

      {/* Status bar */}
      <div className={styles.status}>
        <span className={styles.statusRune} aria-hidden="true">ᚲ</span>
        <span className={styles.statusText}>rendering preview</span>
        <span className={styles.statusBar}>{bar}</span>
        <span className={styles.statusPercent}>{progress}%</span>
      </div>
    </div>
  );
}
