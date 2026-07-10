"use client";

import { motion } from "framer-motion";
import Chapter from "@/components/grimoire/Chapter";
import ScrambleText from "@/components/ui/ScrambleText";
import styles from "./FeaturesSection.module.css";

const SPELLS = [
  {
    rune: "ᚲ",
    title: "convert",
    desc: "Single or batch conversion between any formats FFmpeg supports.",
    incantation: "> convert *.mp4 --to mkv",
  },
  {
    rune: "ᛏ",
    title: "compress",
    desc: "Quality-controlled compression with live size estimation.",
    incantation: "> compress input.mp4 --quality 60",
  },
  {
    rune: "ᚨ",
    title: "inspect",
    desc: "Deep media inspection via ffprobe. Codec, resolution, bitrate, and more.",
    incantation: "> inspect input.mkv",
  },
  {
    rune: "ᚷ",
    title: "trim",
    desc: "Cut, crop, rotate, resize, speed up, slow down. All the fundamentals.",
    incantation: "> trim input.mp4 --start 00:01:30 --end 00:02:15",
  },
  {
    rune: "ᚠ",
    title: "rune tags",
    desc: "Save presets as named runes. Reusable incantations for common workflows.",
    incantation: '> rune-save ᛏ youtube-h264',
  },
  {
    rune: "ᛟ",
    title: "compare",
    desc: "Side-by-side before/after preview. See the spell take effect.",
    incantation: "> compare input.mp4 output.mp4",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function FeaturesSection() {
  return (
    <Chapter id="spells" heading="spells" rune="ᚲ">
      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {SPELLS.map((spell) => (
          <motion.div key={spell.title} className={styles.card} variants={cardVariants}>
            <p className={styles.rune} aria-hidden="true">{spell.rune}</p>
            <ScrambleText
              text={spell.title}
              as="h3"
              className={styles.title}
              hover
            />
            <p className={styles.desc}>{spell.desc}</p>
            <p className={styles.incantation}>{spell.incantation}</p>
          </motion.div>
        ))}
      </motion.div>
    </Chapter>
  );
}
