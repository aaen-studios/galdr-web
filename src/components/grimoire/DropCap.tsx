import styles from "./DropCap.module.css";

interface Props {
  children: string;
  className?: string;
}

/**
 * Renders the first character as a large illuminated initial (drop cap),
 * with the rest of the text inline.
 */
export default function DropCap({ children, className = "" }: Props) {
  if (!children) return null;

  const first = children.charAt(0);
  const rest = children.slice(1);

  return (
    <span className={`${styles.wrapper} ${className}`}>
      <span className={styles.cap} aria-hidden="true">{first}</span>
      <span className={styles.rest}>{rest}</span>
    </span>
  );
}
