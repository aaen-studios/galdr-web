import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrnamentalDivider from "@/components/grimoire/OrnamentalDivider";

/* ── Blog post data (eventually from MDX/content layer) ── */
const POSTS: Record<string, { title: string; date: string; content: string }> = {
  "welcome-to-the-grimoire": {
    title: "Welcome to the Grimoire",
    date: "2026-07-10",
    content: `
      <p>Welcome, conjurer.</p>
      <p>
        <strong>galdr</strong> is a desktop GUI wrapper around FFmpeg. It converts
        and manipulates video, audio, and image files — but it frames every
        operation as an incantation. Raw media in, enchanted media out.
      </p>
      <p>
        The name comes from Old Norse <em>galdr</em>, meaning "magical incantation."
        The terminal aesthetic and Elder Futhark runes aren't just decoration —
        they're a design language that makes the tool feel intentional and
        cohesive.
      </p>
      <h3>Why another FFmpeg GUI?</h3>
      <p>
        FFmpeg is incredibly powerful, but its command-line interface is
        notoriously opaque. Existing GUIs either oversimplify (hiding important
        settings) or replicate the complexity without adding clarity. galdr
        strikes a balance: a terminal-inspired interface that gives you full
        control without requiring you to memorize flags.
      </p>
      <h3>What's inside</h3>
      <ul>
        <li><strong>Convert & Compress</strong> — batch conversions with live quality estimation</li>
        <li><strong>The Forge</strong> — a non-linear video editor with a timeline</li>
        <li><strong>Subtitles</strong> — Whisper-powered transcription, all local</li>
        <li><strong>Command Alchemy</strong> — real-time FFmpeg command builder</li>
        <li><strong>The Watch</strong> — folder monitoring for automated conversion</li>
      </ul>
      <p>
        galdr is free, open source, and built with Tauri, React, and Rust.
        It runs on Windows, macOS, and Linux.
      </p>
      <p>
        <a href="/#download">Download the grimoire</a> and cast your first
        incantation.
      </p>
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Post not found — galdr" };

  return {
    title: `${post.title} — galdr`,
    description: `Read "${post.title}" on the galdr blog.`,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) {
    notFound();
  }

  return (
    <article>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "var(--fg-faint)",
          marginBottom: "8px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {post.date}
      </p>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      <OrnamentalDivider rune="ᛟ" />
      <p>
        <a href="/blog">← Back to The Scrolls</a>
      </p>
    </article>
  );
}
