export function trackEvent(type: string, metadata?: Record<string, string>) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    eventType: type,
    metadata,
    pagePath: window.location.pathname,
    referrer: document.referrer || undefined,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}
