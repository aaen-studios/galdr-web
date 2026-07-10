import type { Metadata } from "next";
import ParticleField from "@/components/grimoire/ParticleField";
import ChangelogSection from "@/components/changelog/ChangelogSection";
import BackToTop from "@/components/layout/BackToTop";
import { getAllReleases } from "@/lib/github";

export const metadata: Metadata = {
  title: "The Annals — galdr changelog",
  description: "Release history and changelog for galdr — media incantations.",
  openGraph: {
    title: "The Annals — galdr changelog",
    description: "Release history and changelog for galdr — media incantations.",
  },
  twitter: {
    title: "The Annals — galdr changelog",
    description: "Release history and changelog for galdr — media incantations.",
  },
};

export default async function ChangelogPage() {
  const initialReleases = await getAllReleases();

  return (
    <>
      <ParticleField />
      <main id="main">
        <ChangelogSection initialReleases={initialReleases} />
      </main>
      <BackToTop />
    </>
  );
}
