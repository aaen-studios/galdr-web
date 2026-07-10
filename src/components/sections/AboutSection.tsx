"use client";

import Chapter from "@/components/grimoire/Chapter";
import Card from "@/components/ui/Card";
import DropCap from "@/components/grimoire/DropCap";
import styles from "./AboutSection.module.css";

export default function AboutSection() {
  return (
    <Chapter id="about" heading="foreword" rune="ᚨ" major>
      <Card terminal>
        <p>
          <DropCap>galdr</DropCap> is a desktop GUI wrapper around FFmpeg. It
          converts and manipulates video, audio, and image files with a terminal
          aesthetic and runic theme.
        </p>
        <p>
          Every conversion is an incantation. Raw media in, enchanted media out.
        </p>
        <p className={styles.line}>&gt; Built with Tauri, React, and Rust</p>
        <p className={styles.line}>&gt; Uses FFmpeg under the hood</p>
        <p className={styles.line}>&gt; Free and open source</p>
        <p className={styles.line}>&gt; Native .galdr project file format</p>
      </Card>
    </Chapter>
  );
}
