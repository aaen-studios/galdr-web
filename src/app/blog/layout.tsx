import type { Metadata } from "next";
import OrnamentalDivider from "@/components/grimoire/OrnamentalDivider";
import "../docs/docs.css";

export const metadata: Metadata = {
  title: "The Scrolls — galdr blog",
  description:
    "Tutorials, updates, and deep dives into galdr — the desktop GUI wrapper around FFmpeg.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="docs-nav" aria-label="Blog navigation">
        <div className="docs-nav-inner">
          <a href="/blog" className="docs-nav-brand">
            <span aria-hidden="true" className="docs-nav-rune">ᚨ</span>
            The Scrolls
          </a>
          <ul className="docs-nav-links" role="list">
            <li>
              <a href="/" className="docs-nav-back">
                ← Back to Grimoire
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <main className="docs-main">
        <div className="docs-content">{children}</div>
      </main>
      <footer className="docs-footer">
        <OrnamentalDivider rune="ᛟ" />
        <p className="docs-footer-text">
          <a href="/">← Return to the grimoire</a>
        </p>
      </footer>
    </>
  );
}
