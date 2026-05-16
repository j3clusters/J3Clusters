import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #ffffff 0%, #e6f3fc 46%, #d4e8f8 100%)",
          borderRadius: 40,
          border: "4px solid #008cd2",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 78,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 26%, #6fd4ff 0%, #00aeff 30%, #006bb8 100%)",
            border: "3px solid #ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 26,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 26%, #84ee84 0%, #32cd32 30%, #15803d 100%)",
            border: "3px solid #ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 26,
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 26%, #ffc98a 0%, #fb923c 30%, #dc2626 100%)",
            border: "3px solid #ffffff",
          }}
        />
      </div>
    ),
    size,
  );
}
