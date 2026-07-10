export default function DocsHome() {
  return (
    <>
      <h1>The Codex</h1>
      <p>
        Welcome to the galdr documentation. Here you&apos;ll find everything you
        need to install, configure, and master the art of media incantation.
      </p>

      <h2>Contents</h2>
      <ul>
        <li>
          <a href="/docs/getting-started">Getting Started</a> — Install galdr
          and run your first conversion.
        </li>
        <li>
          <a href="/docs/features">Features</a> — Deep dives into every spell in
          the grimoire.
        </li>
        <li>
          <a href="/docs/faq">FAQ</a> — Common questions and troubleshooting.
        </li>
      </ul>

      <h2>Quick Start</h2>
      <p>
        Download galdr for your platform from the{" "}
        <a href="/#download">Acquisition</a> section, install it, and you&apos;re
        ready to cast your first incantation.
      </p>
      <pre>{`# Convert a video to WebM
galdr input.mp4 --format webm

# Compress with quality control
galdr compress input.mp4 --quality 60

# Inspect a media file
galdr inspect input.mkv`}</pre>

      <h2>About the Grimoire</h2>
      <p>
        galdr is free and open source software, built with Tauri, React, and
        Rust. It uses FFmpeg under the hood for all media processing. The source
        code is available on{" "}
        <a href="https://github.com/aaen-studios/galdr" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
    </>
  );
}
