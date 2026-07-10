export default function GettingStarted() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Welcome, conjurer. This guide will walk you through installing galdr and
        running your first media incantation.
      </p>

      <h2>Installation</h2>

      <h3>Windows</h3>
      <p>
        Download the <code>.msi</code> installer from the{" "}
        <a href="/#download">Acquisition</a> section and run it. Follow the
        setup wizard — galdr will be available from your Start menu.
      </p>

      <h3>macOS</h3>
      <p>
        Download the <code>.dmg</code> file, open it, and drag galdr to your
        Applications folder. You may need to right-click and select Open the
        first time to bypass Gatekeeper.
      </p>

      <h3>Linux</h3>
      <p>
        Download the <code>.AppImage</code> or <code>.deb</code> package. For
        AppImage:
      </p>
      <pre>{`chmod +x galdr-*.AppImage
./galdr-*.AppImage`}</pre>
      <p>For Debian-based distributions:</p>
      <pre>{`sudo dpkg -i galdr-*.deb`}</pre>

      <h3>Package Managers (Coming Soon)</h3>
      <pre>{`# Windows
winget install galdr

# macOS
brew install galdr

# Linux
sudo apt install galdr`}</pre>

      <h2>Your First Incantation</h2>
      <p>
        Launch galdr. You&apos;ll be greeted by the main window — a terminal-styled
        interface where every conversion is framed as a spell.
      </p>
      <ol>
        <li>
          <strong>Select input:</strong> Click or drag a media file onto the
          INPUT field.
        </li>
        <li>
          <strong>Choose format:</strong> Pick your target format from the FORMAT
          dropdown (WebM, MP4, MKV, GIF, and more).
        </li>
        <li>
          <strong>Adjust quality:</strong> Use the QUALITY slider to control
          compression. The estimated output size updates live.
        </li>
        <li>
          <strong>Cast the spell:</strong> Click the ᚷ CONVERT button. The
          terminal output shows the FFmpeg command and progress.
        </li>
      </ol>
      <p>
        That&apos;s it. Your media has been transformed. Welcome to the
        grimoire.
      </p>

      <h2>Next Steps</h2>
      <ul>
        <li>Explore the <a href="/docs/features">Features</a> guide for deeper
        functionality.</li>
        <li>Check the <a href="/docs/faq">FAQ</a> for common questions.</li>
        <li>Visit the <a href="/changelog">Annals</a> to see what&apos;s new.</li>
      </ul>
    </>
  );
}
