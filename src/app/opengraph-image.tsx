import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "J3 Clusters — verified property marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 45%, #22c55e 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.9,
            marginBottom: 16,
          }}
        >
          Verified property marketplace
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
          J3 Clusters
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 24,
            maxWidth: 720,
            lineHeight: 1.4,
            opacity: 0.95,
          }}
        >
          Buy, rent, and list apartments, villas, plots and PG across India
        </div>
      </div>
    ),
    { ...size },
  );
}
