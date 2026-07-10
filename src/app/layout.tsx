import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* ── Self-hosted fonts ── */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

/* ── Meta ── */
export const viewport: Viewport = {
  themeColor: "#0a0806",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://galdr.app"),
  title: "galdr — media incantations",
  description:
    "A desktop GUI wrapper around FFmpeg for converting and manipulating video, audio, and image files. Terminal aesthetic. Runic theme.",
  openGraph: {
    title: "galdr — media incantations",
    description:
      "A desktop GUI wrapper around FFmpeg. Terminal aesthetic. Runic theme.",
    url: "https://galdr.app",
    siteName: "galdr",
  },
  twitter: {
    card: "summary",
    title: "galdr — media incantations",
    description:
      "A desktop GUI wrapper around FFmpeg. Terminal aesthetic. Runic theme.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ── Structured data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "galdr",
  operatingSystem: "Windows, macOS, Linux",
  applicationCategory: "Multimedia",
  description:
    "A desktop GUI wrapper around FFmpeg for converting and manipulating media files.",
  url: "https://galdr.app",
  downloadUrl: "https://github.com/aaen-studios/galdr/releases/latest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
