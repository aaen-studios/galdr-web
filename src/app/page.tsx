import CoverPage from "@/components/grimoire/CoverPage";
import ScrollBackground from "@/components/grimoire/ScrollBackground";
import AboutSection from "@/components/sections/AboutSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import ForgeSection from "@/components/sections/ForgeSection";
import SubtitlesSection from "@/components/sections/SubtitlesSection";
import AlchemySection from "@/components/sections/AlchemySection";
import WatchSection from "@/components/sections/WatchSection";
import DownloadSection from "@/components/sections/DownloadSection";
import FooterSection from "@/components/sections/FooterSection";
import StickyNav from "@/components/layout/StickyNav";
import BackToTop from "@/components/layout/BackToTop";
import ParticleField from "@/components/grimoire/ParticleField";
import { getRelease } from "@/lib/github";

export default async function Home() {
  const release = await getRelease();
  const version = release?.tag_name?.replace(/^v/i, "");

  return (
    <>
      <ScrollBackground />
      <ParticleField />
      <StickyNav />
      <main id="main">
        <CoverPage version={version} />
        <AboutSection />
        <FeaturesSection />
        <ForgeSection />
        <SubtitlesSection />
        <AlchemySection />
        <WatchSection />
        <DownloadSection release={release} />
        <FooterSection />
      </main>
      <BackToTop />
    </>
  );
}
