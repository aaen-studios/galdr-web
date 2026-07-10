"use client";

import Chapter from "@/components/grimoire/Chapter";
import Card from "@/components/ui/Card";
import styles from "./WatchSection.module.css";

const STEPS = [
  { rune: "ᚠ", label: "Drop", desc: "Drop a file into the watched folder" },
  { rune: "ᚲ", label: "Detect", desc: "galdr detects the new arrival" },
  { rune: "ᛏ", label: "Settle", desc: "Waits for the write to finish" },
  { rune: "ᚷ", label: "Convert", desc: "Auto-converts or queues for review" },
];

export default function WatchSection() {
  return (
    <Chapter id="watch" heading="the watch" rune="ᛏ">
      <Card>
        <p className={styles.intro}>
          A folder-watching daemon that monitors directories for new media files
          and automatically converts them. Runs in the system tray — set it and
          forget it.
        </p>

        <div className={styles.pipeline}>
          {STEPS.map((step, i) => (
            <div key={step.label} className={styles.step}>
              <div className={styles.stepBox}>
                <span className={styles.stepRune} aria-hidden="true">
                  {step.rune}
                </span>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              <p className={styles.stepDesc}>{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className={styles.arrow} aria-hidden="true">
                  <span className={styles.arrowSymbol}>→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </Chapter>
  );
}
