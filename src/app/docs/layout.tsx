import type { Metadata } from "next";
import OrnamentalDivider from "@/components/grimoire/OrnamentalDivider";
import "./docs.css";

export const metadata: Metadata = {
  title: "The Codex — galdr docs",
  description:
    "Documentation for galdr — a desktop GUI wrapper around FFmpeg. Learn how to install, configure, and use galdr.",
};

const NAV_LINKS = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/getting-started", label: "Getting Started" },
  { href: "/docs/features", label: "Features" },
  { href: "/docs/faq", label: "FAQ" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="docs-nav" aria-label="Documentation sections">
        <div className="docs-nav-inner">
          <a href="/docs" className="docs-nav-brand">
            <span aria-hidden="true" className="docs-nav-rune">ᚨ</span>
            The Codex
          </a>
          <ul className="docs-nav-links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="docs-nav-link">
                  {link.label}
                </a>
              </li>
            ))}
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
