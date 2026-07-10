import styles from "./Card.module.css";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** If true, renders with terminal-style prefix lines */
  terminal?: boolean;
}

export default function Card({ children, className = "", terminal = false }: Props) {
  return (
    <div className={`${styles.card} ${terminal ? styles.terminal : ""} ${className}`}>
      {children}
    </div>
  );
}
