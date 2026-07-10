import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 — galdr",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        background: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-body), Georgia, serif",
      }}
    >
      <p
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "0.75rem",
          marginBottom: "24px",
          color: "var(--fg-faint)",
          letterSpacing: "0.3em",
        }}
      >
        ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛝ ᛟ ᛞ
      </p>

      <div style={{ marginBottom: "16px" }}>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "3rem",
            color: "var(--accent-dim)",
          }}
        >
          ᚠ
        </span>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-heading), Georgia, serif",
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "8px",
          color: "var(--fg)",
        }}
      >
        404 — The incantation failed
      </h1>

      <p
        style={{
          fontSize: "0.9375rem",
          color: "var(--fg-dim)",
          marginBottom: "32px",
          maxWidth: "480px",
          lineHeight: 1.6,
        }}
      >
        This page does not exist. The grimoire holds no record of this
        incantation.
      </p>

      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 20px",
          border: "1px solid var(--accent)",
          background: "transparent",
          color: "var(--accent)",
          fontFamily: "var(--font-heading), Georgia, serif",
          fontSize: "0.875rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textDecoration: "none",
          cursor: "pointer",
          transition: "background 0.25s, color 0.25s",
        }}
      >
        <span aria-hidden="true" style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.8em" }}>
          ᚷ
        </span>
        return to the grimoire
      </a>
    </main>
  );
}
