import { ImageResponse } from "next/og";

export const alt = "Wunschkiste - Wünsche teilen, Freunde schenken.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          backgroundColor: "#FEF1D0",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#0042AF",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FEF1D0",
              fontSize: "48px",
              fontWeight: 700,
            }}
          >
            W
          </div>
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#0042AF",
            marginBottom: "16px",
          }}
        >
          Wunschkiste
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#0042AF",
            opacity: 0.7,
          }}
        >
          Wunschlisten erstellen und teilen
        </div>
      </div>
    ),
    { ...size }
  );
}
