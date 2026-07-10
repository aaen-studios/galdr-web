export default function FAQ() {
  return (
    <>
      <h1>Frequently Asked Questions</h1>

      <h2>Is galdr free?</h2>
      <p>
        Yes. galdr is free and open source software, licensed under MIT. The
        source code is available on{" "}
        <a href="https://github.com/aaen-studios/galdr" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>

      <h2>What platforms are supported?</h2>
      <p>
        Windows (x64), macOS (x64 & ARM), and Linux (x64 & ARM) are supported.
        See the <a href="/docs/getting-started">Getting Started</a> guide for
        installation instructions.
      </p>

      <h2>Does galdr use hardware acceleration?</h2>
      <p>
        Yes. galdr supports hardware encoding via the same FFmpeg backends —
        NVENC (NVIDIA), AMF (AMD), QSV (Intel), and VideoToolbox (Apple).
        Hardware acceleration is available as an option in the conversion
        settings.
      </p>

      <h2>Is my data safe with the subtitle transcription?</h2>
      <p>
        Yes. galdr uses local Whisper models for speech recognition. No audio
        data is sent to any server — everything runs entirely on your machine.
      </p>

      <h2>Can I use galdr in a command-line / headless environment?</h2>
      <p>
        galdr is a GUI application, but the FFmpeg commands it generates can be
        copied from the Command Alchemy panel and used directly in scripts.
        For a fully headless workflow, we recommend using FFmpeg directly.
      </p>

      <h2>What is a .galdr file?</h2>
      <p>
        A <code>.galdr</code> file is a portable project file in JSON format.
        It stores all of your editing decisions — source files, timestamps,
        effects, export settings — so you can reopen and continue working later,
        or share the project with collaborators.
      </p>

      <h2>How do I report a bug or request a feature?</h2>
      <p>
        Open an issue on the{" "}
        <a href="https://github.com/aaen-studios/galdr/issues" target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>
        . Please include your platform, galdr version, and steps to reproduce.
      </p>

      <h2>Can I contribute?</h2>
      <p>
        Absolutely. The project is open source and contributions are welcome.
        Check the repository for contributing guidelines and open issues tagged
        with &ldquo;good first issue&rdquo;.
      </p>

      <h2>Where can I find the changelog?</h2>
      <p>
        The <a href="/changelog">Annals</a> page lists every release with
        detailed notes on what changed.
      </p>
    </>
  );
}
