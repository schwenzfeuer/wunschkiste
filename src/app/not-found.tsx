import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="de">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#FEF1D0",
          color: "#0042AF",
        }}>
          <span style={{ fontSize: "4rem" }}>🎁</span>
          <h1 style={{ fontSize: "2rem", marginTop: "1rem" }}>Seite nicht gefunden</h1>
          <p style={{ color: "#0042AF99", marginTop: "0.5rem" }}>
            Diese Seite existiert leider nicht.
          </p>
          <Link
            href="/"
            style={{
              marginTop: "1.5rem",
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0042AF",
              color: "white",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Zur Startseite
          </Link>
        </main>
      </body>
    </html>
  );
}
