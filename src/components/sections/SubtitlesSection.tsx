"use client";

import Chapter from "@/components/grimoire/Chapter";
import Card from "@/components/ui/Card";
import styles from "./SubtitlesSection.module.css";

const FEATURES = [
  {
    rune: "ᚲ",
    title: "auto-transcribe",
    desc: "Local Whisper models generate subtitles from any audio or video. No data leaves your machine.",
  },
  {
    rune: "ᚷ",
    title: "burn-in & mux",
    desc: "Hardcode subtitles into the video stream, or multiplex them as soft tracks.",
  },
  {
    rune: "ᚠ",
    title: "extract existing",
    desc: "Pull subtitle tracks from existing files and export as SRT, VTT, or ASS.",
  },
  {
    rune: "ᛏ",
    title: "live editor",
    desc: "Preview subtitles against the video timeline. Adjust timing, styling, and positioning.",
  },
];

export default function SubtitlesSection() {
  return (
    <Chapter id="subtitles" heading="subtitles" rune="ᚨ">
      <Card>
        <p className={styles.intro}>
          Auto-transcription powered by local Whisper models. Generate, edit,
          burn-in, mux, or extract subtitle tracks — all offline.
        </p>
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.feature}>
              <p className={styles.featureRune} aria-hidden="true">{f.rune}</p>
              <p className={styles.featureTitle}>{f.title}</p>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </Chapter>
  );
}
