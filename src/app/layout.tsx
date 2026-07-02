import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://galdr.app"),
  title: "galdr - media incantations",
  description:
    "A desktop GUI wrapper around FFmpeg for converting and manipulating video, audio, and image files. Terminal aesthetic. Runic theme.",
  openGraph: {
    title: "galdr - media incantations",
    description:
      "A desktop GUI wrapper around FFmpeg. Terminal aesthetic. Runic theme.",
    url: "https://galdr.app",
    siteName: "galdr",
  },
  twitter: {
    card: "summary",
    title: "galdr - media incantations",
    description:
      "A desktop GUI wrapper around FFmpeg. Terminal aesthetic. Runic theme.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "galdr",
              operatingSystem: "Windows, macOS, Linux",
              applicationCategory: "Multimedia",
              description:
                "A desktop GUI wrapper around FFmpeg for converting and manipulating media files.",
              url: "https://galdr.app",
              downloadUrl:
                "https://github.com/Aaen-Studios/galdr/releases/latest",
            }),
          }}
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