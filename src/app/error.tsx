"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          <span style={{ fontSize: "4rem" }}>😵</span>
          <h1 style={{ fontSize: "2rem", marginTop: "1rem" }}>Etwas ist schiefgelaufen</h1>
          <p style={{ color: "#0042AF99", marginTop: "0.5rem" }}>
            Ein unerwarteter Fehler ist aufgetreten.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0042AF",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Erneut versuchen
          </button>
        </main>
      </body>
    </html>
  );
}
