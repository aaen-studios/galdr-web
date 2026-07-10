import type { Release } from "@/lib/github";
import { matchAsset } from "@/lib/github";
import DownloadSectionClient from "./DownloadSectionClient";

interface Props {
  release: Release | null;
}

interface PlatformInfo {
  os: string;
  rune: string;
  asset: { name: string; url: string; size: number } | null;
}

export default function DownloadSection({ release }: Props) {
  const version = release?.tag_name ?? "";

  const platforms: PlatformInfo[] = [
    {
      os: "Windows",
      rune: "ᚹ",
      asset: release
        ? (() => {
          const a = matchAsset(release.assets, [".msi"]);
          return a
            ? { name: a.name, url: a.browser_download_url, size: a.size }
            : null;
        })()
        : null,
    },
    {
      os: "macOS",
      rune: "ᚨ",
      asset: release
        ? (() => {
          const a = matchAsset(release.assets, [".dmg"]);
          return a
            ? { name: a.name, url: a.browser_download_url, size: a.size }
            : null;
        })()
        : null,
    },
    {
      os: "Linux",
      rune: "ᛟ",
      asset: release
        ? (() => {
          const a =
            matchAsset(release.assets, [".AppImage"]) ||
            matchAsset(release.assets, [".deb"]);
          return a
            ? { name: a.name, url: a.browser_download_url, size: a.size }
            : null;
        })()
        : null,
    },
  ];

  const hasAnyAsset = platforms.some((p) => p.asset !== null);

  return (
    <DownloadSectionClient
      version={version}
      platforms={platforms}
      releaseBody={release?.body ?? null}
      releaseUrl={release?.html_url ?? "https://github.com/aaen-studios/galdr/releases/latest"}
      hasAnyAsset={hasAnyAsset}
    />
  );
}
