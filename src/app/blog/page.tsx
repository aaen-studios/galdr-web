export default function BlogIndex() {
  return (
    <>
      <h1>The Scrolls</h1>
      <p>
        Tutorials, release notes, and explorations of media incantation.
      </p>

      <hr />

      <article>
        <h2>
          <a href="/blog/welcome-to-the-grimoire" style={{ textDecoration: "none", color: "inherit" }}>
            Welcome to the Grimoire
          </a>
        </h2>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--fg-faint)", marginBottom: "8px" }}>
          2026-07-10
        </p>
        <p>
          An introduction to galdr — what it is, why it exists, and how it turns
          FFmpeg into a spellcasting experience.
        </p>
        <p>
          <a href="/blog/welcome-to-the-grimoire">Read more →</a>
        </p>
      </article>

      <hr />

      <p style={{ color: "var(--fg-faint)", fontStyle: "italic", textAlign: "center", marginTop: "48px" }}>
        More scrolls are being written...
      </p>
    </>
  );
}
