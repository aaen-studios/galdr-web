import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const dynamic = "force-static";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0806",
          color: "#e8e0d4",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Top runic accent line */}
        <div
          style={{
            position: "absolute",
            top: 40,
            fontSize: 16,
            letterSpacing: "0.3em",
            color: "#3a342e",
            fontFamily: "monospace",
          }}
        >
          ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛝ ᛟ ᛞ
        </div>

        <div
          style={{
            fontSize: 96,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#e8e0d4",
            marginBottom: 8,
          }}
        >
          galdr
        </div>

        {/* Gold decorative line */}
        <div
          style={{
            width: 120,
            height: 2,
            background: "#c9a84c",
            marginBottom: 16,
            opacity: 0.5,
          }}
        />

        <div
          style={{
            fontSize: 28,
            fontStyle: "italic",
            letterSpacing: "0.2em",
            color: "#8a7e72",
          }}
        >
          media incantations
        </div>

        {/* Bottom runic accent */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 12,
            letterSpacing: "0.3em",
            color: "#3a342e",
            fontFamily: "monospace",
          }}
        >
          ᚱ ᚨᚹ ᛗᛖᛞᛁᚨ ᛁᚾ, ᛖᚾᚲᚺᚨᚾᛏᛖᛞ ᛗᛖᛞᛁᚨ ᛟᚢᛏ
        </div>
      </div>
    ),
    { ...size }
  );
}
