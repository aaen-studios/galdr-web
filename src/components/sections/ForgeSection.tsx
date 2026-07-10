"use client";

import Chapter from "@/components/grimoire/Chapter";
import Card from "@/components/ui/Card";
import ForgeDemo from "./ForgeDemo";
import styles from "./ForgeSection.module.css";

const FEATURES = [
  "Drag-and-drop timeline editing",
  "Trim, split, and rearrange clips",
  "Speed adjustment (0.25× – 4×)",
  "Export to MP4, MKV, and more",
  ".galdr project files — portable JSON",
];

export default function ForgeSection() {
  return (
    <Chapter id="forge" heading="the forge" rune="ᚹ">
      <Card>
        <p className={styles.intro}>
          A built-in non-linear video editor for quick cuts and compositions.
          The Forge gives you a timeline, multi-track support, and clip-level
          control without leaving the grimoire.
        </p>

        <ForgeDemo />

        <ul className={styles.features}>
          {FEATURES.map((f) => (
            <li key={f} className={styles.feature}>
              <span className={styles.bullet} aria-hidden="true">ᚹ</span>
              {f}
            </li>
          ))}
        </ul>
      </Card>
    </Chapter>
  );
}
