"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        fontFamily: `"Courier New", "Liberation Mono", monospace`,
        color: "#c8c8c8",
        background: "#000",
      }}
    >
      <p aria-hidden="true" style={{ fontSize: "2rem", marginBottom: "16px", color: "#6a6a6a" }}>
        ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛝ ᛟ ᛞ
      </p>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>the grimoire flickers</h1>
      <p style={{ color: "#6a6a6a", marginBottom: "24px", maxWidth: "480px" }}>
        An unexpected incantation went awry. The page may be restored with a fresh attempt.
      </p>
      <button
        onClick={reset}
        style={{
          background: "#c8c8c8",
          color: "#000",
          border: "none",
          padding: "12px 24px",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          cursor: "pointer",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        ᚲ try again
      </button>
    </main>
  );
}
