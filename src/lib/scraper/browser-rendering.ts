export function isBrowserRenderingAvailable(): boolean {
  return (
    !!process.env.CLOUDFLARE_ACCOUNT_ID &&
    !!process.env.CLOUDFLARE_BR_API_TOKEN
  );
}

export async function renderWithBrowser(
  url: string
): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_BR_API_TOKEN;

  if (!accountId || !apiToken) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/content`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          rejectResourceTypes: ["image", "font", "media"],
          gotoOptions: { waitUntil: "networkidle0" },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      console.error(
        `Browser rendering failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error("Browser rendering error:", error);
    return null;
  }
}
