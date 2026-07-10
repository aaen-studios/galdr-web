"use client";

import Chapter from "@/components/grimoire/Chapter";
import Card from "@/components/ui/Card";
import styles from "./AlchemySection.module.css";

export default function AlchemySection() {
  return (
    <Chapter id="alchemy" heading="command alchemy" rune="ᚲ">
      <Card terminal>
        <p>
          The FFmpeg command builds in real time as you tweak settings. Every
          slider, dropdown, and toggle updates the command string immediately.
          No more man-page spelunking.
        </p>
        <pre className={styles.command}>$ ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4</pre>
      </Card>
    </Chapter>
  );
}
