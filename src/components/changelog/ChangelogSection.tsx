"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "framer-motion";
import type { Release } from "@/lib/github";
import { getReleasesPage } from "@/lib/github";
import ScrambleText from "@/components/ui/ScrambleText";
import OrnamentalDivider from "@/components/grimoire/OrnamentalDivider";
import styles from "./ChangelogSection.module.css";

interface Props {
  initialReleases: Release[];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return iso;
  }
}

function renderMarkdownSimple(body: string): React.ReactNode {
  // Lightweight markdown rendering for release notes
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith("```")) {
      if (inCode) {
        elements.push(
          <pre key={`code-${i}`} className={styles.codeBlock}>
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className={styles.bodyHeading}>
          {line.slice(4)}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className={styles.bodyHeading}>
          {line.slice(3)}
        </h3>
      );
      continue;
    }

    // List items
    if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ")) {
      const text = line.trimStart().slice(2);
      const rendered = renderInline(text);
      elements.push(
        <li key={i} className={styles.bodyListItem}>
          {rendered}
        </li>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className={styles.bodyParagraph}>
        {renderInline(line)}
      </p>
    );
  }

  // Close any unclosed code block
  if (inCode && codeLines.length > 0) {
    elements.push(
      <pre key="code-end" className={styles.codeBlock}>
        {codeLines.join("\n")}
      </pre>
    );
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Bold (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Inline code (`code`)
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith("`") && cp.endsWith("`")) {
        return <code key={`${i}-${j}`} className={styles.inlineCode}>{cp.slice(1, -1)}</code>;
      }
      return cp;
    });
  });
}

export default function ChangelogSection({ initialReleases }: Props) {
  const safeReleases = initialReleases ?? [];

  const [releases, setReleases] = useState<Release[]>(safeReleases);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(safeReleases.length >= 5);

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const nextPage = pageRef.current + 1;
      const data = await getReleasesPage(nextPage);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setReleases((prev) => [...prev, ...data]);
        pageRef.current = nextPage;
      }
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasMore]);

  if (safeReleases.length === 0) {
    return (
      <section className={styles.section}>
        <a href="/" className={styles.backLink}>← Back to Grimoire</a>
        <ScrambleText text="ᛉ The Annals" as="h1" className={styles.heading} trigger={inView} />
        <div className={styles.empty}>
          <p>No releases recorded yet.</p>
          <p>
            <a
              href="https://github.com/aaen-studios/galdr/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              View all releases on GitHub →
            </a>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} ref={sectionRef}>
      <a href="/" className={styles.backLink}>← Back to Grimoire</a>

      <ScrambleText
        text="ᛉ The Annals"
        as="h1"
        className={styles.heading}
        trigger={inView}
      />

      <p className={styles.subtitle}>
        Every release of galdr, recorded in the grimoire.
      </p>

      {releases.map((release, index) => (
        <motion.div
          key={release.tag_name}
          className={styles.release}
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.releaseHeader}>
            <span className={styles.versionBadge}>
              <span className={styles.versionRune} aria-hidden="true">ᚱ</span>
              {release.tag_name}
            </span>
            <span className={styles.dateBadge}>
              {formatDate(release.published_at)}
            </span>
            <a
              href={release.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              view on github ↗
            </a>
          </div>

          {release.body && (
            <div className={styles.body}>
              {renderMarkdownSimple(release.body)}
            </div>
          )}

          {index < releases.length - 1 && (
            <OrnamentalDivider rune="ᛟ" />
          )}
        </motion.div>
      ))}

      <div ref={sentinelRef} />

      {loading && (
        <div className={styles.loading}>ᚠ consulting the annals…</div>
      )}

      {!hasMore && releases.length > safeReleases.length && (
        <div className={styles.endMarker} aria-hidden="true">
          <OrnamentalDivider rune="ᛟ" />
          <p className={styles.endText}>ᛟ the annals are complete ᛟ</p>
        </div>
      )}
    </section>
  );
}
