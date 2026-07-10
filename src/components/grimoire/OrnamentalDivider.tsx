import styles from "./OrnamentalDivider.module.css";

interface Props {
  /** Rune character to repeat (default: ᛟ) */
  rune?: string;
  /** If true, renders a more ornate chapter-level divider */
  chapter?: boolean;
  className?: string;
}

export default function OrnamentalDivider({
  rune = "ᛟ",
  chapter = false,
  className = "",
}: Props) {
  const runes = Array.from({ length: chapter ? 16 : 12 }, () => rune).join(" ");

  return (
    <div
      className={`${styles.divider} ${chapter ? styles.chapter : ""} ${className}`}
      aria-hidden="true"
      role="separator"
    >
      <span className={styles.line} />
      <span className={styles.runes}>{runes}</span>
      <span className={styles.line} />
    </div>
  );
}
