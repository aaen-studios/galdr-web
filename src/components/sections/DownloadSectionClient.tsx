"use client";

import { motion, useReducedMotion } from "framer-motion";
import Chapter from "@/components/grimoire/Chapter";
import Button from "@/components/ui/Button";
import styles from "./DownloadSectionClient.module.css";

interface PlatformInfo {
  os: string;
  rune: string;
  asset: { name: string; url: string; size: number } | null;
}

interface Props {
  version: string;
  platforms: PlatformInfo[];
  releaseBody: string | null;
  releaseUrl: string;
  hasAnyAsset: boolean;
}

function formatSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function DownloadSectionClient({
  version,
  platforms,
  releaseBody,
  releaseUrl,
  hasAnyAsset,
}: Props) {
  const reduced = useReducedMotion();

  if (!hasAnyAsset) {
    return (
      <Chapter id="download" heading="acquisition" rune="ᚷ">
        <div className={styles.fallback}>
          <p className={styles.fallbackText}>
            No release assets available yet. Check back soon or visit the
            repository to build from source.
          </p>
          <Button href="https://github.com/aaen-studios/galdr" rune="ᚷ">
            view on github
          </Button>
        </div>
      </Chapter>
    );
  }

  return (
    <Chapter id="download" heading="acquisition" rune="ᚷ">
      <p className={styles.version}>
        <span className={styles.versionLabel}>Latest release</span>
        <span className={styles.versionTag}>{version}</span>
      </p>

      <div className={styles.grid}>
        {platforms.map((platform, i) => (
          <motion.div
            key={platform.os}
            className={`${styles.card} ${!platform.asset ? styles.disabled : ""}`}
            variants={reduced ? undefined : cardVariants}
            initial={reduced ? undefined : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            custom={i}
            viewport={{ once: true }}
          >
            <p className={styles.cardRune} aria-hidden="true">
              {platform.rune}
            </p>
            <p className={styles.cardOs}>{platform.os}</p>
            {platform.asset ? (
              <>
                <p className={styles.cardFile}>{platform.asset.name}</p>
                <Button href={platform.asset.url} rune="ᚷ">
                  download
                </Button>
                <p className={styles.cardSize}>
                  {formatSize(platform.asset.size)}
                </p>
              </>
            ) : (
              <p className={styles.cardEmpty}>Not available yet</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Package manager hints */}
      <div className={styles.pm}>
        <p className={styles.pmLine}>&gt; winget install galdr  {"# Windows (coming soon)"}</p>
        <p className={styles.pmLine}>&gt; brew install galdr    {"# macOS (coming soon)"}</p>
        <p className={styles.pmLine}>&gt; sudo apt install galdr {"# Linux (coming soon)"}</p>
      </div>

      {/* Mini changelog */}
      {releaseBody && (
        <details className={styles.changelog}>
          <summary className={styles.changelogSummary}>
            <span className={styles.changelogRune} aria-hidden="true">ᚨ</span>
            What&apos;s in this release
          </summary>
          <div className={styles.changelogBody}>
            <pre className={styles.changelogText}>{releaseBody}</pre>
            <a
              href={releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.changelogLink}
            >
              view full changelog →
            </a>
          </div>
        </details>
      )}
    </Chapter>
  );
}
